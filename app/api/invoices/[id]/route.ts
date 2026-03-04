/**
 * Individual Invoice API Route Handler
 * Handles operations on individual invoices (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import {
  getInvoiceById,
  getInvoiceByIdForProductOwner,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsSent,
} from "@/prisma/invoice";
import { prisma } from "@/prisma/client";
import { updateInvoiceSchema } from "@/lib/validations";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { createAuditLog } from "@/prisma/audit-log";
import type { UpdateInvoiceInput } from "@/types";

/**
 * GET /api/invoices/:id
 * Fetch a single invoice by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: invoiceId } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const isAdmin = session.role === "admin";
    const isClient = session.role === "client";

    let invoice: Awaited<ReturnType<typeof getInvoiceById>> | null;
    if (isAdmin) {
      invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    } else if (isClient) {
      // Client can view invoices where they are the customer (clientId)
      invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, clientId: userId },
      });
    } else {
      invoice = await getInvoiceById(invoiceId, userId);
      if (!invoice) {
        invoice = await getInvoiceByIdForProductOwner(invoiceId, userId);
      }
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: invoice.orderId },
      include: {
        items: {
          include: {
            product: { select: { userId: true } },
          },
        },
      },
    });

    const partyUserIds = [
      invoice.userId,
      invoice.clientId,
      order?.userId,
      ...(order?.items ?? [])
        .map((item: { product?: { userId?: string } }) => item.product?.userId)
        .filter(Boolean),
    ].filter(Boolean) as string[];
    const uniqueIds = [...new Set(partyUserIds)];
    const partyUsers =
      uniqueIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(partyUsers.map((u) => [u.id, u]));

    const invoiceCreatedBy = userMap.get(invoice.userId)
      ? {
          name: userMap.get(invoice.userId)!.name ?? null,
          email: userMap.get(invoice.userId)!.email,
        }
      : null;
    const orderedBy = order && userMap.get(order.userId)
      ? {
          name: userMap.get(order.userId)!.name ?? null,
          email: userMap.get(order.userId)!.email,
        }
      : null;
    const client = invoice.clientId && userMap.get(invoice.clientId)
      ? {
          name: userMap.get(invoice.clientId)!.name ?? null,
          email: userMap.get(invoice.clientId)!.email,
        }
      : null;
    const productOwnerIds = [
      ...new Set(
        (order?.items ?? [])
          .map((item: { product?: { userId?: string } }) => item.product?.userId)
          .filter(Boolean),
      ),
    ] as string[];
    const invoiceProductOwners = productOwnerIds.map((id) => {
      const u = userMap.get(id);
      return u ? { userId: u.id, name: u.name ?? null, email: u.email } : null;
    }).filter(Boolean) as { userId: string; name: string | null; email: string }[];

    // Transform invoice for response
    const transformedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      userId: invoice.userId,
      clientId: invoice.clientId,
      status: invoice.status,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      shipping: invoice.shipping ?? null,
      discount: invoice.discount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      dueDate: invoice.dueDate.toISOString(),
      issuedAt: invoice.issuedAt.toISOString(),
      sentAt: invoice.sentAt?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      cancelledAt: invoice.cancelledAt?.toISOString() || null,
      paymentLink: invoice.paymentLink,
      notes: invoice.notes,
      billingAddress: invoice.billingAddress,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt?.toISOString() || null,
      createdBy: invoice.createdBy,
      updatedBy: invoice.updatedBy,
      invoiceCreatedBy,
      orderedBy,
      client,
      invoiceProductOwners,
    };

    return NextResponse.json(transformedInvoice);
  } catch (error) {
    logger.error("Error fetching invoice:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch invoice",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/invoices/:id
 * Update an existing invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const body = await request.json();

    // Validate request body
    const validationResult = updateInvoiceSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Invalid invoice update data", {
        errors: validationResult.error.errors,
      });
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const updateData: UpdateInvoiceInput = {
      ...validationResult.data,
      id,
    };

    // Update invoice
    const invoice = await updateInvoice(id, updateData, userId);

    createAuditLog({
      userId,
      action: "update",
      entityType: "invoice",
      entityId: id,
      details: { invoiceNumber: invoice.invoiceNumber },
    }).catch(() => {});

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    // Transform invoice for response
    const transformedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      userId: invoice.userId,
      clientId: invoice.clientId,
      status: invoice.status,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      shipping: invoice.shipping ?? null,
      discount: invoice.discount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      dueDate: invoice.dueDate.toISOString(),
      issuedAt: invoice.issuedAt.toISOString(),
      sentAt: invoice.sentAt?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      cancelledAt: invoice.cancelledAt?.toISOString() || null,
      paymentLink: invoice.paymentLink,
      notes: invoice.notes,
      billingAddress: invoice.billingAddress,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt?.toISOString() || null,
      createdBy: invoice.createdBy,
      updatedBy: invoice.updatedBy,
    };

    logger.info("Invoice updated successfully", {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      userId,
    });

    return NextResponse.json(transformedInvoice);
  } catch (error) {
    logger.error("Error updating invoice:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update invoice",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/invoices/:id
 * Delete an invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: invoiceId } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const existingInvoice = await getInvoiceById(invoiceId, userId);
    await deleteInvoice(invoiceId, userId);

    createAuditLog({
      userId,
      action: "delete",
      entityType: "invoice",
      entityId: invoiceId,
      details: existingInvoice ? { invoiceNumber: existingInvoice.invoiceNumber } : undefined,
    }).catch(() => {});

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    logger.info("Invoice deleted successfully", { invoiceId, userId });

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting invoice:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete invoice",
      },
      { status: 500 },
    );
  }
}

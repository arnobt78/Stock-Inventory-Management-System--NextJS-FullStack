/**
 * Support Ticket Detail API Route Handler
 * GET /api/support-tickets/:id — fetch one
 * PUT /api/support-tickets/:id — update
 * DELETE /api/support-tickets/:id — delete
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import {
  getSupportTicketById,
  updateSupportTicket,
  deleteSupportTicket,
} from "@/prisma/support-ticket";
import { updateSupportTicketSchema } from "@/lib/validations";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { createSupportTicketRepliedNotification } from "@/lib/notifications/in-app";
import { createAuditLog } from "@/prisma/audit-log";
import { prisma } from "@/prisma/client";
import type { SupportTicket, UpdateSupportTicketInput } from "@/types";

function baseTransform(
  r: Awaited<ReturnType<typeof getSupportTicketById>> & {},
  opts?: {
    creator?: { name: string | null; email: string } | null;
    assignedTo?: { name: string | null; email: string } | null;
  },
): SupportTicket {
  const created = new Date(r.createdAt);
  const ticketNumber = `TKT-${created.toISOString().slice(0, 10).replace(/-/g, "")}-${r.id.slice(-6)}`;
  return {
    id: r.id,
    subject: r.subject,
    description: r.description,
    status: r.status as SupportTicket["status"],
    priority: r.priority as SupportTicket["priority"],
    userId: r.userId,
    assignedToId: r.assignedToId,
    productId: r.productId,
    orderId: r.orderId,
    supplierId: r.supplierId,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt?.toISOString() ?? null,
    ticketNumber,
    creatorName: opts?.creator?.name ?? undefined,
    creatorEmail: opts?.creator?.email ?? undefined,
    assignedToName: opts?.assignedTo?.name ?? undefined,
    assignedToEmail: opts?.assignedTo?.email ?? undefined,
  };
}

/**
 * GET /api/support-tickets/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await getSupportTicketById(id);
    if (!record) {
      return NextResponse.json(
        { error: "Support ticket not found" },
        { status: 404 },
      );
    }
    const isCreator = record.userId === session.id;
    const isAssignee = record.assignedToId === session.id;
    // Only ticket creator or assigned-to (product owner) can view; admins only see if they are the assignee
    if (!isCreator && !isAssignee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [creator, assignedTo] = await Promise.all([
      prisma.user.findUnique({
        where: { id: record.userId },
        select: { name: true, email: true },
      }),
      record.assignedToId
        ? prisma.user.findUnique({
            where: { id: record.assignedToId },
            select: { name: true, email: true },
          })
        : null,
    ]);
    return NextResponse.json(
      baseTransform(record, {
        creator: creator ?? null,
        assignedTo: assignedTo ?? null,
      }),
    );
  } catch (error) {
    logger.error("Error fetching support ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch support ticket" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/support-tickets/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getSupportTicketById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Support ticket not found" },
        { status: 404 },
      );
    }
    const isCreator = existing.userId === session.id;
    const isAssignee = existing.assignedToId === session.id;
    if (!isCreator && !isAssignee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSupportTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const updatePayload: UpdateSupportTicketInput = {};
    if (data.status != null) updatePayload.status = data.status;
    if (data.priority != null) updatePayload.priority = data.priority;
    if (data.assignedToId !== undefined)
      updatePayload.assignedToId = data.assignedToId;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const updated = await updateSupportTicket(id, updatePayload);
    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    createAuditLog({
      userId: session.id,
      action: "update",
      entityType: "ticket",
      entityId: id,
      details: { subject: updated.subject },
    }).catch(() => {});

    // Notify ticket creator and/or assignee (excluding the updater), non-blocking
    const updaterId = session.id;
    const updaterDisplay =
      session.name?.trim() || session.email || "Someone";
    const toNotify: string[] = [];
    if (existing.userId && existing.userId !== updaterId) {
      toNotify.push(existing.userId);
    }
    if (
      updated.assignedToId &&
      updated.assignedToId !== updaterId &&
      !toNotify.includes(updated.assignedToId)
    ) {
      toNotify.push(updated.assignedToId);
    }
    if (toNotify.length > 0) {
      Promise.all(
        toNotify.map((userId) =>
          createSupportTicketRepliedNotification(
            userId,
            id,
            updated.subject,
            updaterDisplay,
          ),
        ),
      ).catch((err) => {
        logger.warn("Failed to create support ticket replied notifications", {
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    const [creator, assignedTo] = await Promise.all([
      prisma.user.findUnique({
        where: { id: updated.userId },
        select: { name: true, email: true },
      }),
      updated.assignedToId
        ? prisma.user.findUnique({
            where: { id: updated.assignedToId },
            select: { name: true, email: true },
          })
        : null,
    ]);
    return NextResponse.json(
      baseTransform(updated, {
        creator: creator ?? null,
        assignedTo: assignedTo ?? null,
      }),
    );
  } catch (error) {
    logger.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update support ticket" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/support-tickets/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getSupportTicketById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Support ticket not found" },
        { status: 404 },
      );
    }
    const isCreator = existing.userId === session.id;
    const isAssignee = existing.assignedToId === session.id;
    if (!isCreator && !isAssignee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteSupportTicket(id);
    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    createAuditLog({
      userId: session.id,
      action: "delete",
      entityType: "ticket",
      entityId: id,
      details: { subject: existing.subject },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting support ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete support ticket" },
      { status: 500 },
    );
  }
}

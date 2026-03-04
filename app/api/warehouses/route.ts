/**
 * Warehouses API Route Handler
 * App Router route handler for warehouse CRUD operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";
import { createAuditLog } from "@/prisma/audit-log";

/**
 * GET /api/warehouses
 * Fetch all warehouses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const warehouses = await prisma.warehouse.findMany({
      where: { userId },
    });

    return NextResponse.json(warehouses);
  } catch (error) {
    logger.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/warehouses
 * Create a new warehouse
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const body = await request.json();
    const { name, address, type, status } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse name is required" },
        { status: 400 },
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name.trim(),
        userId,
        address:
          address && typeof address === "string"
            ? address.trim() || null
            : null,
        type: type && typeof type === "string" ? type.trim() || null : null,
        status: status !== undefined ? Boolean(status) : true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: null,
      },
    });

    createAuditLog({
      userId,
      action: "create",
      entityType: "warehouse",
      entityId: warehouse.id,
      details: { name: warehouse.name },
    }).catch(() => {});

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    logger.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/warehouses
 * Update an existing warehouse
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const body = await request.json();
    const { id, name, address, type, status } = body;

    if (!id || !name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse ID and name are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.warehouse.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found or unauthorized" },
        { status: 404 },
      );
    }

    const updateData: {
      name: string;
      updatedBy: string;
      updatedAt: Date;
      address?: string | null;
      type?: string | null;
      status?: boolean;
    } = {
      name: name.trim(),
      updatedBy: userId,
      updatedAt: new Date(),
    };
    if (address !== undefined) {
      updateData.address =
        address && typeof address === "string" ? address.trim() || null : null;
    }
    if (type !== undefined) {
      updateData.type =
        type && typeof type === "string" ? type.trim() || null : null;
    }
    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    createAuditLog({
      userId,
      action: "update",
      entityType: "warehouse",
      entityId: id,
      details: { name: warehouse.name },
    }).catch(() => {});

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    return NextResponse.json(warehouse);
  } catch (error) {
    logger.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/warehouses
 * Delete a warehouse
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.warehouse.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.warehouse.delete({
      where: { id },
    });

    createAuditLog({
      userId,
      action: "delete",
      entityType: "warehouse",
      entityId: id,
      details: { name: existing.name },
    }).catch(() => {});

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 },
    );
  }
}

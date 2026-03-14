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
    const { name, code, location, description, isActive } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse name is required" },
        { status: 400 },
      );
    }

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse code is required" },
        { status: 400 },
      );
    }

    // Check for unique name or code
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        OR: [{ name: name.trim() }, { code: code.trim() }]
      }
    });

    if (existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse with this name or code already exists" },
        { status: 400 },
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name.trim(),
        code: code.trim(),
        userId,
        location:
          location && typeof location === "string"
            ? location.trim() || null
            : null,
        description: description && typeof description === "string" ? description.trim() || null : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
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
    const { id, name, code, location, description, isActive } = body;

    if (!id || !name || typeof name !== "string" || name.trim() === "" || !code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse ID, name, and code are required" },
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

    // Check unique constraints avoiding the current warehouse
    const duplicateCheck = await prisma.warehouse.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: name.trim() }, { code: code.trim() }]
      }
    });

    if (duplicateCheck) {
      return NextResponse.json(
        { error: "Another warehouse with this name or code already exists" },
        { status: 400 },
      );
    }

    const updateData: {
      name: string;
      code: string;
      updatedBy: string;
      updatedAt: Date;
      location?: string | null;
      description?: string | null;
      isActive?: boolean;
    } = {
      name: name.trim(),
      code: code.trim(),
      updatedBy: userId,
      updatedAt: new Date(),
    };
    if (location !== undefined) {
      updateData.location =
        location && typeof location === "string" ? location.trim() || null : null;
    }
    if (description !== undefined) {
      updateData.description =
        description && typeof description === "string" ? description.trim() || null : null;
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
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

    await prisma.warehouse.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date(),
      }
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

/**
 * Client Browse Meta API
 * GET /api/portal/client/browse-meta — product owners (admins) + global stats for client browse
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { prisma } from "@/prisma/client";
import type { ClientBrowseMeta } from "@/types";

/**
 * GET /api/portal/client/browse-meta
 * Returns product owners (admins) and global stats for client browse page
 */
export async function GET(request: NextRequest) {
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
    if (session.role !== "client") {
      return NextResponse.json(
        { error: "Access denied. Client role required." },
        { status: 403 },
      );
    }

    const [
      admins,
      clientsCount,
      supplierActive,
      supplierInactive,
      categoryActive,
      categoryInactive,
      warehouseActive,
      warehouseInactive,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ["admin", "user"] } },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where: { role: "client" } }),
      prisma.supplier.count({ where: { status: true } }),
      prisma.supplier.count({ where: { status: false } }),
      prisma.category.count({ where: { status: true } }),
      prisma.category.count({ where: { status: false } }),
      prisma.warehouse.count({ where: { status: true } }),
      prisma.warehouse.count({ where: { status: false } }),
    ]);

    const meta: ClientBrowseMeta = {
      admins: admins.map((a) => ({
        id: a.id,
        name: a.name ?? a.email ?? "Unknown",
        email: a.email ?? "",
      })),
      stats: {
        admins: admins.length,
        clients: clientsCount,
        suppliers: { total: supplierActive + supplierInactive, active: supplierActive, inactive: supplierInactive },
        categories: { total: categoryActive + categoryInactive, active: categoryActive, inactive: categoryInactive },
        warehouses: { total: warehouseActive + warehouseInactive, active: warehouseActive, inactive: warehouseInactive },
      },
    };

    return NextResponse.json(meta);
  } catch (error) {
    logger.error("Error fetching client browse meta:", error);
    return NextResponse.json(
      { error: "Failed to fetch browse meta" },
      { status: 500 },
    );
  }
}

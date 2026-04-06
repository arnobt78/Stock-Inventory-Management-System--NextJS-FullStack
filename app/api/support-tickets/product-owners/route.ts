/**
 * GET /api/support-tickets/product-owners
 * Returns users who have at least one product (for "Send to" dropdown when creating a ticket).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { prisma } from "@/prisma/client";

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

    const productOwnerIds = await prisma.product.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });
    const userIds = [...new Set(productOwnerIds.map((p) => p.userId))];
    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name ?? "—",
        email: u.email ?? "",
      })),
    );
  } catch (error) {
    logger.error("Error fetching product owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch product owners" },
      { status: 500 },
    );
  }
}

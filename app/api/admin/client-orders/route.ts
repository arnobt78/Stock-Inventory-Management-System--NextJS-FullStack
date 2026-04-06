/**
 * Admin Client Orders API
 * GET /api/admin/client-orders — orders that contain products owned by the current user (product owner)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { getClientOrdersForProductOwner } from "@/lib/server/orders-data";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { logger } from "@/lib/logger";

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

    // Admin or any user who owns products can see client orders (orders containing their products)
    const orders = await getClientOrdersForProductOwner(session.id);
    return NextResponse.json(orders);
  } catch (error) {
    logger.error("Error fetching admin client orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch client orders" },
      { status: 500 },
    );
  }
}

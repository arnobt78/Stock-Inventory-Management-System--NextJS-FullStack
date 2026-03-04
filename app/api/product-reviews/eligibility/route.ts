/**
 * GET /api/product-reviews/eligibility?productId=xxx
 * Returns eligible slots (orderId, orderItemId) for the current user to write a review for the product (paid purchases, no review yet).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { getEligibleReviewSlots } from "@/prisma/product-review";

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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const orderId = searchParams.get("orderId") ?? undefined;
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    let slots = await getEligibleReviewSlots(session.id, productId);
    if (orderId) {
      slots = slots.filter((s) => s.orderId === orderId);
    }
    return NextResponse.json({
      eligible: slots.length > 0,
      slots: slots.map((s) => ({ orderId: s.orderId, orderItemId: s.orderItemId })),
    });
  } catch (error) {
    logger.error("Error fetching review eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}

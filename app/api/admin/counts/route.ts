/**
 * GET /api/admin/counts — lightweight counts for admin sidebar badges.
 * Returns { clientOrders, clientInvoices, supportTickets, productReviews }.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { getAdminCounts } from "@/lib/server/admin-counts";
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

    const counts = await getAdminCounts(session.id);
    return NextResponse.json(counts);
  } catch (error) {
    logger.error("Error fetching admin counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 },
    );
  }
}

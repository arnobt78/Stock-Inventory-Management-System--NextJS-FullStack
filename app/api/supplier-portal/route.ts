/**
 * Admin Supplier Portal API Route Handler
 * GET /api/supplier-portal — overview stats for admin (admin-only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getSupplierPortalForAdmin } from "@/lib/server/supplier-portal-data";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";

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
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getSupplierPortalForAdmin(session.id);
    return NextResponse.json(stats);
  } catch (error) {
    logger.error("Error fetching supplier portal stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier portal stats" },
      { status: 500 },
    );
  }
}

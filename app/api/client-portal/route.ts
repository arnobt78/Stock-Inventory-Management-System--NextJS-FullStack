/**
 * Admin Client Portal API Route Handler
 * GET /api/client-portal — overview stats for admin (admin-only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getClientPortalForAdmin } from "@/lib/server/client-portal-data";
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

    const stats = await getClientPortalForAdmin();
    return NextResponse.json(stats);
  } catch (error) {
    logger.error("Error fetching client portal stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch client portal stats" },
      { status: 500 },
    );
  }
}

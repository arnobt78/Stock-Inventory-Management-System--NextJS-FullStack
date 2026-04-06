/**
 * Dashboard API Route Handler
 * GET /api/dashboard — admin overview (counts, revenue, trends, recent activity).
 * Uses safe path /dashboard; avoid blocked keywords (analytics, analysis, tracking, performance, metrics).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getDashboardForAdmin } from "@/lib/server/dashboard-data";
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

    const stats = await getDashboardForAdmin(session.id);
    return NextResponse.json(stats);
  } catch (error) {
    logger.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}

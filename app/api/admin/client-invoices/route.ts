/**
 * Admin Client Invoices API
 * GET /api/admin/client-invoices — invoices for orders that contain products owned by the current user
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { getClientInvoicesForProductOwner } from "@/lib/server/invoices-data";
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

    const invoices = await getClientInvoicesForProductOwner(session.id);
    return NextResponse.json(invoices);
  } catch (error) {
    logger.error("Error fetching admin client invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch client invoices" },
      { status: 500 },
    );
  }
}

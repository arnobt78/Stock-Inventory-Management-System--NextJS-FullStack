/**
 * System Metrics API Route
 * Provides system-level metrics including:
 * - Cache hit/miss rates
 * - Database performance statistics
 * - System resource usage (memory, CPU, uptime)
 * - Node.js process information
 */

import { NextRequest } from "next/server";
import { getSystemMetrics } from "@/lib/monitoring/system-metrics";
import { successResponse, errorResponse } from "@/lib/api/response-helpers";
import { logger } from "@/lib/logger";

/**
 * GET /api/system-metrics
 * Get comprehensive system metrics
 */
export async function GET(request: NextRequest) {
  try {
    const metrics = await getSystemMetrics();
    return successResponse(metrics);
  } catch (error) {
    logger.error("Failed to get system metrics", { error });
    return errorResponse(
      `Failed to get system metrics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
}

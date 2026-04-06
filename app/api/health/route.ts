/**
 * Health Check API Route
 * Provides comprehensive system health monitoring including:
 * - Database connection status
 * - External API health (ImageKit, Brevo, Redis)
 * - Uptime tracking
 * - Performance metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getRedis, isRedisConfigured } from "@/lib/cache/redis";
import { isBrevoConfigured } from "@/lib/email/brevo";
import { logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api/response-helpers";
import { trackDatabaseQuery } from "@/lib/monitoring/system-metrics";

/**
 * Check database connection health
 */
async function checkDatabaseHealth(): Promise<{
  status: "OK" | "ERROR";
  responseTime: number;
  message: string;
}> {
  const startTime = Date.now();
  try {
    // Simple query to test connection - count users (lightweight operation)
    await prisma.user.count();
    const responseTime = Date.now() - startTime;

    // Track database query performance (non-blocking)
    trackDatabaseQuery(responseTime).catch(() => {
      // Non-critical, silently fail
    });

    return {
      status: "OK",
      responseTime,
      message: "Database connection healthy",
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Database health check failed", { error });

    // Track failed query (non-blocking)
    trackDatabaseQuery(responseTime).catch(() => {
      // Non-critical, silently fail
    });

    return {
      status: "ERROR",
      responseTime,
      message: `Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Check Redis connection health
 */
async function checkRedisHealth(): Promise<{
  status: "OK" | "ERROR" | "NOT_CONFIGURED";
  responseTime: number;
  message: string;
}> {
  const startTime = Date.now();

  if (!isRedisConfigured()) {
    return {
      status: "NOT_CONFIGURED",
      responseTime: 0,
      message: "Redis not configured",
    };
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return {
        status: "ERROR",
        responseTime: Date.now() - startTime,
        message: "Redis client not available",
      };
    }

    // Test Redis connection with PING
    await redis.ping();
    const responseTime = Date.now() - startTime;
    return {
      status: "OK",
      responseTime,
      message: "Redis connection healthy",
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Redis health check failed", { error });
    return {
      status: "ERROR",
      responseTime,
      message: `Redis connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Check ImageKit service health
 */
async function checkImageKitHealth(): Promise<{
  status: "OK" | "ERROR" | "NOT_CONFIGURED";
  responseTime: number;
  message: string;
}> {
  const startTime = Date.now();

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return {
      status: "NOT_CONFIGURED",
      responseTime: 0,
      message: "ImageKit not configured",
    };
  }

  try {
    // Check ImageKit API endpoint (simple connectivity test)
    const response = await fetch("https://api.imagekit.io/v1/files", {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString(
          "base64"
        )}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    // ImageKit returns 200 even if no files, so any 2xx or 401 (auth) means service is up
    if (response.status === 200 || response.status === 401) {
      return {
        status: "OK",
        responseTime,
        message: "ImageKit service accessible",
      };
    }

    return {
      status: "ERROR",
      responseTime,
      message: `ImageKit returned status ${response.status}`,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("ImageKit health check failed", { error });
    return {
      status: "ERROR",
      responseTime,
      message: `ImageKit check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Check Brevo email service health
 */
async function checkBrevoHealth(): Promise<{
  status: "OK" | "ERROR" | "NOT_CONFIGURED";
  responseTime: number;
  message: string;
}> {
  const startTime = Date.now();

  if (!isBrevoConfigured()) {
    return {
      status: "NOT_CONFIGURED",
      responseTime: 0,
      message: "Brevo not configured",
    };
  }

  try {
    // Check Brevo API endpoint (simple connectivity test)
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return {
        status: "NOT_CONFIGURED",
        responseTime: 0,
        message: "Brevo API key not configured",
      };
    }

    const response = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        "api-key": apiKey,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    // Brevo returns 200 if authenticated, 401 if not
    if (response.status === 200 || response.status === 401) {
      return {
        status: "OK",
        responseTime,
        message: "Brevo service accessible",
      };
    }

    return {
      status: "ERROR",
      responseTime,
      message: `Brevo returned status ${response.status}`,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Brevo health check failed", { error });
    return {
      status: "ERROR",
      responseTime,
      message: `Brevo check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Get uptime from Redis or calculate from process start
 */
async function getUptime(): Promise<{
  uptime: string;
  startTime: string | null;
}> {
  try {
    // Try to get uptime from Redis if available
    if (isRedisConfigured()) {
      const redis = getRedis();
      if (redis) {
        const startTimeStr = await redis.get("app:start_time");
        if (startTimeStr && typeof startTimeStr === "string") {
          const startTime = new Date(startTimeStr);
          const now = new Date();
          const diff = now.getTime() - startTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          return {
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            startTime: startTimeStr,
          };
        }
      }
    }

    // Fallback: Use process uptime (Node.js process)
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    return {
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      startTime: null,
    };
  } catch (error) {
    logger.error("Failed to get uptime", { error });
    return {
      uptime: "Unknown",
      startTime: null,
    };
  }
}

/**
 * Initialize uptime tracking in Redis
 */
async function initializeUptimeTracking(): Promise<void> {
  try {
    if (isRedisConfigured()) {
      const redis = getRedis();
      if (redis) {
        // Set start time if not already set
        const exists = await redis.exists("app:start_time");
        if (!exists) {
          await redis.set("app:start_time", new Date().toISOString());
        }
      }
    }
  } catch (error) {
    logger.error("Failed to initialize uptime tracking", { error });
    // Non-critical, don't throw
  }
}

/**
 * GET /api/health
 * Comprehensive health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize uptime tracking (non-blocking)
    await initializeUptimeTracking();

    // Run all health checks in parallel
    const [database, redis, imagekit, brevo, uptime] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkImageKitHealth(),
      checkBrevoHealth(),
      getUptime(),
    ]);

    // Determine overall health
    const criticalServices = [database];
    const optionalServices = [redis, imagekit, brevo];

    const criticalHealthy = criticalServices.every((s) => s.status === "OK");
    const optionalHealthy = optionalServices.filter(
      (s) => s.status === "OK" || s.status === "NOT_CONFIGURED"
    ).length;

    const overallHealth = criticalHealthy
      ? optionalHealthy === optionalServices.length
        ? "HEALTHY"
        : "DEGRADED"
      : "DOWN";

    return successResponse({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      uptime: uptime.uptime,
      services: {
        database: {
          status: database.status,
          responseTime: database.responseTime,
          message: database.message,
        },
        redis: {
          status: redis.status,
          responseTime: redis.responseTime,
          message: redis.message,
        },
        imagekit: {
          status: imagekit.status,
          responseTime: imagekit.responseTime,
          message: imagekit.message,
        },
        brevo: {
          status: brevo.status,
          responseTime: brevo.responseTime,
          message: brevo.message,
        },
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    logger.error("Health check failed", { error });
    return errorResponse(
      `Health check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
}

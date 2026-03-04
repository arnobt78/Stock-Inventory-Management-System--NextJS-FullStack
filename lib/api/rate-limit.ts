/**
 * API Rate Limiting Helper
 * Utilities for rate limiting in API route handlers
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, type RateLimitResult } from "@/lib/cache";
import { logger } from "@/lib/logger";

/**
 * Rate limit configuration for API routes
 */
export interface ApiRateLimitConfig {
  /**
   * Maximum number of requests allowed per window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
  /**
   * Get identifier from request (e.g., user ID, IP address)
   */
  getIdentifier: (request: NextRequest) => string;
}

/**
 * Default rate limit configurations
 */
export const defaultRateLimits = {
  /**
   * Standard API rate limit (600 requests per minute per user/IP).
   * Each page navigation fires ~4-5 API calls; fast clicking 10+ pages should never 429.
   */
  standard: {
    limit: 600,
    window: 60,
    getIdentifier: (request: NextRequest) => {
      // Try to get user ID from session, fallback to IP
      const userId = request.headers.get("x-user-id");
      if (userId) return `user:${userId}`;
      return `ip:${request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown"}`;
    },
  },
  /**
   * Strict rate limit (10 requests per minute)
   */
  strict: {
    limit: 10,
    window: 60,
    getIdentifier: (request: NextRequest) => {
      const userId = request.headers.get("x-user-id");
      if (userId) return `user:${userId}`;
      return `ip:${request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown"}`;
    },
  },
  /**
   * Auth rate limit (5 requests per minute)
   */
  auth: {
    limit: 5,
    window: 60,
    getIdentifier: (request: NextRequest) => {
      // Use IP for auth endpoints to prevent brute force
      return `ip:${request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown"}`;
    },
  },
} as const;

/**
 * Rate limit middleware for API routes
 * Returns NextResponse with rate limit headers if exceeded
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @param overrideIdentifier - Optional: use this instead of getIdentifier (e.g. session user id) for per-user limits
 * @returns Promise<NextResponse | null> - Error response if rate limited, null if allowed
 */
export async function withRateLimit(
  request: NextRequest,
  config: ApiRateLimitConfig,
  overrideIdentifier?: string
): Promise<NextResponse | null> {
  try {
    const identifier =
      overrideIdentifier != null
        ? `user:${overrideIdentifier}`
        : config.getIdentifier(request);
    const result = await checkRateLimit({
      limit: config.limit,
      window: config.window,
      identifier,
    });

    // Add rate limit headers to response
    const headers = new Headers();
    headers.set("X-RateLimit-Limit", config.limit.toString());
    headers.set("X-RateLimit-Remaining", Math.max(0, config.limit - result.current).toString());
    headers.set("X-RateLimit-Reset", (Date.now() / 1000 + result.reset).toString());

    if (!result.allowed) {
      logger.warn(`Rate limit exceeded for ${identifier}: ${result.current}/${config.limit}`);
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${result.reset} seconds.`,
          retryAfter: result.reset,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Return null to indicate request is allowed
    // The actual response should include the rate limit headers
    return null;
  } catch (error) {
    logger.error("Rate limit check failed:", error);
    // Graceful degradation: allow request on error
    return null;
  }
}

/**
 * Add rate limit headers to response
 *
 * @param response - Next.js response object
 * @param result - Rate limit result
 * @param limit - Rate limit configuration
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  limit: number
): void {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", Math.max(0, limit - result.current).toString());
  response.headers.set("X-RateLimit-Reset", (Date.now() / 1000 + result.reset).toString());
}

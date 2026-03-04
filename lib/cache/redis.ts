/**
 * Redis Cache Client
 * Upstash Redis client for caching and performance optimization
 * Gracefully degrades if Redis is not configured
 */

import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

/**
 * Check if Redis is configured
 * Supports both naming conventions:
 * - UPSTASH_REDIS_URL / UPSTASH_REDIS_TOKEN (user's existing format)
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (standard format)
 *
 * @returns boolean - True if Redis credentials are configured
 */
export function isRedisConfigured(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.UPSTASH_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

/**
 * Get Redis client instance
 * Returns null if Redis is not configured (graceful degradation)
 *
 * @returns Redis | null - Redis client instance or null
 */
export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    // Support both naming conventions
    const url =
      process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token =
      process.env.UPSTASH_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return null;
    }

    return new Redis({
      url,
      token,
    });
  } catch (error) {
    logger.error("Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Redis client singleton instance
 * Created once and reused for all operations
 */
let redisClient: Redis | null = null;

/**
 * Get or create Redis client singleton
 *
 * @returns Redis | null - Redis client instance or null
 */
export function getRedis(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redisClient) {
    redisClient = getRedisClient();
    if (redisClient) {
      logger.info("✅ Redis client initialized successfully");
    } else {
      logger.warn("⚠️ Redis client initialization failed - caching disabled");
    }
  }

  return redisClient;
}

/**
 * Initialize Redis connection and log status
 * Call this at application startup to verify Redis configuration
 */
export function initializeRedis(): void {
  if (isRedisConfigured()) {
    const client = getRedis();
    if (client) {
      logger.info("✅ Redis caching enabled");
    } else {
      logger.warn("⚠️ Redis credentials configured but connection failed - caching disabled");
    }
  } else {
    logger.debug("ℹ️ Redis not configured - caching disabled (graceful degradation)");
  }
}

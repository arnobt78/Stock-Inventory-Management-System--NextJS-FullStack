/**
 * System Metrics Utilities
 * Tracks system-level metrics including:
 * - Cache hit/miss rates
 * - Database performance statistics
 * - System resource usage (Node.js process)
 * - Cache statistics
 */

import { getRedis, isRedisConfigured } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number; // Percentage (0-100)
  totalRequests: number;
  lastUpdated: string;
}

/**
 * Database performance statistics
 */
export interface DatabaseStats {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number; // Queries > 1000ms
  lastUpdated: string;
}

/**
 * System resource usage
 */
export interface SystemResources {
  memoryUsage: {
    rss: number; // Resident Set Size (MB)
    heapTotal: number; // Total heap (MB)
    heapUsed: number; // Used heap (MB)
    external: number; // External memory (MB)
  };
  cpuUsage: {
    user: number; // User CPU time (ms)
    system: number; // System CPU time (ms)
  };
  uptime: number; // Process uptime (seconds)
  nodeVersion: string;
  platform: string;
}

/**
 * System metrics summary
 */
export interface SystemMetrics {
  cache: CacheStats;
  database: DatabaseStats;
  resources: SystemResources;
  timestamp: string;
}

/**
 * Track cache hit
 * Increments cache hit counter in Redis
 */
export async function trackCacheHit(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    const key = "metrics:cache:hits";
    await redis.incr(key);
    await redis.expire(key, 86400); // 24h TTL
  } catch (error) {
    logger.error("Failed to track cache hit", { error });
    // Non-critical, don't throw
  }
}

/**
 * Track cache miss
 * Increments cache miss counter in Redis
 */
export async function trackCacheMiss(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    const key = "metrics:cache:misses";
    await redis.incr(key);
    await redis.expire(key, 86400); // 24h TTL
  } catch (error) {
    logger.error("Failed to track cache miss", { error });
    // Non-critical, don't throw
  }
}

/**
 * Track database query performance
 * Stores query time for performance analysis
 */
export async function trackDatabaseQuery(queryTime: number): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    const key = "metrics:database:queries";
    const slowKey = "metrics:database:slow_queries";

    // Increment total queries
    await redis.incr(key);
    await redis.expire(key, 86400); // 24h TTL

    // Track slow queries (> 1000ms)
    if (queryTime > 1000) {
      await redis.incr(slowKey);
      await redis.expire(slowKey, 86400); // 24h TTL
    }

    // Store query time in sorted set for average calculation
    const queryTimesKey = "metrics:database:query_times";
    await redis.zadd(queryTimesKey, {
      score: Date.now(),
      member: queryTime.toString(),
    });
    await redis.zremrangebyrank(queryTimesKey, 0, -1001); // Keep last 1000 queries
    await redis.expire(queryTimesKey, 86400); // 24h TTL
  } catch (error) {
    logger.error("Failed to track database query", { error });
    // Non-critical, don't throw
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  if (!isRedisConfigured()) {
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const [hits, misses] = await Promise.all([
      redis.get("metrics:cache:hits"),
      redis.get("metrics:cache:misses"),
    ]);

    const hitsCount =
      typeof hits === "string" ? parseInt(hits, 10) : 0;
    const missesCount =
      typeof misses === "string" ? parseInt(misses, 10) : 0;
    const totalRequests = hitsCount + missesCount;
    const hitRate =
      totalRequests > 0 ? Math.round((hitsCount / totalRequests) * 100) : 0;

    return {
      hits: hitsCount,
      misses: missesCount,
      hitRate,
      totalRequests,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to get cache stats", { error });
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get database performance statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  if (!isRedisConfigured()) {
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const [totalQueries, slowQueries, queryTimes] = await Promise.all([
      redis.get("metrics:database:queries"),
      redis.get("metrics:database:slow_queries"),
      redis.zrange("metrics:database:query_times", 0, -1),
    ]);

    const totalQueriesCount =
      typeof totalQueries === "string" ? parseInt(totalQueries, 10) : 0;
    const slowQueriesCount =
      typeof slowQueries === "string" ? parseInt(slowQueries, 10) : 0;

    // Calculate average query time from stored query times
    let averageQueryTime = 0;
    if (queryTimes.length > 0) {
      const times = queryTimes.map((t) => parseFloat(String(t)));
      const sum = times.reduce((acc, t) => acc + t, 0);
      averageQueryTime = Math.round(sum / times.length);
    }

    return {
      totalQueries: totalQueriesCount,
      averageQueryTime,
      slowQueries: slowQueriesCount,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to get database stats", { error });
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get system resource usage
 * Returns Node.js process resource information
 */
export function getSystemResources(): SystemResources {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Convert bytes to MB
  const bytesToMB = (bytes: number): number => Math.round((bytes / 1024 / 1024) * 100) / 100;

  return {
    memoryUsage: {
      rss: bytesToMB(memoryUsage.rss),
      heapTotal: bytesToMB(memoryUsage.heapTotal),
      heapUsed: bytesToMB(memoryUsage.heapUsed),
      external: bytesToMB(memoryUsage.external),
    },
    cpuUsage: {
      user: Math.round(cpuUsage.user / 1000), // Convert microseconds to milliseconds
      system: Math.round(cpuUsage.system / 1000),
    },
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
  };
}

/**
 * Get all system metrics
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const [cache, database, resources] = await Promise.all([
    getCacheStats(),
    getDatabaseStats(),
    Promise.resolve(getSystemResources()),
  ]);

  return {
    cache,
    database,
    resources,
    timestamp: new Date().toISOString(),
  };
}

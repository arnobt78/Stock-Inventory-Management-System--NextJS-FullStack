/**
 * Performance Monitoring Utilities
 * Tracks API endpoint performance metrics including:
 * - Response times
 * - Error rates
 * - Request counts
 * - Performance trends
 * 
 * NOTE: All utilities are complete and ready to use.
 * Route wrapping with withPerformanceTracking() is deferred until
 * after all other features are implemented. See lib/api/performance-wrapper.ts
 * 
 * Once routes are wrapped, metrics will automatically be collected
 * and displayed on the API status page.
 */

import { getRedis, isRedisConfigured } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";

/**
 * Performance metrics for an API endpoint
 */
export interface EndpointMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number; // Percentage (0-100)
  lastUpdated: string;
}

/**
 * Performance data point for time series
 */
export interface PerformanceDataPoint {
  timestamp: string;
  responseTime: number;
  status: "success" | "error";
}

/**
 * Track API endpoint performance
 * Stores metrics in Redis with TTL for automatic cleanup
 */
export async function trackEndpointPerformance(
  endpoint: string,
  method: string,
  responseTime: number,
  status: "success" | "error"
): Promise<void> {
  if (!isRedisConfigured()) {
    return; // Gracefully degrade if Redis not configured
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    const key = `perf:${method}:${endpoint}`;
    const timestamp = Date.now();
    const dataPoint: PerformanceDataPoint = {
      timestamp: new Date(timestamp).toISOString(),
      responseTime,
      status,
    };

    // Store individual data point (last 1000 requests, 24h TTL)
    const dataPointKey = `${key}:points:${timestamp}`;
    await redis.setex(dataPointKey, 86400, JSON.stringify(dataPoint));

    // Update aggregated metrics
    const metricsKey = `${key}:metrics`;
    const existingMetrics = await redis.get(metricsKey);

    let metrics: EndpointMetrics;
    if (existingMetrics && typeof existingMetrics === "string") {
      metrics = JSON.parse(existingMetrics) as EndpointMetrics;
    } else {
      metrics = {
        endpoint,
        method,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: responseTime,
        maxResponseTime: responseTime,
        errorRate: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update metrics
    metrics.totalRequests += 1;
    if (status === "success") {
      metrics.successfulRequests += 1;
    } else {
      metrics.failedRequests += 1;
    }

    // Calculate new average response time
    const totalTime =
      metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime;
    metrics.averageResponseTime = Math.round(totalTime / metrics.totalRequests);

    // Update min/max
    metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);

    // Calculate error rate
    metrics.errorRate =
      metrics.totalRequests > 0
        ? Math.round((metrics.failedRequests / metrics.totalRequests) * 100)
        : 0;

    metrics.lastUpdated = new Date().toISOString();

    // Store updated metrics (24h TTL)
    await redis.setex(metricsKey, 86400, JSON.stringify(metrics));

    // Add to sorted set for quick retrieval of top endpoints
    const sortedSetKey = "perf:endpoints:sorted";
    await redis.zadd(sortedSetKey, { score: timestamp, member: key });
    await redis.expire(sortedSetKey, 86400); // 24h TTL
  } catch (error) {
    logger.error("Failed to track endpoint performance", { error, endpoint });
    // Non-critical, don't throw
  }
}

/**
 * Get performance metrics for a specific endpoint
 */
export async function getEndpointMetrics(
  endpoint: string,
  method: string
): Promise<EndpointMetrics | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return null;
    }

    const key = `perf:${method}:${endpoint}`;
    const metricsKey = `${key}:metrics`;
    const metricsData = await redis.get(metricsKey);

    if (!metricsData || typeof metricsData !== "string") {
      return null;
    }

    return JSON.parse(metricsData) as EndpointMetrics;
  } catch (error) {
    logger.error("Failed to get endpoint metrics", { error, endpoint });
    return null;
  }
}

/**
 * Get performance metrics for all tracked endpoints
 */
export async function getAllEndpointMetrics(): Promise<EndpointMetrics[]> {
  if (!isRedisConfigured()) {
    return [];
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return [];
    }

    // Get all metric keys
    const pattern = "perf:*:metrics";
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = typeof result[0] === "number" ? result[0] : 0;
      keys.push(...(Array.isArray(result[1]) ? result[1] : []));
    } while (cursor !== 0);

    // Fetch all metrics
    const metricsPromises = keys.map(async (key) => {
      const data = await redis.get(key);
      if (data && typeof data === "string") {
        return JSON.parse(data) as EndpointMetrics;
      }
      return null;
    });

    const metrics = await Promise.all(metricsPromises);
    return metrics.filter((m): m is EndpointMetrics => m !== null);
  } catch (error) {
    logger.error("Failed to get all endpoint metrics", { error });
    return [];
  }
}

/**
 * Get recent performance data points for an endpoint
 * Returns last N data points within time window
 */
export async function getEndpointDataPoints(
  endpoint: string,
  method: string,
  limit = 100
): Promise<PerformanceDataPoint[]> {
  if (!isRedisConfigured()) {
    return [];
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return [];
    }

    const key = `perf:${method}:${endpoint}`;
    const pattern = `${key}:points:*`;

    // Get all data point keys
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: limit,
      });
      cursor = typeof result[0] === "number" ? result[0] : 0;
      keys.push(...(Array.isArray(result[1]) ? result[1] : []));
    } while (cursor !== 0 && keys.length < limit);

    // Sort by timestamp (newest first) and limit
    const sortedKeys = keys
      .sort((a, b) => {
        const timestampA = parseInt(a.split(":").pop() || "0", 10);
        const timestampB = parseInt(b.split(":").pop() || "0", 10);
        return timestampB - timestampA;
      })
      .slice(0, limit);

    // Fetch data points
    const dataPointsPromises = sortedKeys.map(async (key) => {
      const data = await redis.get(key);
      if (data && typeof data === "string") {
        return JSON.parse(data) as PerformanceDataPoint;
      }
      return null;
    });

    const dataPoints = await Promise.all(dataPointsPromises);
    return dataPoints.filter(
      (dp): dp is PerformanceDataPoint => dp !== null
    );
  } catch (error) {
    logger.error("Failed to get endpoint data points", { error, endpoint });
    return [];
  }
}

/**
 * Get performance summary statistics
 */
export async function getPerformanceSummary(): Promise<{
  totalEndpoints: number;
  totalRequests: number;
  averageResponseTime: number;
  overallErrorRate: number;
  topSlowEndpoints: EndpointMetrics[];
  topErrorEndpoints: EndpointMetrics[];
}> {
  const allMetrics = await getAllEndpointMetrics();

  if (allMetrics.length === 0) {
    return {
      totalEndpoints: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      overallErrorRate: 0,
      topSlowEndpoints: [],
      topErrorEndpoints: [],
    };
  }

  const totalRequests = allMetrics.reduce(
    (sum, m) => sum + m.totalRequests,
    0
  );
  const totalFailed = allMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
  const totalResponseTime = allMetrics.reduce(
    (sum, m) => sum + m.averageResponseTime * m.totalRequests,
    0
  );

  const averageResponseTime =
    totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0;
  const overallErrorRate =
    totalRequests > 0 ? Math.round((totalFailed / totalRequests) * 100) : 0;

  // Top 5 slowest endpoints (by average response time)
  const topSlowEndpoints = [...allMetrics]
    .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
    .slice(0, 5);

  // Top 5 endpoints with highest error rates
  const topErrorEndpoints = [...allMetrics]
    .filter((m) => m.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  return {
    totalEndpoints: allMetrics.length,
    totalRequests,
    averageResponseTime,
    overallErrorRate,
    topSlowEndpoints,
    topErrorEndpoints,
  };
}

/**
 * Clear performance metrics for an endpoint (useful for testing)
 */
export async function clearEndpointMetrics(
  endpoint: string,
  method: string
): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    const key = `perf:${method}:${endpoint}`;
    const pattern = `${key}:*`;

    // Get all keys matching pattern
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = typeof result[0] === "number" ? result[0] : 0;
      keys.push(...(Array.isArray(result[1]) ? result[1] : []));
    } while (cursor !== 0);

    // Delete all keys
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error("Failed to clear endpoint metrics", { error, endpoint });
  }
}

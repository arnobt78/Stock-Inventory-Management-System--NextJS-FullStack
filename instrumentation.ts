/**
 * Next.js Instrumentation Hook
 * Required for Sentry to work properly with Next.js App Router
 * This file is automatically loaded by Next.js
 * Also initializes Redis connection at startup
 */

export async function register() {
  // Only run on server-side
  if (typeof window === "undefined") {
    // Import Sentry server config
    // This will initialize Sentry on the server
    try {
      await import("./sentry.server.config");
    } catch {
      // Sentry not configured, silently continue
    }

    // Initialize Redis connection and log status
    try {
      const { initializeRedis } = await import("@/lib/cache/redis");
      initializeRedis();

      // Initialize uptime tracking in Redis
      const { getRedis, isRedisConfigured } = await import("@/lib/cache/redis");
      if (isRedisConfigured()) {
        const redis = getRedis();
        if (redis) {
          // Set start time if not already set (non-blocking)
          redis
            .exists("app:start_time")
            .then((exists) => {
              if (!exists) {
                redis
                  .set("app:start_time", new Date().toISOString())
                  .catch(() => {
                    // Non-critical, silently fail
                  });
              }
            })
            .catch(() => {
              // Non-critical, silently fail
            });
        }
      }
    } catch {
      // Redis initialization failed, gracefully continue
    }

    // Initialize QStash connection and log status
    try {
      const { initializeQStash } = await import("@/lib/queue/qstash");
      initializeQStash();
    } catch {
      // QStash initialization failed, gracefully continue
    }
  }
}

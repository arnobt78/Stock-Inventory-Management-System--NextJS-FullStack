/**
 * Sentry Edge Configuration
 * Sentry configuration for Edge runtime error tracking
 * Only initializes when SENTRY_DSN is configured and @sentry/nextjs is installed
 * 
 * NOTE: Install @sentry/nextjs package before using: npm install @sentry/nextjs
 */

/**
 * Initialize Sentry for Edge runtime
 * Only runs in production and when DSN is configured
 */
export default function initSentry(): void {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  // Only initialize in production with valid DSN
  if (process.env.NODE_ENV !== "production" || !dsn) {
    return;
  }

  // Dynamic import to handle missing @sentry/nextjs package gracefully
  try {
    const Sentry = require("@sentry/nextjs");
    if (!Sentry || !Sentry.init) {
      return;
    }

    Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Filter out sensitive data
    beforeSend(event: import("@sentry/nextjs").Event) {
      // Filter out sensitive fields
      if (event.request) {
        delete event.request.headers?.["authorization"];
        delete event.request.headers?.["cookie"];
        delete event.request.cookies;
      }

      return event;
    },
    });
  } catch {
    // @sentry/nextjs not installed, silently fail
  }
}

// Initialize Sentry on module load
initSentry();

/**
 * Sentry Error Tracking Utilities
 * Centralized error tracking with Sentry integration
 * Only initializes in production when SENTRY_DSN is configured
 *
 * NOTE: Install @sentry/nextjs package before using: npm install @sentry/nextjs
 */

import type { SentryModule } from "./sentry-types";
import { isValidSentryModule } from "./sentry-types";

/**
 * Check if Sentry is configured
 *
 * @returns boolean - True if Sentry DSN is configured
 */
export function isSentryConfigured(): boolean {
  return !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Get Sentry DSN from environment variables
 *
 * @returns string | undefined - Sentry DSN if configured
 */
export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/**
 * Capture exception to Sentry (client-side)
 * Only works when Sentry is initialized
 *
 * @param error - Error to capture
 * @param context - Additional context data
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  // Only capture in production when Sentry is configured
  if (process.env.NODE_ENV !== "production" || !isSentryConfigured()) {
    return;
  }

  try {
    // Dynamic import to avoid including Sentry in bundle if not configured
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry: unknown) => {
          if (isValidSentryModule(Sentry)) {
            const sentry = Sentry as SentryModule;
            if (context) {
              sentry.captureException(error, {
                contexts: {
                  custom: context,
                },
              } as Record<string, unknown>);
            } else {
              sentry.captureException(error);
            }
          }
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  } catch {
    // Sentry not available, silently fail
  }
}

/**
 * Capture message to Sentry (client-side)
 * Only works when Sentry is initialized
 *
 * @param message - Message to capture
 * @param level - Severity level (error, warning, info)
 * @param context - Additional context data
 */
export function captureMessage(
  message: string,
  level: "error" | "warning" | "info" = "error",
  context?: Record<string, unknown>
): void {
  // Only capture in production when Sentry is configured
  if (process.env.NODE_ENV !== "production" || !isSentryConfigured()) {
    return;
  }

  try {
    // Dynamic import to avoid including Sentry in bundle if not configured
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry: unknown) => {
          if (isValidSentryModule(Sentry)) {
            const sentry = Sentry as SentryModule;
            if (context) {
              sentry.captureMessage(message, {
                level,
                contexts: {
                  custom: context,
                },
              } as Record<string, unknown>);
            } else {
              sentry.captureMessage(message, { level } as Record<
                string,
                unknown
              >);
            }
          }
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  } catch {
    // Sentry not available, silently fail
  }
}

/**
 * Set user context in Sentry
 *
 * @param user - User data (id, email, username)
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  name?: string;
}): void {
  // Only set context in production when Sentry is configured
  if (process.env.NODE_ENV !== "production" || !isSentryConfigured()) {
    return;
  }

  try {
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry: unknown) => {
          if (isValidSentryModule(Sentry)) {
            const sentry = Sentry as SentryModule;
            sentry.setUser({
              id: user.id,
              email: user.email,
              username: user.username || user.name,
            });
          }
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  } catch {
    // Sentry not available, silently fail
  }
}

/**
 * Clear user context in Sentry
 */
export function clearUserContext(): void {
  // Only clear context in production when Sentry is configured
  if (process.env.NODE_ENV !== "production" || !isSentryConfigured()) {
    return;
  }

  try {
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry: unknown) => {
          if (isValidSentryModule(Sentry)) {
            const sentry = Sentry as SentryModule;
            sentry.setUser(null);
          }
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  } catch {
    // Sentry not available, silently fail
  }
}

/**
 * Add breadcrumb to Sentry
 *
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level: "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, unknown>
): void {
  // Only add breadcrumbs in production when Sentry is configured
  if (process.env.NODE_ENV !== "production" || !isSentryConfigured()) {
    return;
  }

  try {
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry: unknown) => {
          if (isValidSentryModule(Sentry)) {
            const sentry = Sentry as SentryModule;
            sentry.addBreadcrumb({
              message,
              category,
              level,
              data,
            });
          }
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  } catch {
    // Sentry not available, silently fail
  }
}

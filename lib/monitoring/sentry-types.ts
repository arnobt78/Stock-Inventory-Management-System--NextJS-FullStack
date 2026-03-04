/**
 * Sentry Type Definitions
 * Type definitions for Sentry when @sentry/nextjs is not installed
 * These types allow TypeScript to compile without errors
 */

/**
 * Sentry module interface (placeholder types)
 * These match @sentry/nextjs exports when package is installed
 */
export interface SentryModule {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, options?: Record<string, unknown>) => void;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    level?: "error" | "warning" | "info" | "debug";
    data?: Record<string, unknown>;
  }) => void;
  init: (config: Record<string, unknown>) => void;
}

/**
 * Type guard to check if Sentry module is valid
 *
 * @param module - Module to check
 * @returns boolean - True if module has required methods
 */
export function isValidSentryModule(module: unknown): module is SentryModule {
  if (!module || typeof module !== "object") {
    return false;
  }

  const sentry = module as Record<string, unknown>;
  return (
    typeof sentry.captureException === "function" &&
    typeof sentry.captureMessage === "function" &&
    typeof sentry.setUser === "function" &&
    typeof sentry.addBreadcrumb === "function"
  );
}

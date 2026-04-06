/**
 * Logger Utility
 * Centralized logging utility for development-only console logs
 * Automatically sends errors to Sentry in production when configured
 */

import { captureException, captureMessage } from "@/lib/monitoring/sentry";

/**
 * Log levels
 */
type LogLevel = "log" | "error" | "warn" | "info" | "debug";

/**
 * Logger interface
 */
interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Extract error from logger arguments
 */
function extractError(args: unknown[]): Error | null {
  if (args.length === 0) {
    return null;
  }

  const firstArg = args[0];
  if (firstArg instanceof Error) {
    return firstArg;
  }

  // Try to create error from string or object
  if (typeof firstArg === "string") {
    return new Error(firstArg);
  }

  if (typeof firstArg === "object" && firstArg !== null) {
    if ("error" in firstArg && firstArg.error instanceof Error) {
      return firstArg.error as Error;
    }
    if ("message" in firstArg && typeof firstArg.message === "string") {
      return new Error(firstArg.message as string);
    }
  }

  return null;
}

/**
 * Create a logger function for a specific level
 */
const createLogger = (level: LogLevel): (...args: unknown[]) => void => {
  if (process.env.NODE_ENV === "production") {
    // In production, send errors to Sentry and suppress console logs
    if (level === "error") {
      return (...args: unknown[]) => {
        const error = extractError(args);
        if (error) {
          // Send to Sentry if configured
          if (args.length > 1 && typeof args[1] === "object") {
            captureException(error, args[1] as Record<string, unknown>);
          } else {
            captureException(error);
          }
        } else if (args.length > 0) {
          // Try to send as message if not an error
          const message = String(args[0]);
          const context = args.length > 1 && typeof args[1] === "object" ? (args[1] as Record<string, unknown>) : undefined;
          captureMessage(message, "error", context);
        }
      };
    }
    if (level === "warn") {
      return (...args: unknown[]) => {
        if (args.length > 0) {
          const message = String(args[0]);
          const context = args.length > 1 && typeof args[1] === "object" ? (args[1] as Record<string, unknown>) : undefined;
          captureMessage(message, "warning", context);
        }
      };
    }
    // No-op for other levels in production
    return () => {};
  }

  // Development mode: log to console
  return (...args: unknown[]) => {
    console[level](...args);
  };
};

/**
 * Logger instance
 * Only logs in development mode
 * Sends errors to Sentry in production when configured
 */
export const logger: Logger = {
  log: createLogger("log"),
  error: createLogger("error"),
  warn: createLogger("warn"),
  info: createLogger("info"),
  debug: createLogger("debug"),
};


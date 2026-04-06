/**
 * QStash Client Utilities
 * Upstash QStash client for async job processing
 * Used for email queue, webhooks, and scheduled tasks
 * Gracefully degrades if QStash is not configured
 */

import { Client } from "@upstash/qstash";
import { logger } from "@/lib/logger";
import { getEnvVar } from "@/lib/env";

/**
 * Check if QStash is configured
 *
 * @returns boolean - True if QStash credentials are configured
 */
export function isQStashConfigured(): boolean {
  return !!(
    process.env.QSTASH_URL &&
    process.env.QSTASH_TOKEN &&
    process.env.QSTASH_CURRENT_SIGNING_KEY
  );
}

/**
 * Get QStash client instance
 * Returns null if QStash is not configured (graceful degradation)
 *
 * @returns Client | null - QStash client instance or null
 */
export function getQStashClient(): Client | null {
  if (!isQStashConfigured()) {
    return null;
  }

  try {
    const url = getEnvVar("QSTASH_URL");
    const token = getEnvVar("QSTASH_TOKEN");
    const currentSigningKey = getEnvVar("QSTASH_CURRENT_SIGNING_KEY");
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!url || !token || !currentSigningKey) {
      return null;
    }

    // QStash Client only needs token
    // Signing keys are used separately for webhook verification
    return new Client({
      token,
    });
  } catch (error) {
    logger.error("Failed to create QStash client:", error);
    return null;
  }
}

/**
 * QStash client singleton instance
 * Created once and reused for all operations
 */
let qstashClient: Client | null = null;

/**
 * Get QStash client (singleton)
 * Returns null if QStash is not configured
 *
 * @returns Client | null - QStash client instance or null
 */
export function getQStash(): Client | null {
  if (!isQStashConfigured()) {
    return null;
  }

  if (!qstashClient) {
    qstashClient = getQStashClient();
    if (qstashClient) {
      logger.info("✅ QStash client initialized successfully");
    } else {
      logger.warn(
        "⚠️ QStash client initialization failed - async queue disabled"
      );
    }
  }

  return qstashClient;
}

/**
 * Initialize QStash client
 * Logs initialization status
 */
export function initializeQStash(): void {
  if (isQStashConfigured()) {
    const client = getQStash();
    if (client) {
      logger.info("✅ QStash async queue enabled");
    } else {
      logger.warn(
        "⚠️ QStash async queue disabled due to client initialization failure"
      );
    }
  } else {
    logger.warn("⚠️ QStash not configured - async queue disabled");
  }
}

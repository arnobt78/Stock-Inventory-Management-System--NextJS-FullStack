/**
 * Email Preferences Utilities
 * Helper functions for managing user email notification preferences
 */

import { prisma } from "@/prisma/client";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import type {
  EmailPreferences,
  EmailNotificationType,
} from "@/types/auth";
import { DEFAULT_EMAIL_PREFERENCES } from "@/types/auth";

/**
 * Get user email preferences
 * Returns default preferences if user has none set
 *
 * @param userId - User ID
 * @returns Promise<EmailPreferences> - User email preferences
 */
export async function getUserEmailPreferences(
  userId: string
): Promise<EmailPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailPreferences: true },
    });

    if (!user || !user.emailPreferences) {
      return DEFAULT_EMAIL_PREFERENCES;
    }

    // Parse JSON preferences and merge with defaults
    const userPrefs = user.emailPreferences as unknown as Partial<EmailPreferences>;
    return {
      ...DEFAULT_EMAIL_PREFERENCES,
      ...userPrefs,
    };
  } catch (error) {
    logger.error("Error getting user email preferences", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });
    // Return defaults on error
    return DEFAULT_EMAIL_PREFERENCES;
  }
}

/**
 * Update user email preferences
 * Merges new preferences with existing ones
 *
 * @param userId - User ID
 * @param preferences - Partial email preferences to update
 * @returns Promise<EmailPreferences> - Updated email preferences
 */
export async function updateUserEmailPreferences(
  userId: string,
  preferences: Partial<EmailPreferences>
): Promise<EmailPreferences> {
  try {
    // Get current preferences
    const currentPrefs = await getUserEmailPreferences(userId);

    // Merge with new preferences
    const updatedPrefs: EmailPreferences = {
      ...currentPrefs,
      ...preferences,
    };

    // Update in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailPreferences: updatedPrefs as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    logger.info("User email preferences updated", {
      userId,
      preferences: updatedPrefs,
    });

    return updatedPrefs;
  } catch (error) {
    logger.error("Error updating user email preferences", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });
    throw error;
  }
}

/**
 * Check if user has enabled a specific email notification type
 *
 * @param userId - User ID
 * @param notificationType - Email notification type to check
 * @returns Promise<boolean> - True if notification is enabled
 */
export async function isEmailNotificationEnabled(
  userId: string,
  notificationType: EmailNotificationType
): Promise<boolean> {
  try {
    const preferences = await getUserEmailPreferences(userId);
    return preferences[notificationType] ?? true; // Default to true if not set
  } catch (error) {
    logger.error("Error checking email notification preference", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      notificationType,
    });
    // Default to enabled on error
    return true;
  }
}

/**
 * Map email notification type to preference key
 *
 * @param notificationType - Email notification type from email service
 * @returns EmailNotificationType | null - Corresponding preference key or null
 */
export function mapNotificationTypeToPreference(
  notificationType: string
): EmailNotificationType | null {
  const mapping: Record<string, EmailNotificationType> = {
    low_stock_alert: "lowStockAlerts",
    stock_out_notification: "stockOutNotifications",
    inventory_report: "inventoryReports",
    product_expiration_warning: "productExpirationWarnings",
    order_confirmation: "orderConfirmations",
    invoice_email: "invoiceEmails",
    shipping_notification: "shippingNotifications",
    order_status_update: "orderStatusUpdates",
  };

  return mapping[notificationType] || null;
}

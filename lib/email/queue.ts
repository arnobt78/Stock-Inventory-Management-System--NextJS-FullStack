/**
 * Email Queue Utilities
 * Queue email notifications using QStash for async processing
 * Falls back to direct sending if QStash is not configured
 */

import { getQStash, isQStashConfigured } from "@/lib/queue/qstash";
import { logger } from "@/lib/logger";
import { isBrevoConfigured, getAdminEmail, sendEmailViaBrevo } from "./brevo";
import {
  generateLowStockAlertEmail,
  generateStockOutNotificationEmail,
  generateOrderConfirmationEmail,
  generateInvoiceEmail,
  generateShippingNotificationEmail,
  generateOrderStatusUpdateEmail,
} from "./templates";
import type {
  LowStockAlertData,
  StockOutNotificationData,
  OrderConfirmationData,
  InvoiceEmailData,
  ShippingNotificationData,
  OrderStatusUpdateData,
} from "./types";
import { isEmailNotificationEnabled } from "./preferences";

/**
 * Email queue job types
 */
export type EmailQueueJobType =
  | "low_stock_alert"
  | "stock_out_notification"
  | "order_confirmation"
  | "invoice_email"
  | "shipping_notification"
  | "order_status_update";

/**
 * Email queue job payload
 */
export interface EmailQueueJob {
  type: EmailQueueJobType;
  data:
    | LowStockAlertData
    | StockOutNotificationData
    | OrderConfirmationData
    | InvoiceEmailData
    | ShippingNotificationData
    | OrderStatusUpdateData;
  recipientEmail: string;
  recipientName?: string;
  userId?: string;
}

/**
 * Queue email notification
 * Uses QStash if configured, otherwise sends directly
 *
 * @param job - Email queue job payload
 * @returns Promise<void> - Resolves when job is queued or sent
 */
export async function queueEmailNotification(
  job: EmailQueueJob
): Promise<void> {
  // If QStash is not configured, send directly
  if (!isQStashConfigured()) {
    logger.debug("QStash not configured, sending email directly", {
      type: job.type,
    });
    return sendEmailDirectly(job);
  }

  try {
    const qstash = getQStash();
    if (!qstash) {
      // Fallback to direct sending
      return sendEmailDirectly(job);
    }

    // Get base URL for webhook endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/email/queue/process`;

    // Queue the email job via QStash
    await qstash.publishJSON({
      url: webhookUrl,
      body: job,
      // Retry failed jobs up to 3 times
      retries: 3,
      // Delay between retries (exponential backoff)
      delay: 5, // 5 seconds initial delay
    });

    logger.info("Email notification queued successfully", {
      type: job.type,
      recipientEmail: job.recipientEmail,
    });
  } catch (error) {
    logger.error("Failed to queue email notification, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
      type: job.type,
    });
    // Fallback to direct sending on error
    return sendEmailDirectly(job);
  }
}

/**
 * Send email directly (fallback when QStash is not available)
 * Also used by webhook handler to process queued emails
 *
 * @param job - Email queue job payload
 * @returns Promise<void> - Resolves when email is sent
 */
/**
 * Send email directly (internal function used by queue handler)
 * This function sends emails without going through the queue
 * Used by webhook handler to process queued emails
 *
 * @param job - Email queue job payload
 * @returns Promise<void> - Resolves when email is sent
 */
export async function sendEmailDirectly(job: EmailQueueJob): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn("Brevo email service is not configured, skipping email", {
      type: job.type,
    });
    return;
  }

  try {
    switch (job.type) {
      case "low_stock_alert": {
        const data = job.data as LowStockAlertData;
        // Check user preferences if userId provided
        if (job.userId) {
          const isEnabled = await isEmailNotificationEnabled(
            job.userId,
            "lowStockAlerts"
          );
          if (!isEnabled) {
            logger.info("Low stock alert email disabled by user preferences", {
              userId: job.userId,
            });
            return;
          }
        }
        const emailContent = generateLowStockAlertEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || "Administrator",
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["low_stock_alert", "alert", "low_stock"],
        });
        if (result.success) {
          logger.info("Low stock alert email sent successfully", {
            messageId: result.messageId,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      case "stock_out_notification": {
        const data = job.data as StockOutNotificationData;
        // Check user preferences if userId provided
        if (job.userId) {
          const isEnabled = await isEmailNotificationEnabled(
            job.userId,
            "stockOutNotifications"
          );
          if (!isEnabled) {
            logger.info(
              "Stock out notification email disabled by user preferences",
              {
                userId: job.userId,
              }
            );
            return;
          }
        }
        const emailContent = generateStockOutNotificationEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || "Administrator",
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["stock_out_notification", "alert", "stock_out"],
        });
        if (result.success) {
          logger.info("Stock out notification email sent successfully", {
            messageId: result.messageId,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      case "order_confirmation": {
        const data = job.data as OrderConfirmationData;
        const emailContent = generateOrderConfirmationEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || data.clientName,
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["order_confirmation", "transactional"],
        });
        if (result.success) {
          logger.info("Order confirmation email sent successfully", {
            messageId: result.messageId,
            orderNumber: data.orderNumber,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      case "invoice_email": {
        const data = job.data as InvoiceEmailData;
        const emailContent = generateInvoiceEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || data.clientName,
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["invoice_email", "transactional"],
        });
        if (result.success) {
          logger.info("Invoice email sent successfully", {
            messageId: result.messageId,
            invoiceNumber: data.invoiceNumber,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      case "shipping_notification": {
        const data = job.data as ShippingNotificationData;
        const emailContent = generateShippingNotificationEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || data.clientName,
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["shipping_notification", "transactional"],
        });
        if (result.success) {
          logger.info("Shipping notification email sent successfully", {
            messageId: result.messageId,
            orderNumber: data.orderNumber,
            trackingNumber: data.trackingNumber,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      case "order_status_update": {
        const data = job.data as OrderStatusUpdateData;
        const emailContent = generateOrderStatusUpdateEmail(data);
        const result = await sendEmailViaBrevo({
          to: {
            email: job.recipientEmail,
            name: job.recipientName || data.clientName,
          },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
          tags: ["order_status_update", "transactional"],
        });
        if (result.success) {
          logger.info("Order status update email sent successfully", {
            messageId: result.messageId,
            orderNumber: data.orderNumber,
            newStatus: data.newStatus,
            recipientEmail: job.recipientEmail,
          });
        }
        break;
      }
      default:
        logger.error("Unknown email queue job type", { type: job.type });
    }
  } catch (error) {
    logger.error("Failed to send email directly", {
      error: error instanceof Error ? error.message : "Unknown error",
      type: job.type,
    });
  }
}

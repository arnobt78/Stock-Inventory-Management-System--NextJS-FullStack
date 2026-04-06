/**
 * Email Notification Utilities
 * Helper functions for sending automatic email notifications
 * Integrates with product management system
 */

import { logger } from "@/lib/logger";
import { isBrevoConfigured, getAdminEmail } from "./brevo";
import { sendEmailViaBrevo } from "./brevo";
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
import { queueEmailNotification } from "./queue";
import {
  createLowStockNotification,
  createStockOutNotification,
} from "@/lib/notifications/in-app";

/**
 * Low stock threshold (default: 20)
 * Products with quantity <= this threshold trigger low stock alerts
 */
const LOW_STOCK_THRESHOLD = 20;

/**
 * Check if product quantity triggers low stock alert
 *
 * @param quantity - Current product quantity
 * @param threshold - Low stock threshold (default: 20)
 * @returns boolean - True if quantity is low stock
 */
export function isLowStock(
  quantity: number,
  threshold: number = LOW_STOCK_THRESHOLD
): boolean {
  return quantity > 0 && quantity <= threshold;
}

/**
 * Check if product is out of stock
 *
 * @param quantity - Current product quantity
 * @returns boolean - True if quantity is 0
 */
export function isOutOfStock(quantity: number): boolean {
  return quantity === 0;
}

/**
 * Send low stock alert email notification
 * This function sends email asynchronously and doesn't block the calling function
 * Checks user email preferences before sending
 *
 * @param data - Low stock alert data
 * @param recipientEmail - Recipient email address (default: admin email from config)
 * @param recipientName - Recipient name (optional)
 * @param userId - User ID to check email preferences (optional)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendLowStockAlert(
  data: LowStockAlertData,
  recipientEmail?: string,
  recipientName?: string,
  userId?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping low stock alert"
    );
    return;
  }

  // Check user email preferences if userId is provided
  if (userId) {
    const isEnabled = await isEmailNotificationEnabled(
      userId,
      "lowStockAlerts"
    );
    if (!isEnabled) {
      logger.info("Low stock alert email disabled by user preferences", {
        userId,
        productName: data.productName,
      });
      return;
    }
  }

  // Use provided email or fallback to admin email
  const email = recipientEmail || getAdminEmail();
  if (!email) {
    logger.warn(
      "No recipient email provided and no admin email configured, skipping low stock alert"
    );
    return;
  }

  // Create in-app notification (async, non-blocking)
  if (userId) {
    // Extract productId from metadata if available (for future enhancement)
    const productId = (data as unknown as { productId?: string })?.productId;
    createLowStockNotification(
      data.productName,
      data.currentQuantity,
      data.threshold,
      userId,
      data.sku,
      productId
    ).catch((error) => {
      logger.warn("Failed to create in-app low stock notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
    });
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "low_stock_alert",
      data,
      recipientEmail: email,
      recipientName,
      userId,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue low stock alert, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateLowStockAlertEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email,
        name: recipientName || "Administrator",
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: ["low_stock_alert", "alert", "low_stock"],
    });

    if (result.success) {
      logger.info("Low stock alert email sent successfully", {
        messageId: result.messageId,
        productName: data.productName,
        recipientEmail: email,
      });
    } else {
      logger.error("Failed to send low stock alert email", {
        error: result.error,
        productName: data.productName,
        recipientEmail: email,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending low stock alert email", {
      error: error instanceof Error ? error.message : "Unknown error",
      productName: data.productName,
      recipientEmail: email,
    });
  }
}

/**
 * Send stock out notification email
 * This function sends email asynchronously and doesn't block the calling function
 * Checks user email preferences before sending
 *
 * @param data - Stock out notification data
 * @param recipientEmail - Recipient email address (default: admin email from config)
 * @param recipientName - Recipient name (optional)
 * @param userId - User ID to check email preferences (optional)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendStockOutNotification(
  data: StockOutNotificationData,
  recipientEmail?: string,
  recipientName?: string,
  userId?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping stock out notification"
    );
    return;
  }

  // Check user email preferences if userId is provided
  if (userId) {
    const isEnabled = await isEmailNotificationEnabled(
      userId,
      "stockOutNotifications"
    );
    if (!isEnabled) {
      logger.info("Stock out notification email disabled by user preferences", {
        userId,
        productName: data.productName,
      });
      return;
    }
  }

  // Use provided email or fallback to admin email
  const email = recipientEmail || getAdminEmail();
  if (!email) {
    logger.warn(
      "No recipient email provided and no admin email configured, skipping stock out notification"
    );
    return;
  }

  // Create in-app notification (async, non-blocking)
  if (userId) {
    // Extract productId from metadata if available (for future enhancement)
    const productId = (data as unknown as { productId?: string })?.productId;
    createStockOutNotification(
      data.productName,
      userId,
      data.sku,
      productId
    ).catch((error) => {
      logger.warn("Failed to create in-app stock out notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
    });
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "stock_out_notification",
      data,
      recipientEmail: email,
      recipientName,
      userId,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue stock out notification, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateStockOutNotificationEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email,
        name: recipientName || "Administrator",
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: ["stock_out_notification", "alert", "stock_out"],
    });

    if (result.success) {
      logger.info("Stock out notification email sent successfully", {
        messageId: result.messageId,
        productName: data.productName,
        recipientEmail: email,
      });
    } else {
      logger.error("Failed to send stock out notification email", {
        error: result.error,
        productName: data.productName,
        recipientEmail: email,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending stock out notification email", {
      error: error instanceof Error ? error.message : "Unknown error",
      productName: data.productName,
      recipientEmail: email,
    });
  }
}

/**
 * Check product stock level and send appropriate email alerts
 * This function checks both low stock and out of stock conditions
 * Checks user email preferences before sending
 *
 * @param product - Product data
 * @param previousQuantity - Previous quantity (for update operations, to avoid duplicate alerts)
 * @param recipientEmail - Recipient email address (optional)
 * @param recipientName - Recipient name (optional)
 * @param userId - User ID to check email preferences (optional)
 * @returns Promise<void> - Resolves when alerts are sent (or fail silently)
 */
export async function checkAndSendStockAlerts(
  product: {
    name: string;
    quantity: number;
    sku?: string;
    category?: string;
  },
  previousQuantity?: number,
  recipientEmail?: string,
  recipientName?: string,
  userId?: string
): Promise<void> {
  const currentQuantity = Number(product.quantity);
  const prevQuantity =
    previousQuantity !== undefined ? Number(previousQuantity) : undefined;

  // Check for stock out (quantity is 0)
  if (isOutOfStock(currentQuantity)) {
    // Only send alert if product wasn't already out of stock
    if (prevQuantity === undefined || prevQuantity > 0) {
      await sendStockOutNotification(
        {
          productName: product.name,
          sku: product.sku,
          category: product.category,
        },
        recipientEmail,
        recipientName,
        userId
      );
    }
    return; // Don't send low stock alert if already out of stock
  }

  // Check for low stock (quantity > 0 and <= threshold)
  if (isLowStock(currentQuantity)) {
    // Only send alert if product just became low stock (was above threshold before)
    if (prevQuantity === undefined || prevQuantity > LOW_STOCK_THRESHOLD) {
      await sendLowStockAlert(
        {
          productName: product.name,
          currentQuantity,
          threshold: LOW_STOCK_THRESHOLD,
          sku: product.sku,
          category: product.category,
        },
        recipientEmail,
        recipientName,
        userId
      );
    }
  }
}

/**
 * Send order confirmation email
 * Sent to client when order is placed
 * This function sends email asynchronously and doesn't block the calling function
 *
 * @param data - Order confirmation data
 * @param recipientEmail - Recipient email address (client email)
 * @param recipientName - Recipient name (client name)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendOrderConfirmation(
  data: OrderConfirmationData,
  recipientEmail: string,
  recipientName?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping order confirmation email"
    );
    return;
  }

  if (!recipientEmail) {
    logger.warn(
      "No recipient email provided, skipping order confirmation email"
    );
    return;
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "order_confirmation",
      data,
      recipientEmail,
      recipientName,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue order confirmation, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateOrderConfirmationEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email: recipientEmail,
        name: recipientName || data.clientName,
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: ["order_confirmation", "order", "confirmation"],
    });

    if (result.success) {
      logger.info("Order confirmation email sent successfully", {
        messageId: result.messageId,
        orderNumber: data.orderNumber,
        recipientEmail,
      });
    } else {
      logger.error("Failed to send order confirmation email", {
        error: result.error,
        orderNumber: data.orderNumber,
        recipientEmail,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending order confirmation email", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderNumber: data.orderNumber,
      recipientEmail,
    });
  }
}

/**
 * Send invoice email
 * Sent to client with invoice details and payment link
 * This function sends email asynchronously and doesn't block the calling function
 *
 * @param data - Invoice email data
 * @param recipientEmail - Recipient email address (client email)
 * @param recipientName - Recipient name (client name)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendInvoiceEmail(
  data: InvoiceEmailData,
  recipientEmail: string,
  recipientName?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping invoice email"
    );
    return;
  }

  if (!recipientEmail) {
    logger.warn("No recipient email provided, skipping invoice email");
    return;
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "invoice_email",
      data,
      recipientEmail,
      recipientName,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue invoice email, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateInvoiceEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email: recipientEmail,
        name: recipientName || data.clientName,
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: [
        "invoice_email",
        "invoice",
        data.status === "overdue" ? "overdue" : "payment",
      ],
    });

    if (result.success) {
      logger.info("Invoice email sent successfully", {
        messageId: result.messageId,
        invoiceNumber: data.invoiceNumber,
        recipientEmail,
      });
    } else {
      logger.error("Failed to send invoice email", {
        error: result.error,
        invoiceNumber: data.invoiceNumber,
        recipientEmail,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending invoice email", {
      error: error instanceof Error ? error.message : "Unknown error",
      invoiceNumber: data.invoiceNumber,
      recipientEmail,
    });
  }
}

/**
 * Send shipping notification email
 * Sent to client when order is shipped with tracking information
 * This function sends email asynchronously and doesn't block the calling function
 *
 * @param data - Shipping notification data
 * @param recipientEmail - Recipient email address (client email)
 * @param recipientName - Recipient name (client name)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendShippingNotification(
  data: ShippingNotificationData,
  recipientEmail: string,
  recipientName?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping shipping notification email"
    );
    return;
  }

  if (!recipientEmail) {
    logger.warn(
      "No recipient email provided, skipping shipping notification email"
    );
    return;
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "shipping_notification",
      data,
      recipientEmail,
      recipientName,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue shipping notification, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateShippingNotificationEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email: recipientEmail,
        name: recipientName || data.clientName,
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: ["shipping_notification", "shipping", "tracking"],
    });

    if (result.success) {
      logger.info("Shipping notification email sent successfully", {
        messageId: result.messageId,
        orderNumber: data.orderNumber,
        trackingNumber: data.trackingNumber,
        recipientEmail,
      });
    } else {
      logger.error("Failed to send shipping notification email", {
        error: result.error,
        orderNumber: data.orderNumber,
        recipientEmail,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending shipping notification email", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderNumber: data.orderNumber,
      recipientEmail,
    });
  }
}

/**
 * Send order status update email
 * Sent to client when order status changes
 * This function sends email asynchronously and doesn't block the calling function
 *
 * @param data - Order status update data
 * @param recipientEmail - Recipient email address (client email)
 * @param recipientName - Recipient name (client name)
 * @returns Promise<void> - Resolves when email is sent (or fails silently)
 */
export async function sendOrderStatusUpdate(
  data: OrderStatusUpdateData,
  recipientEmail: string,
  recipientName?: string
): Promise<void> {
  // Check if Brevo is configured
  if (!isBrevoConfigured()) {
    logger.warn(
      "Brevo email service is not configured, skipping order status update email"
    );
    return;
  }

  if (!recipientEmail) {
    logger.warn(
      "No recipient email provided, skipping order status update email"
    );
    return;
  }

  // Queue email notification (uses QStash if configured, otherwise sends directly)
  try {
    await queueEmailNotification({
      type: "order_status_update",
      data,
      recipientEmail,
      recipientName,
    });
    return; // Email queued or sent, exit early
  } catch (error) {
    logger.error("Failed to queue order status update, sending directly", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fall through to direct sending as fallback
  }

  // Direct sending fallback (if queue fails)
  try {
    // Generate email content
    const emailContent = generateOrderStatusUpdateEmail(data);

    // Send email directly via Brevo API
    const result = await sendEmailViaBrevo({
      to: {
        email: recipientEmail,
        name: recipientName || data.clientName,
      },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
      tags: ["order_status_update", "order", "status"],
    });

    if (result.success) {
      logger.info("Order status update email sent successfully", {
        messageId: result.messageId,
        orderNumber: data.orderNumber,
        newStatus: data.newStatus,
        recipientEmail,
      });
    } else {
      logger.error("Failed to send order status update email", {
        error: result.error,
        orderNumber: data.orderNumber,
        recipientEmail,
      });
    }
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the main operation
    logger.error("Error sending order status update email", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderNumber: data.orderNumber,
      recipientEmail,
    });
  }
}

/**
 * In-App Notification Utilities
 * Helper functions for creating in-app notifications
 * Complements email notifications with real-time in-app alerts
 */

import { createNotification } from "@/prisma/notification";
import { logger } from "@/lib/logger";
import type {
  CreateNotificationInput,
  NotificationType,
  NotificationMetadata,
} from "@/types/notification";

/**
 * Create an in-app notification
 * This function creates a notification in the database
 * Fails silently if there's an error (non-blocking)
 *
 * @param data - Notification creation data
 * @returns Promise<void> - Resolves when notification is created (or fails silently)
 */
export async function createInAppNotification(
  data: CreateNotificationInput
): Promise<void> {
  try {
    await createNotification(data);
    logger.debug("In-app notification created", {
      userId: data.userId,
      type: data.type,
      title: data.title,
    });
  } catch (error) {
    // Log error but don't throw - notification failure shouldn't break main operations
    logger.error("Failed to create in-app notification", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
      type: data.type,
    });
  }
}

/**
 * Create low stock notification
 *
 * @param productName - Product name
 * @param currentQuantity - Current product quantity
 * @param threshold - Low stock threshold
 * @param sku - Product SKU (optional)
 * @param productId - Product ID for linking (optional)
 * @param userId - User ID to send notification to
 * @returns Promise<void>
 */
export async function createLowStockNotification(
  productName: string,
  currentQuantity: number,
  threshold: number,
  userId: string,
  sku?: string,
  productId?: string
): Promise<void> {
  const metadata: NotificationMetadata = {};
  if (productId) metadata.productId = productId;
  if (sku) metadata.sku = sku;

  await createInAppNotification({
    userId,
    type: "low_stock",
    title: "Low Stock Alert",
    message: `${productName} is running low. Current quantity: ${currentQuantity} (threshold: ${threshold})${sku ? ` (SKU: ${sku})` : ""}`,
    link: productId ? `/products?search=${encodeURIComponent(productName)}` : undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}

/**
 * Create stock out notification
 *
 * @param productName - Product name
 * @param sku - Product SKU (optional)
 * @param productId - Product ID for linking (optional)
 * @param userId - User ID to send notification to
 * @returns Promise<void>
 */
export async function createStockOutNotification(
  productName: string,
  userId: string,
  sku?: string,
  productId?: string
): Promise<void> {
  const metadata: NotificationMetadata = {};
  if (productId) metadata.productId = productId;
  if (sku) metadata.sku = sku;

  await createInAppNotification({
    userId,
    type: "stock_out",
    title: "Stock Out Alert",
    message: `${productName} is out of stock${sku ? ` (SKU: ${sku})` : ""}. Please restock immediately.`,
    link: productId ? `/products?search=${encodeURIComponent(productName)}` : undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}

/**
 * Create order notification
 *
 * @param type - Notification type (order_confirmation, order_status_update, etc.)
 * @param orderNumber - Order number
 * @param message - Notification message
 * @param orderId - Order ID for linking (optional)
 * @param userId - User ID to send notification to
 * @returns Promise<void>
 */
export async function createOrderNotification(
  type: "order_confirmation" | "order_status_update" | "shipping_notification",
  orderNumber: string,
  message: string,
  userId: string,
  orderId?: string
): Promise<void> {
  const metadata: NotificationMetadata = {};
  if (orderId) metadata.orderId = orderId;

  let title: string;
  switch (type) {
    case "order_confirmation":
      title = "Order Confirmed";
      break;
    case "order_status_update":
      title = "Order Status Updated";
      break;
    case "shipping_notification":
      title = "Order Shipped";
      break;
    default:
      title = "Order Notification";
  }

  await createInAppNotification({
    userId,
    type,
    title: `${title} - ${orderNumber}`,
    message,
    link: orderId ? `/orders/${orderId}` : undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}

/**
 * Notify a product owner that a client placed an order containing their products.
 * Used after order creation: for each product owner (excluding the order placer), create one notification.
 *
 * @param orderId - Order ID for link
 * @param orderNumber - Order number for display
 * @param buyerDisplay - Buyer name/email (e.g. "Jane Doe (jane@example.com)")
 * @param productOwnerUserId - Product owner to notify
 */
export async function createClientOrderReceivedNotification(
  orderId: string,
  orderNumber: string,
  buyerDisplay: string,
  productOwnerUserId: string,
): Promise<void> {
  await createInAppNotification({
    userId: productOwnerUserId,
    type: "client_order_received",
    title: "New order from a client",
    message: `${buyerDisplay} placed order ${orderNumber} containing your products.`,
    link: `/admin/client-orders/${orderId}`,
    metadata: { orderId },
  });
}

/**
 * Notify product owner when someone submits a review for their product.
 *
 * @param productOwnerUserId - Product owner to notify
 * @param reviewId - Review ID for link
 * @param productName - Product name for message
 * @param reviewerDisplay - Reviewer name/email for message
 */
export async function createProductReviewSubmittedNotification(
  productOwnerUserId: string,
  reviewId: string,
  productName: string,
  reviewerDisplay: string,
): Promise<void> {
  await createInAppNotification({
    userId: productOwnerUserId,
    type: "product_review_submitted",
    title: "New product review",
    message: `${reviewerDisplay} left a review for "${productName}".`,
    link: `/admin/product-reviews/${reviewId}`,
    metadata: { reviewId, productName },
  });
}

/**
 * Notify order owner when an invoice is sent to them.
 *
 * @param orderOwnerUserId - Order owner (recipient) to notify
 * @param invoiceId - Invoice ID for link
 * @param invoiceNumber - Invoice number for message
 */
export async function createInvoiceSentNotification(
  orderOwnerUserId: string,
  invoiceId: string,
  invoiceNumber: string,
): Promise<void> {
  await createInAppNotification({
    userId: orderOwnerUserId,
    type: "invoice_sent",
    title: "Invoice sent",
    message: `Invoice ${invoiceNumber} has been sent to you.`,
    link: `/invoices/${invoiceId}`,
    metadata: { invoiceId, invoiceNumber },
  });
}

/**
 * Notify an admin that a new support ticket was created.
 *
 * @param adminUserId - Admin user to notify
 * @param ticketId - Support ticket ID for link
 * @param subject - Ticket subject for message
 * @param creatorDisplay - Creator name/email for message
 */
export async function createSupportTicketCreatedNotification(
  adminUserId: string,
  ticketId: string,
  subject: string,
  creatorDisplay: string,
): Promise<void> {
  await createInAppNotification({
    userId: adminUserId,
    type: "support_ticket_created",
    title: "New support ticket",
    message: `${creatorDisplay}: ${subject}`,
    link: `/admin/support-tickets/${ticketId}`,
    metadata: { ticketId, subject },
  });
}

/**
 * Notify a user that their support ticket was updated/replied (e.g. by admin).
 *
 * @param recipientUserId - User to notify (ticket creator or assignee)
 * @param ticketId - Support ticket ID for link
 * @param subject - Ticket subject for context
 * @param updaterDisplay - Name/email of who updated the ticket
 */
export async function createSupportTicketRepliedNotification(
  recipientUserId: string,
  ticketId: string,
  subject: string,
  updaterDisplay: string,
): Promise<void> {
  await createInAppNotification({
    userId: recipientUserId,
    type: "support_ticket_replied",
    title: "Support ticket updated",
    message: `${updaterDisplay} updated ticket: ${subject}`,
    link: `/admin/support-tickets/${ticketId}`,
    metadata: { ticketId, subject },
  });
}

/**
 * Create import notification
 *
 * @param type - Notification type (import_complete, import_failed)
 * @param fileName - Import file name
 * @param message - Notification message
 * @param importHistoryId - Import history ID for linking (optional)
 * @param userId - User ID to send notification to
 * @returns Promise<void>
 */
export async function createImportNotification(
  type: "import_complete" | "import_failed",
  fileName: string,
  message: string,
  userId: string,
  importHistoryId?: string
): Promise<void> {
  const metadata: NotificationMetadata = {};
  if (importHistoryId) metadata.importHistoryId = importHistoryId;

  await createInAppNotification({
    userId,
    type,
    title: type === "import_complete" ? "Import Complete" : "Import Failed",
    message: `${fileName}: ${message}`,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}

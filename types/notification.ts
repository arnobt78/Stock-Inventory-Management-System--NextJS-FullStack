/**
 * Notification-related type definitions
 */

/**
 * Notification type values
 */
export type NotificationType =
  | "low_stock"
  | "stock_out"
  | "order_confirmation"
  | "order_status_update"
  | "shipping_notification"
  | "client_order_received"
  | "product_review_submitted"
  | "invoice_ready"
  | "invoice_sent"
  | "support_ticket_created"
  | "support_ticket_replied"
  | "system_alert"
  | "import_complete"
  | "import_failed";

/**
 * Notification metadata interface
 * Contains optional context information for notifications
 */
export interface NotificationMetadata {
  productId?: string;
  orderId?: string;
  importHistoryId?: string;
  [key: string]: unknown;
}

/**
 * Notification interface matching Prisma schema
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: Date;
  readAt?: Date | null;
  metadata?: NotificationMetadata | null;
}

/**
 * Create notification input (without generated fields)
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: NotificationMetadata;
}

/**
 * Update notification input (mark as read/unread)
 */
export interface UpdateNotificationInput {
  id: string;
  read?: boolean;
}

/**
 * Notification filters for fetching notifications
 */
export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType[];
  limit?: number;
}

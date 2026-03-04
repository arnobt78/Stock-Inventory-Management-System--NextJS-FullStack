/**
 * Audit Log types
 */

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "export"
  | "import"
  | "send"
  | "payment"
  | "ship"
  | "settings_change";

export type AuditEntityType =
  | "product"
  | "order"
  | "invoice"
  | "user"
  | "supplier"
  | "category"
  | "warehouse"
  | "ticket"
  | "review"
  | "system_config"
  | "auth";

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  // Populated fields (from API)
  user?: {
    id: string;
    name?: string | null;
    username?: string;
    email: string;
  };
}

export interface CreateAuditLogInput {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  startDate?: string;
  endDate?: string;
}

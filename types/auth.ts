/**
 * Authentication-related type definitions
 */

/**
 * User interface for authentication context
 */
export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string; // Profile image URL (from Google OAuth or other sources)
  /** Role for access: user, admin, supplier, client, retailer. Defaults to "user" when not set. */
  role?: string;
}

/**
 * Auth context type definition
 */
export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isCheckingAuth: boolean;
  refreshSession: () => Promise<void>;
}

/**
 * Login request payload
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string; // user | admin | supplier | client | retailer; defaults to "user"
  sessionId: string;
}

/**
 * Email notification preference types
 */
export type EmailNotificationType =
  | "lowStockAlerts"
  | "stockOutNotifications"
  | "inventoryReports"
  | "productExpirationWarnings"
  | "orderConfirmations"
  | "invoiceEmails"
  | "shippingNotifications"
  | "orderStatusUpdates";

/**
 * Email preferences interface
 * Matches the structure stored in User.emailPreferences JSON field
 */
export interface EmailPreferences {
  lowStockAlerts: boolean;
  stockOutNotifications: boolean;
  inventoryReports: boolean;
  productExpirationWarnings: boolean;
  orderConfirmations: boolean;
  invoiceEmails: boolean;
  shippingNotifications: boolean;
  orderStatusUpdates: boolean;
}

/**
 * Default email preferences (all enabled by default)
 */
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  lowStockAlerts: true,
  stockOutNotifications: true,
  inventoryReports: true,
  productExpirationWarnings: true,
  orderConfirmations: true,
  invoiceEmails: true,
  shippingNotifications: true,
  orderStatusUpdates: true,
};

/**
 * Update email preferences input
 */
export interface UpdateEmailPreferencesInput {
  preferences: Partial<EmailPreferences>;
}

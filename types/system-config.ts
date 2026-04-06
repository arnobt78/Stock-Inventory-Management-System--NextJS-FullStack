/**
 * System Configuration types
 */

export type ConfigValueType = "string" | "number" | "boolean" | "json";

export type ConfigCategory =
  | "general"
  | "email"
  | "shipping"
  | "payment"
  | "notifications"
  | "inventory";

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: ConfigValueType;
  label: string;
  description?: string | null;
  category: ConfigCategory;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface UpdateSystemConfigInput {
  key: string;
  value: string;
}

export interface SystemConfigGroup {
  category: ConfigCategory;
  label: string;
  configs: SystemConfig[];
}

// Default configuration values
export const DEFAULT_CONFIGS: Omit<
  SystemConfig,
  "id" | "createdAt" | "updatedAt" | "updatedBy"
>[] = [
  {
    key: "company_name",
    value: "Stock Inventory Store",
    type: "string",
    label: "Company Name",
    description: "Your company or store name",
    category: "general",
    isPublic: true,
  },
  {
    key: "company_email",
    value: "support@stockinventory.com",
    type: "string",
    label: "Company Email",
    description: "Primary contact email",
    category: "general",
    isPublic: true,
  },
  {
    key: "company_phone",
    value: "+1 (555) 123-4567",
    type: "string",
    label: "Company Phone",
    description: "Primary contact phone number",
    category: "general",
    isPublic: true,
  },
  {
    key: "company_address",
    value: "123 Main St, New York, NY 10001",
    type: "string",
    label: "Company Address",
    description: "Business address for invoices and shipping",
    category: "general",
    isPublic: true,
  },
  {
    key: "low_stock_threshold",
    value: "20",
    type: "number",
    label: "Low Stock Threshold",
    description: "Products with quantity at or below this level trigger alerts",
    category: "inventory",
    isPublic: false,
  },
  {
    key: "enable_low_stock_alerts",
    value: "true",
    type: "boolean",
    label: "Enable Low Stock Alerts",
    description: "Send email alerts when products are low on stock",
    category: "notifications",
    isPublic: false,
  },
  {
    key: "enable_order_notifications",
    value: "true",
    type: "boolean",
    label: "Enable Order Notifications",
    description: "Send email notifications for new orders",
    category: "notifications",
    isPublic: false,
  },
  {
    key: "default_tax_rate",
    value: "0",
    type: "number",
    label: "Default Tax Rate (%)",
    description: "Default tax rate applied to orders (percentage)",
    category: "payment",
    isPublic: false,
  },
  {
    key: "currency",
    value: "USD",
    type: "string",
    label: "Currency",
    description: "Default currency for prices and transactions",
    category: "payment",
    isPublic: true,
  },
  {
    key: "default_shipping_carrier",
    value: "usps",
    type: "string",
    label: "Default Shipping Carrier",
    description: "Preferred shipping carrier for orders",
    category: "shipping",
    isPublic: false,
  },
];

// Category labels for display
export const CATEGORY_LABELS: Record<ConfigCategory, string> = {
  general: "General Settings",
  email: "Email Settings",
  shipping: "Shipping Settings",
  payment: "Payment Settings",
  notifications: "Notification Settings",
  inventory: "Inventory Settings",
};

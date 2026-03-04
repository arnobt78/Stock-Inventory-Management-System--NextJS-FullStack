/**
 * User Management (admin) type definitions
 */

export type UserRole = "user" | "admin" | "supplier" | "client" | "retailer";

export interface UserOverview {
  orderCount: number;
  invoiceCount: number;
  totalRevenue: number;
  totalSpent: number;
  totalDue: number;
  productCount: number;
  supplierCount: number;
  categoryCount: number;
  warehouseCount: number;
}

export interface UserForAdmin {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: UserRole | null;
  image: string | null;
  createdAt: string;
  updatedAt: string | null;
  overview?: UserOverview;
}

export interface UpdateUserAdminInput {
  role?: UserRole | null;
  name?: string;
}

export interface CreateUserAdminInput {
  email: string;
  name: string;
  password: string;
  username?: string;
  role?: UserRole | null;
}

export interface UserManagementFilters {
  role?: UserRole | UserRole[];
  search?: string;
}

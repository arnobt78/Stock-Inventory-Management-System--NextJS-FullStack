/**
 * API Response Types
 * Standardized response format for all API endpoints
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Error Response
 * Standardized error format for all API endpoints
 */
export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Validation Error
 * For form validation and request validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse extends ApiError {
  errors: ValidationError[];
}

/**
 * Admin sidebar badge counts (Orders, Invoices, Support Tickets, Product Reviews,
 * Products, Warehouses, Supplier Portal, Client Portal, User Management).
 */
export interface AdminCounts {
  clientOrders: number;
  clientInvoices: number;
  supportTickets: number;
  productReviews: number;
  products: number;
  warehouses: number;
  suppliers: number;
  clients: number;
  users: number;
}

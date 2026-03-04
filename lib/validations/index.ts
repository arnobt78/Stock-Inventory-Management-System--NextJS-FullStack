/**
 * Validation schemas exports
 * Centralized export point for all Zod validation schemas
 */

// Product validations
export {
  productSchema,
  createProductSchema,
  updateProductSchema,
  calculateProductStatus,
  type ProductFormData,
} from "./product";

// Auth validations
export {
  registerSchema,
  loginSchema,
  type RegisterFormData,
  type LoginFormData,
} from "./auth";

// Category validations
export {
  createCategorySchema,
  updateCategorySchema,
  type CategoryFormData,
} from "./category";

// Supplier validations
export {
  createSupplierSchema,
  updateSupplierSchema,
  type SupplierFormData,
} from "./supplier";

// Order validations
export {
  createOrderSchema,
  updateOrderSchema,
  shippingAddressSchema,
  billingAddressSchema,
  orderItemSchema,
  type CreateOrderFormData,
  type UpdateOrderFormData,
} from "./order";

// Invoice validations
export {
  createInvoiceSchema,
  updateInvoiceSchema,
  type CreateInvoiceFormData,
  type UpdateInvoiceFormData,
} from "./invoice";

// Support Ticket validations
export {
  createSupportTicketSchema,
  createSupportTicketReplySchema,
  updateSupportTicketSchema,
  type CreateSupportTicketFormData,
  type UpdateSupportTicketFormData,
} from "./support-ticket";

// Product Review validations
export {
  createProductReviewSchema,
  updateProductReviewSchema,
  type CreateProductReviewFormData,
  type UpdateProductReviewFormData,
} from "./product-review";

// User Management (admin) validations
export {
  updateUserAdminSchema,
  createUserAdminSchema,
  type UpdateUserAdminFormData,
  type CreateUserAdminFormData,
} from "./user-management";

export {
  createStockAllocationSchema,
  updateStockAllocationSchema,
  createStockTransferSchema,
  type CreateStockAllocationFormData,
  type UpdateStockAllocationFormData,
  type CreateStockTransferFormData,
} from "./stock-allocation";

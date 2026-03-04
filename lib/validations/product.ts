/**
 * Product validation schemas
 * Zod schemas used by product forms and API; productSchema for form, createProductSchema/updateProductSchema for API.
 * calculateProductStatus() derives "available" | "stock_low" | "stock_out" from quantity and reservedQuantity.
 */

import { z } from "zod";
import type { ProductStatus } from "@/types";

/**
 * Product form validation schema
 * Used for creating and updating products
 */
export const productSchema = z.object({
  productName: z
    .string()
    .min(1, "Product Name is required")
    .max(100, "Product Name must be 100 characters or less"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .regex(/^[a-zA-Z0-9-_]+$/, "SKU must be alphanumeric"),
  quantity: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return 0;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? 0 : num;
    },
    z
      .number()
      .int("Quantity must be an integer")
      .nonnegative("Quantity cannot be negative")
  ),
  price: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return 0;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? 0 : num;
    },
    z.number().nonnegative("Price cannot be negative")
  ),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  imageFileId: z.string().optional(),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
});

/**
 * Product form data type inferred from schema
 */
export type ProductFormData = z.infer<typeof productSchema>;

/**
 * Product creation input validation schema
 * For API requests
 */
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-_]+$/),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  status: z.enum(["Available", "Stock Low", "Stock Out"]),
  categoryId: z.string().min(1),
  supplierId: z.string().min(1),
  userId: z.string().min(1),
});

/**
 * Product update input validation schema
 * For API requests
 */
export const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  sku: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  status: z.enum(["Available", "Stock Low", "Stock Out"]).optional(),
  categoryId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  imageFileId: z.string().optional(),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
});

/**
 * Calculate product status based on quantity
 * @param quantity - Product quantity
 * @returns ProductStatus
 */
export const calculateProductStatus = (quantity: number): ProductStatus => {
  if (quantity > 20) return "Available";
  if (quantity > 0 && quantity <= 20) return "Stock Low";
  return "Stock Out";
};


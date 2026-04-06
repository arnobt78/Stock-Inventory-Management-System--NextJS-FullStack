/**
 * Product Review validation schemas
 */

import { z } from "zod";

export const createProductReviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be 1–5")
    .max(5, "Rating must be 1–5"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(2000, "Comment too long"),
  orderId: z.string().optional(),
  orderItemId: z.string().optional(),
});

export const updateProductReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(2000).optional(),
});

export type CreateProductReviewFormData = z.infer<
  typeof createProductReviewSchema
>;
export type UpdateProductReviewFormData = z.infer<
  typeof updateProductReviewSchema
>;

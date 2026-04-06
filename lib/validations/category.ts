/**
 * Category validation schemas
 * Centralized Zod schemas for category-related forms and API requests
 */

import { z } from "zod";

/**
 * Category creation schema
 * Used for creating new categories
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  userId: z.string().min(1, "User ID is required"),
  status: z.boolean().optional().default(true), // Active/Inactive status (default: true)
  description: z.string().max(500, "Description must be 500 characters or less").nullable().optional(), // Optional description
  notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(), // Optional notes
});

/**
 * Category update schema
 * Used for updating existing categories
 */
export const updateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  status: z.boolean().optional(), // Optional status update
  description: z.string().max(500, "Description must be 500 characters or less").nullable().optional(), // Optional description update
  notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(), // Optional notes update
});

/**
 * Category form data type
 */
export type CategoryFormData = z.infer<typeof createCategorySchema>;


/**
 * Supplier validation schemas
 * Centralized Zod schemas for supplier-related forms and API requests
 */

import { z } from "zod";

/**
 * Supplier creation schema
 * Used for creating new suppliers
 */
export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(100, "Supplier name must be 100 characters or less"),
  userId: z.string().min(1, "User ID is required"),
  status: z.boolean().optional().default(true), // Active/Inactive status (default: true)
  description: z.string().max(500, "Description must be 500 characters or less").nullable().optional(), // Optional description
  notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(), // Optional notes
});

/**
 * Supplier update schema
 * Used for updating existing suppliers
 */
export const updateSupplierSchema = z.object({
  id: z.string().min(1, "Supplier ID is required"),
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(100, "Supplier name must be 100 characters or less"),
  status: z.boolean().optional(), // Optional status update
  description: z.string().max(500, "Description must be 500 characters or less").nullable().optional(), // Optional description update
  notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(), // Optional notes update
});

/**
 * Supplier form data type
 */
export type SupplierFormData = z.infer<typeof createSupplierSchema>;


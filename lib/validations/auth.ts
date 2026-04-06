/**
 * Authentication validation schemas
 * Centralized Zod schemas for authentication-related forms and API requests
 */

import { z } from "zod";

/**
 * User registration schema
 * Used for both client-side form validation and server-side API validation
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be 100 characters or less"),
});

/**
 * User registration form data type
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * User login schema
 * Used for both client-side form validation and server-side API validation
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * User login form data type
 */
export type LoginFormData = z.infer<typeof loginSchema>;


/**
 * User Management (admin) validation schemas
 */

import { z } from "zod";

const userRoleEnum = z.enum([
  "user",
  "admin",
  "supplier",
  "client",
  "retailer",
]);

export const updateUserAdminSchema = z.object({
  role: userRoleEnum.nullable().optional(),
  name: z.string().min(1, "Name is required").max(200).optional(),
});

export const createUserAdminSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required").max(200),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3).max(50).optional(),
  role: userRoleEnum.nullable().optional(),
});

export type UpdateUserAdminFormData = z.infer<typeof updateUserAdminSchema>;
export type CreateUserAdminFormData = z.infer<typeof createUserAdminSchema>;

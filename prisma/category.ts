import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";

/**
 * Create a new category with audit fields
 */
export const createCategory = async (data: {
  name: string;
  userId: string;
}) => {
  logger.debug("Creating category with data:", data);
  return prisma.category.create({
    data: {
      name: data.name,
      userId: data.userId,
      createdBy: data.userId, // Set createdBy same as userId
      createdAt: new Date(),
    },
  });
};

export const getCategoriesByUser = async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
  });
};

/**
 * Get category by ID with all related data
 * Fetches a single category with products and related order items
 *
 * @param categoryId - Category ID
 * @param userId - User ID (for authorization check)
 * @returns Promise<Category | null> - Category or null if not found
 */
export const getCategoryById = async (categoryId: string, userId: string) => {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId, // Ensure user can only access their own categories
    },
  });
};

/**
 * Update a category with audit fields
 */
export const updateCategory = async (
  id: string,
  data: { name?: string; updatedBy?: string }
) => {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.updatedBy && { updatedBy: data.updatedBy }),
      updatedAt: new Date(), // Always update timestamp
    },
  });
};

export const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};

/**
 * Product repository: create, get, update products with Prisma.
 * getProductById enforces userId so only the owner can access; used by API and server data.
 */
import { prisma } from "@/prisma/client";

/**
 * Create a new product with audit fields
 */
export const createProduct = async (data: {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status: string;
  userId: string;
  categoryId: string;
  supplierId: string;
  createdAt: Date;
}) => {
  return prisma.product.create({
    data: {
      ...data,
      createdBy: data.userId, // Set createdBy same as userId
    },
  });
};

export const getProductsByUser = async (userId: string) => {
  return prisma.product.findMany({
    where: { userId },
  });
};

/**
 * Get product by ID with all related data
 * Fetches a single product with category, supplier, creator user, and order items
 *
 * @param productId - Product ID
 * @param userId - User ID (for authorization check)
 * @returns Promise<Product | null> - Product or null if not found
 */
export const getProductById = async (productId: string, userId: string) => {
  return prisma.product.findFirst({
    where: {
      id: productId,
      userId, // Ensure user can only access their own products
    },
    include: {
      // Include order items to show which orders contain this product
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              subtotal: true,
              total: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

/**
 * Update a product with audit fields
 */
export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    sku?: string;
    price?: number;
    quantity?: number;
    status?: string;
    categoryId?: string;
    supplierId?: string;
    updatedBy?: string;
  }
) => {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(data.updatedBy && { updatedBy: data.updatedBy }),
      updatedAt: new Date(), // Always update timestamp
    },
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};

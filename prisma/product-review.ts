/**
 * Product Review Prisma Utilities
 * Helper functions for product review database operations
 */

import { prisma } from "@/prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  CreateProductReviewInput,
  UpdateProductReviewInput,
} from "@/types";

/**
 * Create a new product review
 * Fetches product name/sku for snapshot, then creates review.
 */
export async function createProductReview(
  data: CreateProductReviewInput,
  userId: string,
) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { name: true, sku: true },
  });
  if (!product) throw new Error("Product not found");

  const now = new Date();
  return prisma.productReview.create({
    data: {
      productId: data.productId,
      userId,
      orderId: data.orderId ?? null,
      orderItemId: data.orderItemId ?? null,
      productName: product.name,
      productSku: product.sku,
      rating: data.rating,
      comment: data.comment,
      status: "pending",
      updatedAt: now,
    },
  });
}

/**
 * Get all product reviews (admin list). Ordered by createdAt desc.
 */
export async function getAllProductReviews(limit = 100) {
  return prisma.productReview.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get product reviews only for products owned by the given user (product owner).
 * Used on admin product reviews page so each admin sees only reviews for their own products.
 */
export async function getProductReviewsForProductOwner(
  productOwnerId: string,
  limit = 100,
) {
  const products = await prisma.product.findMany({
    where: { userId: productOwnerId },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);
  if (productIds.length === 0) return [];
  return prisma.productReview.findMany({
    where: { productId: { in: productIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get a single product review by ID
 */
export async function getProductReviewById(id: string) {
  return prisma.productReview.findUnique({
    where: { id },
  });
}

/**
 * Update a product review (status, rating, comment)
 */
export async function updateProductReview(
  id: string,
  data: UpdateProductReviewInput,
) {
  const updateData: Prisma.ProductReviewUpdateInput = {
    updatedAt: new Date(),
  };
  if (data.status != null) updateData.status = data.status;
  if (data.rating != null) updateData.rating = data.rating;
  if (data.comment != null) updateData.comment = data.comment;

  return prisma.productReview.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a product review
 */
export async function deleteProductReview(id: string) {
  return prisma.productReview.delete({
    where: { id },
  });
}

/**
 * Check if user already wrote a review for this order+product (one per purchase).
 */
export async function hasExistingReview(
  orderId: string,
  productId: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.productReview.findFirst({
    where: { orderId, productId, userId },
  });
  return !!existing;
}

/**
 * Get eligible slots for user to write a review for a product (paid orders containing product, no review yet).
 */
export async function getEligibleReviewSlots(
  userId: string,
  productId: string,
): Promise<{ orderId: string; orderItemId: string }[]> {
  const paidOrderItems = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        paymentStatus: "paid",
        OR: [{ clientId: userId }, { userId, clientId: null }],
      },
    },
    select: { id: true, orderId: true },
  });
  if (paidOrderItems.length === 0) return [];

  const orderIds = [...new Set(paidOrderItems.map((i) => i.orderId))];
  const existing = await prisma.productReview.findMany({
    where: { userId, productId, orderId: { in: orderIds } },
    select: { orderId: true },
  });
  const reviewedOrderIds = new Set(existing.map((r) => r.orderId));

  const slots: { orderId: string; orderItemId: string }[] = [];
  for (const item of paidOrderItems) {
    if (!reviewedOrderIds.has(item.orderId)) {
      slots.push({ orderId: item.orderId, orderItemId: item.id });
    }
  }
  return slots;
}

/** Get reviews for a product (for display on product page). */
export async function getReviewsByProductId(
  productId: string,
  options: { status?: "approved" | "pending" | "all" } = {},
) {
  const statusFilter =
    options.status === "all"
      ? undefined
      : options.status === "pending"
        ? { status: "pending" }
        : { status: "approved" };
  return prisma.productReview.findMany({
    where: { productId, ...statusFilter },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

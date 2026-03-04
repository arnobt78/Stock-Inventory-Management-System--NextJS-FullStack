/**
 * Product Review type definitions
 */

export type ProductReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  orderItemId: string | null;
  productName: string;
  productSku: string | null;
  rating: number;
  comment: string;
  status: ProductReviewStatus;
  createdAt: string;
  updatedAt: string | null;
  /** Present when API returns detail or by-product list (reviewer display). */
  reviewerName?: string | null;
  /** Present when API returns detail or by-product list. */
  reviewerEmail?: string;
  /** Present when API returns by-product list (avatar in review card). */
  reviewerImage?: string | null;
}

export interface CreateProductReviewInput {
  productId: string;
  rating: number;
  comment: string;
  /** Required for user-submitted reviews: order this purchase relates to (one review per purchase). */
  orderId?: string;
  /** Optional: specific order line when order has multiple lines of same product. */
  orderItemId?: string;
}

/** One eligible "slot" to write a review (paid purchase with no review yet). */
export interface ReviewEligibilitySlot {
  orderId: string;
  orderItemId?: string;
}

export interface UpdateProductReviewInput {
  status?: ProductReviewStatus;
  rating?: number;
  comment?: string;
}

export interface ProductReviewFilters {
  status?: ProductReviewStatus | ProductReviewStatus[];
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  search?: string;
}

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ProductReviewList from "./ProductReviewList";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { ProductReview } from "@/types";

export type AdminProductReviewsContentProps = {
  initialReviews?: ProductReview[];
};

/**
 * Admin Product Reviews section — list inside admin layout.
 * Matches AdminOrdersContent / AdminHistoryContent / AdminSupportTicketsContent pattern.
 */
export default function AdminProductReviewsContent({
  initialReviews,
}: AdminProductReviewsContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialReviews != null) {
      queryClient.setQueryData(
        queryKeys.productReviews.lists(),
        initialReviews,
      );
    }
  }, [queryClient, initialReviews]);

  return (
    <PageContentWrapper>
      <ProductReviewList detailHrefBase="/admin/product-reviews" />
    </PageContentWrapper>
  );
}

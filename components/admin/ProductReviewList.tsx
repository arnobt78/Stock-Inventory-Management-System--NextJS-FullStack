/**
 * Product Review List Component
 * List view for admin product reviews with filters, table, and create button
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts";
import { useProductReviews, useDashboard } from "@/hooks/queries";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { createProductReviewColumns } from "./ProductReviewTableColumns";
import ProductReviewFilters from "./ProductReviewFilters";
import { ProductReviewTable } from "./ProductReviewTable";
import ProductReviewDialog from "./ProductReviewDialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";

export type ProductReviewListProps = {
  detailHrefBase?: string;
};

export default function ProductReviewList({
  detailHrefBase,
}: ProductReviewListProps = {}) {
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const reviewsQuery = useProductReviews();
  const dashboardQuery = useDashboard();
  const dashboard = dashboardQuery.data ?? null;
  const { isCheckingAuth } = useAuth();

  const allReviews = reviewsQuery.data ?? [];

  const ratingBreakdown = useMemo(() => {
    const r5 = allReviews.filter((r) => r.rating === 5).length;
    const r4 = allReviews.filter((r) => r.rating === 4).length;
    const r3 = allReviews.filter((r) => r.rating === 3).length;
    const r2 = allReviews.filter((r) => r.rating === 2).length;
    const r1 = allReviews.filter((r) => r.rating === 1).length;
    return { r5, r4, r3, r2, r1 };
  }, [allReviews]);

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((s, r) => s + (r.rating ?? 0), 0);
    return Math.round((sum / allReviews.length) * 10) / 10;
  }, [allReviews]);

  const avgRatingLabel = useMemo(() => {
    const r = Math.min(5, Math.max(1, Math.round(avgRating)));
    const labels: Record<number, string> = {
      5: "best",
      4: "very good",
      3: "good",
      2: "not good",
      1: "bad",
    };
    return labels[r] ?? "—";
  }, [avgRating]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const columns = useMemo(
    () =>
      createProductReviewColumns(detailHrefBase ?? "/admin/product-reviews"),
    [detailHrefBase],
  );

  const showSkeleton = !isMounted || isCheckingAuth || reviewsQuery.isPending;
  const showCardsSkeleton = showSkeleton || dashboardQuery.isPending;

  return (
    <div className="flex flex-col poppins">
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Store Product Reviews (your products)
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage and moderate product reviews. Approve or reject, view by
          product, rating, and status. Add reviews for products.
        </p>
      </div>

      {/* Summary cards — 2 cards, 2 per row; product-owner reviews only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-6 items-stretch">
        {showCardsSkeleton ? (
          <>
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
          </>
        ) : (
          <>
            <StatisticsCard
              title="Reviews"
              value={dashboard?.counts?.reviews ?? allReviews.length}
              description="Product reviews"
              icon={Star}
              variant="violet"
              badges={[
                {
                  label: "Pending",
                  value: dashboard?.reviewStatusBreakdown?.pending ?? 0,
                },
                {
                  label: "Approved",
                  value: dashboard?.reviewStatusBreakdown?.approved ?? 0,
                },
                {
                  label: "Rejected",
                  value: dashboard?.reviewStatusBreakdown?.rejected ?? 0,
                },
              ]}
            />
            <StatisticsCard
              title="Avg. Rating"
              value={avgRating > 0 ? `${avgRating} · ${avgRatingLabel}` : "—"}
              description="Average among your product reviews"
              icon={Star}
              variant="amber"
              badges={[
                { label: "5 best", value: ratingBreakdown.r5 },
                { label: "4 very good", value: ratingBreakdown.r4 },
                { label: "3 good", value: ratingBreakdown.r3 },
                { label: "2 not good", value: ratingBreakdown.r2 },
                { label: "1 bad", value: ratingBreakdown.r1 },
              ]}
            />
          </>
        )}
      </div>

      <div className="pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full max-w-9xl">
          <ProductReviewFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedRatings={selectedRatings}
            setSelectedRatings={setSelectedRatings}
          />
        </div>
        {isMounted && (
          <div className="flex-shrink-0">
            <ProductReviewDialog
              trigger={
                <Button className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/70 via-violet-500/50 to-violet-500/30 dark:from-violet-500/70 dark:via-violet-500/50 dark:to-violet-500/30 text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Add Review
                </Button>
              }
            />
          </div>
        )}
      </div>

      <ProductReviewTable
        data={allReviews}
        columns={columns}
        isLoading={showSkeleton}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
        selectedStatuses={selectedStatuses}
        selectedRatings={selectedRatings}
      />
    </div>
  );
}

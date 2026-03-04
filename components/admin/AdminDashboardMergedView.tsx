"use client";

import React from "react";
import { PageContentWrapper } from "@/components/shared";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminAnalyticsContent from "./AdminAnalyticsContent";
import type { DashboardStats } from "@/types";

export type AdminDashboardMergedViewProps = {
  variant: "store" | "personal";
  initialStats: DashboardStats | null;
};

/**
 * Merged dashboard: overview (KPIs + recent orders) + analytics (charts, AI).
 * Used for both Store Dashboard and Personal Dashboard; title varies by variant.
 */
export default function AdminDashboardMergedView({
  variant,
  initialStats,
}: AdminDashboardMergedViewProps) {
  const title =
    variant === "store"
      ? "Store Dashboard & Analytics"
      : "Personal Dashboard & Analytics";
  const subtitle =
    variant === "store"
      ? "Store-wide metrics, trends, and AI insights"
      : "Your activity, metrics, and insights";

  return (
    <PageContentWrapper noPadding={variant === "store"}>
      <div className="space-y-8">
        {/* <AdminDashboardOverview
          orderDetailHrefBase="/admin/orders"
          title={title}
          subtitle={subtitle}
        /> */}
        <AdminAnalyticsContent initialStats={initialStats} />
      </div>
    </PageContentWrapper>
  );
}

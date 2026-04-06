"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import HistoryList from "./HistoryList";
import ActivityLogSection from "./ActivityLogSection";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { ImportHistoryForPage, AuditLog } from "@/types";

export type AdminHistoryContentProps = {
  initialHistory?: ImportHistoryForPage[];
  initialActivityLogs?: AuditLog[];
  /** Base path for detail links (e.g. "/admin/activity-history") */
  detailHrefBase?: string;
};

/**
 * Admin History section — import history list + activity log (CRUD) with period filter.
 */
export default function AdminHistoryContent({
  initialHistory,
  initialActivityLogs,
  detailHrefBase = "/admin/activity-history",
}: AdminHistoryContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialHistory != null) {
      queryClient.setQueryData(queryKeys.history.lists(), initialHistory);
    }
  }, [queryClient, initialHistory]);

  return (
    <PageContentWrapper>
      <HistoryList detailHrefBase={detailHrefBase} />
      <ActivityLogSection
        initialLogs={initialActivityLogs}
        initialPeriod="7days"
      />
    </PageContentWrapper>
  );
}

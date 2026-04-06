/**
 * History (Import History) List Component
 * List view for admin import history with filters, table, and detail links
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts";
import { useHistory } from "@/hooks/queries";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { createHistoryColumns } from "./HistoryTableColumns";
import HistoryFilters from "./HistoryFilters";
import { HistoryTable } from "./HistoryTable";

export type HistoryListProps = {
  /** When set (e.g. "/admin/activity-history"), View links use {detailHrefBase}/{id} */
  detailHrefBase?: string;
};

export default function HistoryList({ detailHrefBase }: HistoryListProps = {}) {
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const historyQuery = useHistory();
  const { isCheckingAuth } = useAuth();

  const allRecords = historyQuery.data ?? [];

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
  const [selectedImportTypes, setSelectedImportTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const columns = useMemo(
    () => createHistoryColumns(detailHrefBase ?? "/admin/activity-history"),
    [detailHrefBase],
  );

  const showSkeleton = !isMounted || isCheckingAuth || historyQuery.isPending;

  return (
    <div className="flex flex-col poppins">
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Import History
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Bulk import runs (CSV/Excel). Data appears here when you use Import
          for products, orders, suppliers, or categories. View details,
          success/failed rows, and error logs.
        </p>
      </div>

      <div className="pb-6 flex justify-start">
        <div className="w-full max-w-9xl">
          <HistoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedImportTypes={selectedImportTypes}
            setSelectedImportTypes={setSelectedImportTypes}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
          />
        </div>
      </div>

      <HistoryTable
        data={allRecords}
        columns={columns}
        isLoading={showSkeleton}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
        selectedImportTypes={selectedImportTypes}
        selectedStatuses={selectedStatuses}
      />
    </div>
  );
}

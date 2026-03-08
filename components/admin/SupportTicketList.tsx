/**
 * Support Ticket List Component
 * List view for admin support tickets with filters, table, and create button
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts";
import {
  useSupportTickets,
  type SupportTicketViewFilter,
} from "@/hooks/queries";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { createSupportTicketColumns } from "./SupportTicketTableColumns";
import SupportTicketFilters from "./SupportTicketFilters";
import { SupportTicketTable } from "./SupportTicketTable";
import SupportTicketDialog from "@/components/support-tickets/SupportTicketDialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertCircle } from "lucide-react";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";
import type { ProductOwnerOption } from "@/components/support-tickets/SupportTicketDialog";

export type SupportTicketListProps = {
  detailHrefBase?: string;
  productOwners?: ProductOwnerOption[];
};

export default function SupportTicketList({
  detailHrefBase,
  productOwners = [],
}: SupportTicketListProps = {}) {
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [viewFilter, setViewFilter] = useState<SupportTicketViewFilter>("all");
  const supportTicketsQuery = useSupportTickets(viewFilter);
  const { isCheckingAuth } = useAuth();

  const allTickets = supportTicketsQuery.data ?? [];

  const ticketStats = useMemo(() => {
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let totalMessages = 0;
    for (const t of allTickets) {
      statusCounts[t.status as keyof typeof statusCounts]++;
      priorityCounts[t.priority as keyof typeof priorityCounts]++;
      totalMessages += 1 + (t.replyCount ?? 0);
    }
    return { statusCounts, priorityCounts, totalMessages };
  }, [allTickets]);

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
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const columns = useMemo(
    () =>
      createSupportTicketColumns(detailHrefBase ?? "/admin/support-tickets"),
    [detailHrefBase],
  );

  const showSkeleton =
    !isMounted || isCheckingAuth || supportTicketsQuery.isPending;
  const showCardsSkeleton = showSkeleton;

  return (
    <div className="flex flex-col poppins">
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Store Support Tickets (assigned to you)
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage customer support tickets. Create, view, update status and
          priority, and add internal notes.
        </p>
      </div>

      {/* Summary cards — 2 cards, 2 per row; same style as dashboard/orders/invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-6 items-stretch">
        {showCardsSkeleton ? (
          <>
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
          </>
        ) : (
          <>
            <StatisticsCard
              title="Support Tickets"
              value={allTickets.length}
              description="Sent by users, clients & suppliers"
              icon={MessageSquare}
              variant="violet"
              badges={[
                { label: "Open", value: ticketStats.statusCounts.open },
                {
                  label: "In progress",
                  value: ticketStats.statusCounts.in_progress,
                },
                {
                  label: "Resolved",
                  value: ticketStats.statusCounts.resolved,
                },
                { label: "Closed", value: ticketStats.statusCounts.closed },
              ]}
            />
            <StatisticsCard
              title="Total messages"
              value={ticketStats.totalMessages}
              description="Replies across tickets"
              icon={AlertCircle}
              variant="rose"
              badges={[
                { label: "Low", value: ticketStats.priorityCounts.low },
                { label: "Medium", value: ticketStats.priorityCounts.medium },
                { label: "High", value: ticketStats.priorityCounts.high },
                { label: "Urgent", value: ticketStats.priorityCounts.urgent },
              ]}
            />
          </>
        )}
      </div>

      <div className="pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full max-w-9xl">
          <SupportTicketFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedPriorities={selectedPriorities}
            setSelectedPriorities={setSelectedPriorities}
            viewFilter={viewFilter}
            onViewFilterChange={setViewFilter}
          />
        </div>
        {isMounted && (
          <div className="flex-shrink-0">
            <SupportTicketDialog
              productOwners={productOwners}
              variant="violet"
              trigger={
                <Button className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/70 via-violet-500/50 to-violet-500/30 dark:from-violet-500/70 dark:via-violet-500/50 dark:to-violet-500/30 text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Create Ticket
                </Button>
              }
            />
          </div>
        )}
      </div>

      <SupportTicketTable
        data={allTickets}
        columns={columns}
        isLoading={showSkeleton}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
        selectedStatuses={selectedStatuses}
        selectedPriorities={selectedPriorities}
      />
    </div>
  );
}

"use client";

import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { useSupportTickets } from "@/hooks/queries";
import { queryKeys } from "@/lib/react-query";
import { MessageSquare, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/types";
import SupportTicketDialog, {
  type ProductOwnerOption,
} from "./SupportTicketDialog";
import { Button } from "@/components/ui/button";
import SupportTicketFilters from "@/components/admin/SupportTicketFilters";
import { SupportTicketTable } from "@/components/admin/SupportTicketTable";
import { createSupportTicketColumns } from "@/components/admin/SupportTicketTableColumns";
import { useAuth } from "@/contexts";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";

export type SupportTicketsPageContentProps = {
  initialTickets: SupportTicket[];
  productOwners: ProductOwnerOption[];
};

export default function SupportTicketsPageContent({
  initialTickets,
  productOwners,
}: SupportTicketsPageContentProps) {
  const queryClient = useQueryClient();
  const { data: tickets = [], isPending } = useSupportTickets();
  const { isCheckingAuth } = useAuth();
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const list = tickets.length ? tickets : initialTickets;

  const ticketStats = useMemo(() => {
    if (list.length === 0) {
      return {
        statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
        priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
        totalMessages: 0,
      };
    }
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let totalMessages = 0;
    for (const t of list) {
      statusCounts[t.status as keyof typeof statusCounts]++;
      priorityCounts[t.priority as keyof typeof priorityCounts]++;
      totalMessages += 1 + (t.replyCount ?? 0);
    }
    return { statusCounts, priorityCounts, totalMessages };
  }, [list]);

  useLayoutEffect(() => {
    if (initialTickets != null) {
      queryClient.setQueryData(
        queryKeys.supportTickets.list({ view: "all" }),
        initialTickets,
      );
    }
  }, [queryClient, initialTickets]);

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
    () => createSupportTicketColumns("/support-tickets"),
    [],
  );

  const showSkeleton =
    !isMounted || isCheckingAuth || (isPending && list.length === 0);
  const cardsLoading = !isMounted || isCheckingAuth || isPending;

  return (
    <Navbar>
      <PageContentWrapper>
        <div className="flex flex-col poppins">
          <div className="pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    "border-sky-300/30 bg-sky-100/50 dark:border-sky-400/30 dark:bg-sky-500/20",
                  )}
                >
                  <MessageSquare className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                Your Support Tickets
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Open and track tickets you&apos;ve sent. Create a ticket to get
                help from a product owner.
              </p>
            </div>
            <div className="flex-shrink-0">
              <SupportTicketDialog
                productOwners={productOwners}
                variant="sky"
                trigger={
                  <Button
                    className={cn(
                      "h-10 rounded-[28px] border border-sky-400/30 dark:border-sky-400/30",
                      "bg-gradient-to-r from-sky-500/50 via-sky-500/40 to-sky-500/30 dark:from-sky-500/50 dark:via-sky-500/40 dark:to-sky-500/30",
                      "text-white shadow-[0_10px_30px_rgba(2,132,199,0.3)] backdrop-blur-sm",
                      "hover:border-sky-300/50 hover:from-sky-500/60 hover:via-sky-500/50 hover:to-sky-500/40",
                      "gap-2",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Create Ticket
                  </Button>
                }
              />
            </div>
          </div>

          {/* State cards — same for all roles (admin, client, supplier) on /support-tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch pb-6">
            {cardsLoading ? (
              <>
                <StatisticsCardSkeleton />
                <StatisticsCardSkeleton />
              </>
            ) : (
              <>
                <StatisticsCard
                  title="Support Tickets"
                  value={list.length}
                  description="Sent by you"
                  icon={MessageSquare}
                  variant="sky"
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
                    {
                      label: "Closed",
                      value: ticketStats.statusCounts.closed,
                    },
                    {
                      label: "Total messages",
                      value: ticketStats.totalMessages,
                    },
                  ]}
                />
                <StatisticsCard
                  title="Total messages"
                  value={ticketStats.totalMessages}
                  description="Replies across tickets"
                  icon={MessageCircle}
                  variant="violet"
                  badges={[
                    {
                      label: "Low",
                      value: ticketStats.priorityCounts.low,
                    },
                    {
                      label: "Medium",
                      value: ticketStats.priorityCounts.medium,
                    },
                    {
                      label: "High",
                      value: ticketStats.priorityCounts.high,
                    },
                    {
                      label: "Urgent",
                      value: ticketStats.priorityCounts.urgent,
                    },
                  ]}
                />
              </>
            )}
          </div>

          <div className="pb-6 flex justify-center">
            <div className="w-full max-w-9xl">
              <SupportTicketFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatuses={selectedStatuses}
                setSelectedStatuses={setSelectedStatuses}
                selectedPriorities={selectedPriorities}
                setSelectedPriorities={setSelectedPriorities}
              />
            </div>
          </div>

          <SupportTicketTable
            data={list}
            columns={columns}
            isLoading={showSkeleton}
            searchTerm={searchTerm}
            pagination={pagination}
            setPagination={setPagination}
            selectedStatuses={selectedStatuses}
            selectedPriorities={selectedPriorities}
          />
        </div>
      </PageContentWrapper>
    </Navbar>
  );
}

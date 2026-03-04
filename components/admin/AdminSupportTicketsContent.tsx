"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SupportTicketList from "./SupportTicketList";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { SupportTicket } from "@/types";
import type { ProductOwnerOption } from "@/components/support-tickets/SupportTicketDialog";

export type AdminSupportTicketsContentProps = {
  initialTickets?: SupportTicket[];
  productOwners?: ProductOwnerOption[];
};

/**
 * Admin Support Tickets section — list inside admin layout.
 * Matches AdminOrdersContent / AdminHistoryContent pattern.
 */
export default function AdminSupportTicketsContent({
  initialTickets,
  productOwners = [],
}: AdminSupportTicketsContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialTickets != null) {
      queryClient.setQueryData(
        queryKeys.supportTickets.list({ view: "all" }),
        initialTickets,
      );
    }
  }, [queryClient, initialTickets]);

  return (
    <PageContentWrapper>
      <SupportTicketList
        detailHrefBase="/admin/support-tickets"
        productOwners={productOwners}
      />
    </PageContentWrapper>
  );
}

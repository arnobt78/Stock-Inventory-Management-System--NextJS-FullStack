"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import InvoiceList from "@/components/invoices/InvoiceList";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { InvoiceForPage } from "@/lib/server/invoices-data";

export type AdminClientInvoicesContentProps = {
  initialInvoices?: InvoiceForPage[];
};

/**
 * Admin Client Invoices — invoices for orders that contain products owned by the current user.
 * Reuses InvoiceList with dataSource="clientInvoices"; detail links go to /admin/client-invoices/[id].
 */
export default function AdminClientInvoicesContent({
  initialInvoices,
}: AdminClientInvoicesContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialInvoices != null) {
      queryClient.setQueryData(
        queryKeys.clientInvoices.lists(),
        initialInvoices,
      );
    }
  }, [queryClient, initialInvoices]);

  return (
    <PageContentWrapper>
      <InvoiceList dataSource="clientInvoices" />
    </PageContentWrapper>
  );
}

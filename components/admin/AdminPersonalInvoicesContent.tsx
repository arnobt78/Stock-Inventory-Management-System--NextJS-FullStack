"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import InvoiceList from "@/components/invoices/InvoiceList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { InvoiceForPage } from "@/lib/server/invoices-data";

export type AdminPersonalInvoicesContentProps = {
  initialInvoices?: InvoiceForPage[];
};

/**
 * Admin Personal Invoices — invoices for my orders, inside admin layout.
 * Reuses InvoiceList with detail links to /admin/personal-invoices/[id].
 */
export default function AdminPersonalInvoicesContent({
  initialInvoices,
}: AdminPersonalInvoicesContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialInvoices != null) {
      queryClient.setQueryData(
        queryKeys.invoices.list(undefined),
        initialInvoices,
      );
    }
  }, [queryClient, initialInvoices]);

  return (
    <PageContentWrapper>
      <InvoiceList detailHrefBase="/admin/personal-invoices" />
      <FloatingActionButtons variant="invoices" />
    </PageContentWrapper>
  );
}

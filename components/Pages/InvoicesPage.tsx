/**
 * Invoices Page
 * Dedicated page for invoice management
 */

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import InvoiceList from "@/components/invoices/InvoiceList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { InvoiceForPage } from "@/lib/server/invoices-data";

export type InvoicesPageProps = {
  initialInvoices?: InvoiceForPage[];
};

/**
 * Invoices page client component.
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 */
export default function InvoicesPage({
  initialInvoices,
}: InvoicesPageProps = {}) {
  const queryClient = useQueryClient();

  // Hydrate React Query with server data so first paint uses it (one round-trip)
  useLayoutEffect(() => {
    if (initialInvoices != null) {
      queryClient.setQueryData(
        queryKeys.invoices.list(undefined),
        initialInvoices,
      );
    }
  }, [queryClient, initialInvoices]);

  return (
    <Navbar>
      <PageContentWrapper>
        <InvoiceList />
        <FloatingActionButtons variant="invoices" />
      </PageContentWrapper>
    </Navbar>
  );
}

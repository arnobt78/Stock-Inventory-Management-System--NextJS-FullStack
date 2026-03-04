"use client";

import React from "react";
import InvoiceList from "@/components/invoices/InvoiceList";
import { PageContentWrapper } from "@/components/shared";

/**
 * Admin combined Invoices — personal + client invoices with Invoice type filter.
 * Single Invoices page under My Store; detail links go to /admin/invoices/[id].
 */
export default function AdminCombinedInvoicesContent() {
  return (
    <PageContentWrapper>
      <InvoiceList dataSource="adminCombined" detailHrefBase="/admin/invoices" />
    </PageContentWrapper>
  );
}

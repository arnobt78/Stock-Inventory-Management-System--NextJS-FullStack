"use client";

import React from "react";
import OrderList from "@/components/orders/OrderList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";

/**
 * Admin combined Orders — personal + client orders with Order type filter.
 * Single Orders page under My Store; detail links go to /admin/orders/[id].
 */
export default function AdminCombinedOrdersContent() {
  return (
    <PageContentWrapper>
      <OrderList dataSource="adminCombined" detailHrefBase="/admin/orders" />
      <FloatingActionButtons variant="orders" />
    </PageContentWrapper>
  );
}

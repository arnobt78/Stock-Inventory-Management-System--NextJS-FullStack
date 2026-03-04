"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import OrderList from "@/components/orders/OrderList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { OrderForPage } from "@/lib/server/orders-data";

export type AdminOrdersContentProps = {
  initialOrders?: OrderForPage[];
  /** Base path for order detail links (e.g. /admin/orders or /admin/personal-orders). Default /admin/orders */
  detailHrefBase?: string;
};

/**
 * Admin orders section — same content as /orders but inside admin layout (no Navbar).
 */
export default function AdminOrdersContent({
  initialOrders,
  detailHrefBase = "/admin/orders",
}: AdminOrdersContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialOrders != null) {
      queryClient.setQueryData(queryKeys.orders.lists(), initialOrders);
    }
  }, [queryClient, initialOrders]);

  return (
    <PageContentWrapper>
      <OrderList detailHrefBase={detailHrefBase} />
      <FloatingActionButtons variant="orders" />
    </PageContentWrapper>
  );
}

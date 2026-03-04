"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import OrderList from "@/components/orders/OrderList";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { OrderForPage } from "@/lib/server/orders-data";

export type AdminClientOrdersContentProps = {
  initialOrders?: OrderForPage[];
};

/**
 * Admin Client Orders — orders placed by others that contain products owned by the current user.
 * Reuses OrderList with dataSource="clientOrders"; detail links go to /admin/client-orders/[id].
 * No Create Order FAB (clients place these orders).
 */
export default function AdminClientOrdersContent({
  initialOrders,
}: AdminClientOrdersContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialOrders != null) {
      queryClient.setQueryData(queryKeys.clientOrders.lists(), initialOrders);
    }
  }, [queryClient, initialOrders]);

  return (
    <PageContentWrapper>
      <OrderList dataSource="clientOrders" />
    </PageContentWrapper>
  );
}

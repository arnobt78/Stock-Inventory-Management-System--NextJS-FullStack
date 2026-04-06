/**
 * Orders Page
 * Dedicated page for order management
 */

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import OrderList from "@/components/orders/OrderList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { OrderForPage } from "@/lib/server/orders-data";

export type OrdersPageProps = {
  initialOrders?: OrderForPage[];
  userRole?: string;
};

/**
 * Orders page client component.
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 * Client role: no floating Create Order (that flow is on products page with product owner select).
 */
export default function OrdersPage({
  initialOrders,
  userRole,
}: OrdersPageProps = {}) {
  const queryClient = useQueryClient();

  // Hydrate React Query with server data so first paint uses it (one round-trip)
  useLayoutEffect(() => {
    if (initialOrders != null) {
      queryClient.setQueryData(queryKeys.orders.lists(), initialOrders);
    }
  }, [queryClient, initialOrders]);

  return (
    <Navbar>
      <PageContentWrapper>
        <OrderList />
        {userRole !== "client" && (
          <FloatingActionButtons variant="orders" />
        )}
      </PageContentWrapper>
    </Navbar>
  );
}

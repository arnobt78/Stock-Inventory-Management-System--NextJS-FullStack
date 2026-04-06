/**
 * Warehouses Page
 * Dedicated page for warehouse management
 */

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import WarehouseList from "@/components/warehouses/WarehouseList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { WarehouseForPage } from "@/lib/server/warehouses-data";

export type WarehousesPageProps = {
  initialWarehouses?: WarehouseForPage[];
};

/**
 * Warehouses page client component.
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 */
export default function WarehousesPage({
  initialWarehouses,
}: WarehousesPageProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialWarehouses != null) {
      queryClient.setQueryData(queryKeys.warehouses.lists(), initialWarehouses);
    }
  }, [queryClient, initialWarehouses]);

  return (
    <Navbar>
      <PageContentWrapper>
        <WarehouseList />
        <FloatingActionButtons variant="warehouses" />
      </PageContentWrapper>
    </Navbar>
  );
}

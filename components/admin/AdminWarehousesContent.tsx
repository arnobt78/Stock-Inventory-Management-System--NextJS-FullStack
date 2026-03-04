"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import WarehouseList from "@/components/warehouses/WarehouseList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { WarehouseForPage } from "@/lib/server/warehouses-data";

export type AdminWarehousesContentProps = {
  initialWarehouses?: WarehouseForPage[];
};

/**
 * Admin warehouses section — same content as /warehouses but inside admin layout (no Navbar).
 */
export default function AdminWarehousesContent({
  initialWarehouses,
}: AdminWarehousesContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialWarehouses != null) {
      queryClient.setQueryData(queryKeys.warehouses.lists(), initialWarehouses);
    }
  }, [queryClient, initialWarehouses]);

  return (
    <PageContentWrapper>
      <WarehouseList />
      <FloatingActionButtons variant="warehouses" />
    </PageContentWrapper>
  );
}

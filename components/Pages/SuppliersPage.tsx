/**
 * Suppliers Page
 * Dedicated page for supplier management
 */

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import SupplierList from "@/components/supplier/SupplierList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { queryKeys } from "@/lib/react-query";
import type { SupplierForHome } from "@/lib/server/home-data";

export type SuppliersPageProps = {
  initialSuppliers?: SupplierForHome[];
};

/**
 * Suppliers page client component.
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 */
export default function SuppliersPage({
  initialSuppliers,
}: SuppliersPageProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialSuppliers != null) {
      queryClient.setQueryData(queryKeys.suppliers.lists(), initialSuppliers);
    }
  }, [queryClient, initialSuppliers]);

  return (
    <Navbar>
      <PageContentWrapper>
        <SupplierList />
        <FloatingActionButtons variant="suppliers" />
      </PageContentWrapper>
    </Navbar>
  );
}

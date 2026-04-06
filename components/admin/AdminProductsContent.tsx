"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ProductList from "@/components/products/ProductList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { useProducts } from "@/hooks/queries";
import { useAuth } from "@/contexts";
import { queryKeys } from "@/lib/react-query";
import type { ProductForHome } from "@/lib/server/home-data";

export type AdminProductsContentProps = {
  initialProducts?: ProductForHome[];
};

/**
 * Admin products section — same content as /products but inside admin layout (no Navbar).
 */
export default function AdminProductsContent({
  initialProducts,
}: AdminProductsContentProps = {}) {
  const queryClient = useQueryClient();
  const { data: allProducts = [] } = useProducts();
  const { user } = useAuth();

  useLayoutEffect(() => {
    if (initialProducts != null) {
      queryClient.setQueryData(queryKeys.products.lists(), initialProducts);
    }
  }, [queryClient, initialProducts]);

  return (
    <PageContentWrapper>
      <ProductList />
      <FloatingActionButtons
        variant="products"
        allProducts={allProducts}
        userId={user?.id || ""}
      />
    </PageContentWrapper>
  );
}

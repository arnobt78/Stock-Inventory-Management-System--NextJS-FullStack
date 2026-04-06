/**
 * Products Page
 * Dedicated page for product management
 * Client role: browse products by owner with stat cards
 * Admin/Supplier: manage own products
 */

"use client";

import React, { useLayoutEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import ProductList from "@/components/products/ProductList";
import ClientProductList from "@/components/products/ClientProductList";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { useProducts } from "@/hooks/queries";
import { useAuth } from "@/contexts";
import { queryKeys } from "@/lib/react-query";
import type { ProductForHome } from "@/lib/server/home-data";

export type ProductsPageProps = {
  initialProducts?: ProductForHome[];
  userRole?: string;
  /** Pre-select product owner when client lands from catalog link /products?ownerId= */
  initialOwnerId?: string;
};

/**
 * Products page client component.
 * Client role: ClientProductList (browse by product owner) + floating Create Order tied to owner select.
 * Admin/Supplier: ProductList (own products).
 */
export default function ProductsPage({
  initialProducts,
  userRole,
  initialOwnerId = "",
}: ProductsPageProps = {}) {
  const queryClient = useQueryClient();
  const { data: allProducts = [] } = useProducts();
  const { user } = useAuth();
  const role = userRole ?? user?.role ?? "user";
  const isClient = role === "client";
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(initialOwnerId);

  useLayoutEffect(() => {
    if (initialProducts != null && !isClient) {
      queryClient.setQueryData(queryKeys.products.lists(), initialProducts);
    }
  }, [queryClient, initialProducts, isClient]);

  return (
    <Navbar>
      <PageContentWrapper>
        {isClient ? (
          <ClientProductList
            selectedOwnerId={selectedOwnerId}
            onOwnerChange={setSelectedOwnerId}
          />
        ) : (
          <ProductList />
        )}
        {!isClient && user?.role !== "supplier" && (
          <FloatingActionButtons
            variant="products"
            allProducts={allProducts}
            userId={user?.id || ""}
          />
        )}
        {isClient && (
          <FloatingActionButtons
            variant="products-client"
            selectedOwnerId={selectedOwnerId}
          />
        )}
      </PageContentWrapper>
    </Navbar>
  );
}

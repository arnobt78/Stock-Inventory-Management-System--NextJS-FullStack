/**
 * Categories Page
 * Dedicated page for category management
 */

"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layouts/Navbar";
import CategoryList from "@/components/category/CategoryList";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { CategoryForHome } from "@/lib/server/home-data";

export type CategoriesPageProps = {
  initialCategories?: CategoryForHome[];
};

/**
 * Categories page client component.
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 */
export default function CategoriesPage({
  initialCategories,
}: CategoriesPageProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialCategories != null) {
      queryClient.setQueryData(queryKeys.categories.lists(), initialCategories);
    }
  }, [queryClient, initialCategories]);

  return (
    <Navbar>
      <PageContentWrapper>
        <CategoryList />
        <FloatingActionButtons variant="categories" />
      </PageContentWrapper>
    </Navbar>
  );
}

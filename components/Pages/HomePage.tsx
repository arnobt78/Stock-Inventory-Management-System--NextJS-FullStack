"use client";

/**
 * Home (store overview) for admin: statistics cards and quick links to products, categories, suppliers.
 * Hydrates React Query from server-passed initial data; handles OAuth callback query params.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import ProductList from "@/components/products/ProductList";
import SupplierList from "@/components/supplier/SupplierList";
import CategoryList from "@/components/category/CategoryList";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import FloatingActionButtons from "@/components/shared/FloatingActionButtons";
import { useProducts } from "@/hooks/queries";
import { queryKeys } from "@/lib/react-query";
import type {
  ProductForHome,
  CategoryForHome,
  SupplierForHome,
} from "@/lib/server/home-data";

export type HomePageProps = {
  initialProducts?: ProductForHome[];
  initialCategories?: CategoryForHome[];
  initialSuppliers?: SupplierForHome[];
};

/**
 * Home page client component (uses useSearchParams for OAuth callback).
 * Accepts optional server-fetched data to hydrate React Query and avoid client round-trips.
 */
export default function HomePage({
  initialProducts,
  initialCategories,
  initialSuppliers,
}: HomePageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isLoggedIn, isCheckingAuth, user, refreshSession } = useAuth();
  const { data: allProducts = [] } = useProducts();

  // Hydrate React Query with server data so first paint uses it (one round-trip)
  useLayoutEffect(() => {
    if (initialProducts != null) {
      queryClient.setQueryData(queryKeys.products.lists(), initialProducts);
    }
    if (initialCategories != null) {
      queryClient.setQueryData(queryKeys.categories.lists(), initialCategories);
    }
    if (initialSuppliers != null) {
      queryClient.setQueryData(queryKeys.suppliers.lists(), initialSuppliers);
    }
  }, [queryClient, initialProducts, initialCategories, initialSuppliers]);
  const [isRefreshingOAuth, setIsRefreshingOAuth] = useState(false);
  const [oauthRefreshComplete, setOauthRefreshComplete] = useState(false);
  // Use ref to track if OAuth has been handled to prevent duplicate processing
  const oauthHandledRef = useRef(false);
  // Use ref to track URL cleanup to prevent multiple router.replace calls
  const urlCleanedRef = useRef(false);

  // Single consolidated useEffect for OAuth handling and redirect logic
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const isOAuthFlow = oauthSuccess === "true";

    // Handle OAuth flow
    if (isOAuthFlow && !oauthHandledRef.current) {
      oauthHandledRef.current = true;
      queueMicrotask(() => setIsRefreshingOAuth(true));

      // Force session refresh to pick up the newly set cookie
      refreshSession()
        .then(() => {
          setOauthRefreshComplete(true);
          setIsRefreshingOAuth(false);
          // Clean up URL silently using window.history - no delays needed
          // This prevents a full page navigation/remount which causes skeleton flash
          // StatisticsSection now handles loading state properly, so no delay needed
          if (
            !urlCleanedRef.current &&
            typeof window !== "undefined" &&
            window.location.search.includes("oauth_success=true")
          ) {
            urlCleanedRef.current = true;
            // Use window.history.replaceState to clean URL without navigation
            // This doesn't trigger a full re-render, preventing skeleton flash
            window.history.replaceState(
              { ...window.history.state, as: "/", url: "/" },
              "",
              "/",
            );
          }
        })
        .catch(() => {
          setOauthRefreshComplete(true);
          setIsRefreshingOAuth(false);
        });
      // Return early - don't check redirect until OAuth is processed
      return;
    }

    // Redirect logic: Only run if not in OAuth flow OR OAuth flow is complete
    // Skip redirect check if OAuth is in progress to prevent unnecessary checks
    if (!isOAuthFlow || oauthRefreshComplete) {
      // For OAuth flow: wait until refresh is complete and check auth status
      if (isOAuthFlow && oauthRefreshComplete) {
        // OAuth refresh complete - if logged in, success
        // If not logged in after refresh, redirect to login
        if (!isCheckingAuth && !isLoggedIn) {
          router.replace("/login", { scroll: false });
        }
        return;
      }

      // Non-OAuth flow: Only redirect if auth check is complete and user is not logged in
      if (!isOAuthFlow && !isCheckingAuth && !isLoggedIn) {
        router.replace("/login", { scroll: false });
      }
    }
  }, [
    searchParams,
    isLoggedIn,
    isCheckingAuth,
    router,
    refreshSession,
    isRefreshingOAuth,
    oauthRefreshComplete,
  ]);

  return (
    <Navbar>
      <PageContentWrapper>
        {/* Hero intro — store-wide overview and link to My Activities */}
        <div className="pb-6 flex flex-col items-start text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
            Store overview
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            The cards below show your store-wide metrics as the store owner,
            including your own activity and activity from clients and others.
            Numbers update automatically when you or others make changes. For
            your personal orders, products, and activity only, visit{" "}
            <Link
              href="/admin/my-activity"
              className="font-medium text-sky-600 hover:text-sky-800"
            >
              My Activities
            </Link>
            .
          </p>
        </div>

        {/* Statistics Section - Warehouse Overview */}
        <div id="statistics" className="pb-6 scroll-mt-20">
          <StatisticsSection />
        </div>

        {/* Product List Section */}
        <div id="products" className="pb-6 scroll-mt-20">
          <ProductList />
        </div>

        {/* Supplier List Section */}
        <div id="suppliers" className="pb-6 scroll-mt-20">
          <SupplierList />
        </div>

        {/* Category List Section */}
        <div id="categories" className="pb-6 scroll-mt-20">
          <CategoryList />
        </div>

        {/* Floating Action Buttons - Always render to prevent blinking */}
        <FloatingActionButtons
          allProducts={allProducts}
          userId={user?.id || ""}
        />
      </PageContentWrapper>
    </Navbar>
  );
}

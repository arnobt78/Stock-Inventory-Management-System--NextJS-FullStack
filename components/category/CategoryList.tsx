"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { createCategoryColumns } from "./CategoryTableColumns";
import { useAuth } from "@/contexts";
import { useCategories, useDashboard } from "@/hooks/queries";
import CategoryFilters from "./CategoryFilters";
import AddCategoryDialog from "./CategoryDialog";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";
import { Package, DollarSign, Truck, FolderTree } from "lucide-react";
import { Category } from "@/types";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Dynamic import for CategoryTable to enable code splitting
 */
const CategoryTable = dynamic(
  () =>
    import("./CategoryTable").then((mod) => ({
      default: mod.CategoryTable,
    })),
  {
    ssr: true,
  },
);

/**
 * CategoryList Component
 * Main component for displaying and managing categories
 * Follows the same pattern as SupplierList with consistent spacing
 */
const CategoryList = React.memo(() => {
  // Track if component has mounted on client to prevent hydration mismatch
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const categoriesQuery = useCategories();
  const dashboardQuery = useDashboard();
  const allCategories = categoriesQuery.data ?? [];
  /** Show store-wide state cards only on the user categories page (/categories), not admin or homepage */
  const isUserCategoriesPage = pathname === "/categories";
  const categoriesPageStats = isUserCategoriesPage
    ? (dashboardQuery.data ?? null)
    : null;

  const { user, isCheckingAuth } = useAuth();

  // Mark component as mounted after client-side hydration
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  // State for search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  // State for status filter (all, active, inactive)
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // State for controlling edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Determine loading state - FIXES HYDRATION & FLICKER (same approach as StatisticsSection)
  // Show skeleton if:
  // 1. Not mounted yet (prevents hydration mismatch - server and client both show skeleton)
  // 2. OR auth is checking OR categories query is still pending (hasn't fetched yet)
  // This ensures server and client render match initially, preventing hydration errors
  // Once mounted and queries have fetched, data shows immediately - no flicker
  const categoriesQueryPending = categoriesQuery.isPending;
  const showSkeleton = !isMounted || isCheckingAuth || categoriesQueryPending;
  /** For /categories page cards: show skeleton until mounted and dashboard loaded */
  const categoriesPageCardsLoading =
    isUserCategoriesPage && (!isMounted || dashboardQuery.isPending);

  // Create table columns with edit handler
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => createCategoryColumns(handleEditCategory),
    [handleEditCategory],
  );

  // Always render the UI structure to prevent flashing
  // Only the table will show skeleton during initial load
  return (
    <div className="flex flex-col poppins">
      {/* Category Management Section Header — same alignment as products page */}
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Category Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Organize your inventory with a comprehensive category system. Create,
          manage, and maintain product categories to streamline your inventory
          organization and improve product discoverability.
        </p>
      </div>

      {/* Store-wide state cards — only on /categories page (user), same as homepage/products */}
      {isUserCategoriesPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pb-6">
          {categoriesPageCardsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <StatisticsCardSkeleton key={i} />
              ))}
            </>
          ) : categoriesPageStats ? (
            <>
              <StatisticsCard
                title="Total Products"
                value={categoriesPageStats.counts.products}
                description="Products availability"
                icon={Package}
                variant="rose"
                badges={[
                  {
                    label: "Available",
                    value:
                      categoriesPageStats.productStatusBreakdown?.available ??
                      0,
                  },
                  {
                    label: "Stock low",
                    value:
                      categoriesPageStats.productStatusBreakdown?.stockLow ?? 0,
                  },
                  {
                    label: "Stock out",
                    value:
                      categoriesPageStats.productStatusBreakdown?.stockOut ?? 0,
                  },
                ]}
              />
              <StatisticsCard
                title="Total Value"
                value={formatCurrency(
                  categoriesPageStats.totalInventoryValue ?? 0,
                )}
                description="Total inventory value"
                icon={DollarSign}
                variant="violet"
                badges={[
                  {
                    label: "Orders",
                    value: formatCurrency(
                      categoriesPageStats.orderAnalytics
                        ?.totalRevenueExcludingCancelled ??
                        categoriesPageStats.revenue?.fromOrders ??
                        0,
                    ),
                  },
                  {
                    label: "Invoices",
                    value: formatCurrency(
                      categoriesPageStats.revenue?.fromInvoices ?? 0,
                    ),
                  },
                  {
                    label: "Due",
                    value: formatCurrency(
                      categoriesPageStats.invoiceAnalytics?.outstandingAmount ??
                        0,
                    ),
                  },
                  {
                    label: "Cancelled",
                    value: formatCurrency(
                      categoriesPageStats.orderAnalytics
                        ?.cancelledOrderAmount ?? 0,
                    ),
                  },
                ]}
              />
              <StatisticsCard
                title="Total Suppliers"
                value={categoriesPageStats.counts.suppliers}
                description="Suppliers"
                icon={Truck}
                variant="emerald"
                badges={[
                  {
                    label: "Active",
                    value:
                      categoriesPageStats.supplierStatusBreakdown?.active ?? 0,
                  },
                  {
                    label: "Inactive",
                    value:
                      categoriesPageStats.supplierStatusBreakdown?.inactive ??
                      0,
                  },
                ]}
              />
              <StatisticsCard
                title="Categories"
                value={categoriesPageStats.counts.categories}
                description="Product categories"
                icon={FolderTree}
                variant="amber"
                badges={[
                  {
                    label: "Active",
                    value:
                      categoriesPageStats.categoryStatusBreakdown?.active ?? 0,
                  },
                  {
                    label: "Inactive",
                    value:
                      categoriesPageStats.categoryStatusBreakdown?.inactive ??
                      0,
                  },
                ]}
              />
            </>
          ) : null}
        </div>
      )}

      {/* Filters and Actions - Always visible, only disabled during auth check */}
      <div className="pb-6 flex justify-center">
        <div className="w-full max-w-9xl">
          {isMounted ? (
            <CategoryFilters
              allCategories={allCategories}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              pagination={pagination}
              setPagination={setPagination}
              userId={user?.id || ""}
            />
          ) : null}
        </div>
      </div>

      {/* Category Table - Shows skeleton during auth check or data loading */}
      <CategoryTable
        data={allCategories || []}
        columns={columns}
        userId={user?.id || ""}
        isLoading={showSkeleton}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
        statusFilter={statusFilter}
      />

      {/* Controlled Edit Dialog - only mount after client hydration to avoid Radix ID mismatch */}
      {isMounted && (
        <AddCategoryDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
            }
          }}
          editingCategory={editingCategory}
          onEditCategory={(category) => {
            setEditingCategory(category);
          }}
        >
          <div style={{ display: "none" }} />
        </AddCategoryDialog>
      )}
    </div>
  );
});

CategoryList.displayName = "CategoryList";

export default CategoryList;

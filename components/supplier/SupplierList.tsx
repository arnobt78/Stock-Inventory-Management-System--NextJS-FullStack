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
import { createSupplierColumns } from "./SupplierTableColumns";
import { useAuth } from "@/contexts";
import { useSuppliers, useDashboard } from "@/hooks/queries";
import SupplierFilters from "./SupplierFilters";
import AddSupplierDialog from "./SupplierDialog";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";
import { Package, DollarSign, Truck, FolderTree } from "lucide-react";
import { Supplier } from "@/types";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Dynamic import for SupplierTable to enable code splitting
 */
const SupplierTable = dynamic(
  () =>
    import("./SupplierTable").then((mod) => ({
      default: mod.SupplierTable,
    })),
  {
    ssr: true,
  },
);

/**
 * SupplierList Component
 * Main component for displaying and managing suppliers
 * Follows the same pattern as ProductList with consistent spacing
 */
const SupplierList = React.memo(() => {
  // Track if component has mounted on client to prevent hydration mismatch
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const suppliersQuery = useSuppliers();
  const dashboardQuery = useDashboard();
  const allSuppliers = suppliersQuery.data ?? [];
  /** Show store-wide state cards only on the user suppliers page (/suppliers), not admin or homepage */
  const isUserSuppliersPage = pathname === "/suppliers";
  const suppliersPageStats = isUserSuppliersPage
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
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Determine loading state - FIXES HYDRATION & FLICKER (same approach as StatisticsSection)
  // Show skeleton if:
  // 1. Not mounted yet (prevents hydration mismatch - server and client both show skeleton)
  // 2. OR auth is checking OR suppliers query is still pending (hasn't fetched yet)
  // This ensures server and client render match initially, preventing hydration errors
  // Once mounted and queries have fetched, data shows immediately - no flicker
  const suppliersQueryPending = suppliersQuery.isPending;
  const showSkeleton = !isMounted || isCheckingAuth || suppliersQueryPending;
  /** For /suppliers page cards: show skeleton until mounted and dashboard loaded */
  const suppliersPageCardsLoading =
    isUserSuppliersPage && (!isMounted || dashboardQuery.isPending);

  // Create table columns with edit handler
  const handleEditSupplier = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => createSupplierColumns(handleEditSupplier),
    [handleEditSupplier],
  );

  // Always render the UI structure to prevent flashing
  // Only the table will show skeleton during initial load
  return (
    <div className="flex flex-col poppins">
      {/* Supplier Management Section Header — same alignment as products page */}
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Supplier Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your supplier relationships efficiently. Track supplier
          information, status, and maintain detailed records for better
          inventory management and procurement planning.
        </p>
      </div>

      {/* Store-wide state cards — only on /suppliers page (user), same as homepage/products */}
      {isUserSuppliersPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pb-6">
          {suppliersPageCardsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <StatisticsCardSkeleton key={i} />
              ))}
            </>
          ) : suppliersPageStats ? (
            <>
              <StatisticsCard
                title="Total Products"
                value={suppliersPageStats.counts.products}
                description="Products availability"
                icon={Package}
                variant="rose"
                badges={[
                  {
                    label: "Available",
                    value:
                      suppliersPageStats.productStatusBreakdown?.available ?? 0,
                  },
                  {
                    label: "Stock low",
                    value:
                      suppliersPageStats.productStatusBreakdown?.stockLow ?? 0,
                  },
                  {
                    label: "Stock out",
                    value:
                      suppliersPageStats.productStatusBreakdown?.stockOut ?? 0,
                  },
                ]}
              />
              <StatisticsCard
                title="Total Value"
                value={formatCurrency(
                  suppliersPageStats.totalInventoryValue ?? 0,
                )}
                description="Total inventory value"
                icon={DollarSign}
                variant="violet"
                badges={[
                  {
                    label: "Orders",
                    value: formatCurrency(
                      suppliersPageStats.orderAnalytics
                        ?.totalRevenueExcludingCancelled ??
                        suppliersPageStats.revenue?.fromOrders ??
                        0,
                    ),
                  },
                  {
                    label: "Invoices",
                    value: formatCurrency(
                      suppliersPageStats.revenue?.fromInvoices ?? 0,
                    ),
                  },
                  {
                    label: "Due",
                    value: formatCurrency(
                      suppliersPageStats.invoiceAnalytics?.outstandingAmount ??
                        0,
                    ),
                  },
                  {
                    label: "Cancelled",
                    value: formatCurrency(
                      suppliersPageStats.orderAnalytics?.cancelledOrderAmount ??
                        0,
                    ),
                  },
                ]}
              />
              <StatisticsCard
                title="Total Suppliers"
                value={suppliersPageStats.counts.suppliers}
                description="Suppliers"
                icon={Truck}
                variant="emerald"
                badges={[
                  {
                    label: "Active",
                    value:
                      suppliersPageStats.supplierStatusBreakdown?.active ?? 0,
                  },
                  {
                    label: "Inactive",
                    value:
                      suppliersPageStats.supplierStatusBreakdown?.inactive ?? 0,
                  },
                ]}
              />
              <StatisticsCard
                title="Categories"
                value={suppliersPageStats.counts.categories}
                description="Product categories"
                icon={FolderTree}
                variant="amber"
                badges={[
                  {
                    label: "Active",
                    value:
                      suppliersPageStats.categoryStatusBreakdown?.active ?? 0,
                  },
                  {
                    label: "Inactive",
                    value:
                      suppliersPageStats.categoryStatusBreakdown?.inactive ?? 0,
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
            <SupplierFilters
              allSuppliers={allSuppliers}
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

      {/* Supplier Table - Shows skeleton during auth check or data loading */}
      <SupplierTable
        data={allSuppliers || []}
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
        <AddSupplierDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingSupplier(null);
            }
          }}
          editingSupplier={editingSupplier}
          onEditSupplier={(supplier) => {
            setEditingSupplier(supplier);
          }}
        >
          <div style={{ display: "none" }} />
        </AddSupplierDialog>
      )}
    </div>
  );
});

SupplierList.displayName = "SupplierList";

export default SupplierList;

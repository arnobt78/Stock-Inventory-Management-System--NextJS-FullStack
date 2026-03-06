/**
 * Central invalidation for all data queries
 * Call after any CRUD (product, category, supplier, order, invoice, warehouse,
 * payment, shipping, ticket, review, etc.) so user/admin/client/supplier
 * dashboards, list pages, detail pages, cards, badges, and tables stay in sync.
 */

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./config";

/**
 * Invalidates every query that displays server data so all related UI updates
 * without refresh: user/client/supplier pages, admin panel, detail pages,
 * dashboards, list tables, cards, badges, back buttons, activity feed, etc.
 */
export function invalidateAllRelatedQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.clientOrders.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.clientInvoices.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.productReviews.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.userManagement.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.clientPortal.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.supplierPortal.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.stockAllocation.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.forecasting.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.portal.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.systemConfig.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
}

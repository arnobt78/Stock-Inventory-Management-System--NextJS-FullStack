/**
 * Portal query hooks (supplier and client portals)
 * Query keys include userId so client/supplier see their own data (no cross-user cache).
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";
import { useAuth } from "@/contexts";
import type {
  SupplierPortalDashboard,
  ClientPortalDashboard,
  ClientCatalogOverview,
  ClientBrowseMeta,
  ClientBrowseProductsResponse,
} from "@/types";

/**
 * Get supplier portal dashboard (keyed by userId so supplier sees own data)
 */
export function useSupplierPortalDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: [...queryKeys.portal.supplier(), userId],
    queryFn: async (): Promise<SupplierPortalDashboard> => {
      const response = await apiClient.portal.getSupplierDashboard();
      return response.data;
    },
    enabled: !!userId && user?.role === "supplier",
  });
}

/**
 * Get client portal dashboard (keyed by userId so client sees own data, not cached admin data)
 */
export function useClientPortalDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: [...queryKeys.portal.client(), userId],
    queryFn: async (): Promise<ClientPortalDashboard> => {
      const response = await apiClient.portal.getClientDashboard();
      return response.data;
    },
    enabled: !!userId && user?.role === "client",
  });
}

/**
 * Get client catalog overview (keyed by userId for correct client scope)
 */
export function useClientCatalogOverview() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: [...queryKeys.portal.clientCatalog(), userId],
    queryFn: async (): Promise<ClientCatalogOverview> => {
      const response = await apiClient.portal.getClientCatalog();
      return response.data;
    },
    enabled: !!userId && user?.role === "client",
  });
}

/**
 * Get client browse meta (product owners + global stats)
 */
export function useClientBrowseMeta() {
  return useQuery({
    queryKey: queryKeys.portal.clientBrowseMeta(),
    queryFn: async (): Promise<ClientBrowseMeta> => {
      const response = await apiClient.portal.getClientBrowseMeta();
      return response.data;
    },
    enabled: true, // Client role check happens in component
  });
}

/**
 * Get client browse products (by owner, optional supplier/category filter)
 */
export function useClientBrowseProducts(params: {
  ownerId: string;
  supplierId?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.portal.clientBrowseProducts(params),
    queryFn: async (): Promise<ClientBrowseProductsResponse> => {
      const response = await apiClient.portal.getClientBrowseProducts(params);
      return response.data;
    },
    enabled: !!params.ownerId,
  });
}

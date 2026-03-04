/**
 * Import History (Admin History) query hooks
 * TanStack Query hooks for import history data fetching
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

/**
 * Fetch all import history for the authenticated user
 */
export function useHistory() {
  return useQuery({
    queryKey: queryKeys.history.lists(),
    queryFn: async () => {
      const response = await apiClient.importHistory.getAll();
      return response.data;
    },
  });
}

/**
 * Fetch a single import history record by ID
 *
 * @param id - Import history record ID
 */
export function useHistoryItem(id: string) {
  return useQuery({
    queryKey: queryKeys.history.detail(id),
    queryFn: async () => {
      const response = await apiClient.importHistory.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

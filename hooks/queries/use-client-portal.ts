/**
 * Admin Client Portal query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

export function useClientPortal() {
  return useQuery({
    queryKey: queryKeys.clientPortal.overview(),
    queryFn: async () => {
      const response = await apiClient.clientPortal.getOverview();
      return response.data;
    },
  });
}

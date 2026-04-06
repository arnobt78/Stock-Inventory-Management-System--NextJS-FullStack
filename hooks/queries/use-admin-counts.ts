/**
 * Admin sidebar counts — client orders, client invoices, support tickets, product reviews.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

export function useAdminCounts() {
  return useQuery({
    queryKey: queryKeys.admin.counts(),
    queryFn: async () => {
      const response = await apiClient.admin.getCounts();
      return response.data;
    },
  });
}

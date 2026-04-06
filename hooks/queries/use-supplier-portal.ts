/**
 * Admin Supplier Portal query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

export function useSupplierPortal() {
  return useQuery({
    queryKey: queryKeys.supplierPortal.overview(),
    queryFn: async () => {
      const response = await apiClient.supplierPortal.getOverview();
      return response.data;
    },
  });
}

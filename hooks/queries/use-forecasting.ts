/**
 * Forecasting query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";
import type { ForecastingSummary } from "@/types";

/**
 * Get demand forecasting summary
 */
export function useForecastingSummary() {
  return useQuery({
    queryKey: queryKeys.forecasting.summary(),
    queryFn: async (): Promise<ForecastingSummary> => {
      const response = await apiClient.forecasting.getSummary();
      return response.data;
    },
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

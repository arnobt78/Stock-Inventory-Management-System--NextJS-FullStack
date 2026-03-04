/**
 * Payments query hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { invalidateAllRelatedQueries } from "@/lib/react-query";
import type { CreateCheckoutInput, CheckoutSessionResponse } from "@/types";

/**
 * Create Stripe checkout session and redirect to payment
 */
export function useCreateCheckout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: CreateCheckoutInput,
    ): Promise<CheckoutSessionResponse> => {
      const response = await apiClient.payments.createCheckout(data);
      return response.data;
    },
    onSuccess: (data: CheckoutSessionResponse) => {
      // Invalidate so when user returns from Stripe, all data refetches immediately
      invalidateAllRelatedQueries(queryClient);
      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Payment Error",
          description: "Failed to get checkout URL",
          variant: "destructive",
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Payment Error",
        description:
          getErrorMessage(error) || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api/client";
import { storefrontKeys } from "./useStorefront";
import type { CheckoutPayload, CheckoutSuccessData, InsufficientStockError } from "@/types/checkout";

export function useCheckoutMutation(shopSlug: string) {
  const queryClient = useQueryClient();

  return useMutation<CheckoutSuccessData, ApiError, CheckoutPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<{ success: boolean; data: CheckoutSuccessData }>(
        `/api/storefront/${shopSlug}/orders`,
        payload
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific products bought so the PDP/Catalog show correct post-order stock
      variables.items.forEach((item) => {
        queryClient.invalidateQueries({ queryKey: storefrontKeys.product(shopSlug, item.productSlug) });
      });
      // Also invalidate the main list
      queryClient.invalidateQueries({ queryKey: storefrontKeys.products(shopSlug) });
    },
  });
}
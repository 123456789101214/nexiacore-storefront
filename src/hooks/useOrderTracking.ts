import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { SingleEnvelope } from "@/types/storefront"; // PRESERVED
import type { OrderView } from "@/types/checkout";

export const orderKeys = {
  all: ["storefront-orders"] as const,
  track: (shopSlug: string, orderId: string) => [...orderKeys.all, "track", shopSlug, orderId] as const,
  myOrders: (shopSlug: string) => [...orderKeys.all, "myOrders", shopSlug] as const,
};

export function useTrackOrder(shopSlug: string, orderId: string) {
  return useQuery({
    queryKey: orderKeys.track(shopSlug, orderId),
    queryFn: async () => {
      const res = await apiClient.get<SingleEnvelope<OrderView>>(
        `/api/storefront/${shopSlug}/orders/${orderId}/track`
      );
      return res.data;
    },
    enabled: Boolean(shopSlug) && Boolean(orderId),
    retry: 1,
  });
}

export function useMyOrders(shopSlug: string, isSessionActive: boolean = false) {
  return useQuery({
    queryKey: orderKeys.myOrders(shopSlug),
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: OrderView[] }>(
        `/api/storefront/${shopSlug}/customers/me/orders`
      );
      return res.data;
    },
    enabled: Boolean(shopSlug) && isSessionActive,
    retry: false,
  });
}
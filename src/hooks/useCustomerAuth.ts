import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { RequestOtpPayload, VerifyOtpPayload, StoreCustomerSession } from "@/types/checkout";

// UPGRADED: Now fetches the actual session profile so we can display the user's email/initial
export function useCustomerSession(shopSlug: string) {
  return useQuery({
    queryKey: ["storefront", "session", shopSlug],
    queryFn: async (): Promise<StoreCustomerSession | null> => {
      try {
        const res = await apiClient.get<{ success: boolean; data: StoreCustomerSession }>(
          `/api/storefront/${shopSlug}/customers/me`
        );
        return res.data;
      } catch (error: any) {
        if (error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
export function useRequestOtp(shopSlug: string) {
  return useMutation({
    mutationFn: async (payload: RequestOtpPayload) => {
      return apiClient.post(`/api/storefront/${shopSlug}/customers/auth/otp`, payload);
    },
  });
}

export function useVerifyOtp(shopSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      return apiClient.post(`/api/storefront/${shopSlug}/customers/auth/verify`, payload);
    },
    onSuccess: () => {
      // Refresh session state on successful login
      queryClient.invalidateQueries({ queryKey: ["storefront", "session", shopSlug] });
    },
  });
}

export function useCustomerLogout(shopSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/storefront/${shopSlug}/customers/auth/logout`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefront", "session", shopSlug] });
    },
  });
}
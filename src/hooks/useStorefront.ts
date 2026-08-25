/**
 * hooks/useStorefront.ts
 *
 * TanStack Query v5 hooks for the five frozen storefront endpoints.
 * One fetch layer, shared by Server and Client Components via apiClient.
 *
 * Envelope shapes are unwrapped explicitly per endpoint (no auto-unwrap
 * in the client layer) so each hook matches its real controller
 * response exactly — see types/storefront.ts.
 *
 * ⚠️ CONFIRMED against storefrontController.js:
 *    - getStorefrontProducts        -> { success, data: Product[], pagination }
 *    - getStorefrontProductBySlug   -> { success, data: Product }
 * ⚠️ ASSUMED (not yet confirmed against real controller code):
 *    - getStorefrontShop            -> assumed { success, data: Shop }
 *    - getStorefrontCategories      -> assumed { success, data: Category[] }
 *    If either controller actually returns a different shape (e.g.
 *    { success, shop } or a bare array), update SingleEnvelope usage
 *    below to match — do not leave this assumption unverified.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Shop,
  Category,
  Product,
  ProductListEnvelope,
  SingleEnvelope,
  ProductListFilters,
  PaginationMeta,
} from "@/types/storefront";

// ─── Query Key Factory ──────────────────────────────────────────────

export const storefrontKeys = {
  all: ["storefront"] as const,
  shop: (shopSlug: string) => [...storefrontKeys.all, "shop", shopSlug] as const,
  categories: (shopSlug: string) =>
    [...storefrontKeys.all, "categories", shopSlug] as const,
  products: (shopSlug: string, filters: ProductListFilters = {}) =>
    [...storefrontKeys.all, "products", shopSlug, filters] as const,
  product: (shopSlug: string, productSlug: string) =>
    [...storefrontKeys.all, "product", shopSlug, productSlug] as const,
};

// ─── staleTime / gcTime policy ──────────────────────────────────────
// Shop/category data changes rarely per session -> tolerate a short
// stale window. Product stock must not be treated as long-lived-fresh
// (Data Integrity §4) -> short staleTime, refetch on focus.

const SHOP_STALE_TIME = 60 * 1000; // 1 min
const CATEGORY_STALE_TIME = 60 * 1000; // 1 min
const PRODUCT_LIST_STALE_TIME = 15 * 1000; // 15s — stock-sensitive
const PRODUCT_DETAIL_STALE_TIME = 10 * 1000; // 10s — stock-sensitive
const GC_TIME = 5 * 60 * 1000; // 5 min

function isNotFound(error: unknown): boolean {
  return (error as { status?: number })?.status === 404;
}

// ─── 1. Shop metadata & gating check ────────────────────────────────

export function useShop(
  shopSlug: string,
  options?: Partial<UseQueryOptions<Shop, Error>>
) {
  return useQuery({
    queryKey: storefrontKeys.shop(shopSlug),
    queryFn: async () => {
      const res = await apiClient.get<SingleEnvelope<Shop>>(
        `/api/storefront/${shopSlug}`
      );
      return res.data;
    },
    enabled: Boolean(shopSlug),
    staleTime: SHOP_STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      // §7: isActive:false and nonexistent slug both come back as an
      // identical 404 — don't retry a confirmed gate rejection.
      if (isNotFound(error)) return false;
      return failureCount < 2;
    },
    ...options,
  });
}

// ─── 2. Category list ───────────────────────────────────────────────

export function useCategories(
  shopSlug: string,
  options?: Partial<UseQueryOptions<Category[], Error>>
) {
  return useQuery({
    queryKey: storefrontKeys.categories(shopSlug),
    queryFn: async () => {
      const res = await apiClient.get<SingleEnvelope<Category[]>>(
        `/api/storefront/${shopSlug}/categories`
      );
      return res.data;
    },
    enabled: Boolean(shopSlug),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: GC_TIME,
    retry: 2,
    ...options,
  });
}

// ─── 3 & 4. Product catalog list (with optional filters) ───────────

export interface ProductListResult {
  products: Product[];
  pagination: PaginationMeta;
}

export function useProducts(
  shopSlug: string,
  filters: ProductListFilters = {},
  options?: Partial<UseQueryOptions<ProductListResult, Error>>
) {
  return useQuery({
    queryKey: storefrontKeys.products(shopSlug, filters),
    queryFn: async (): Promise<ProductListResult> => {
      const res = await apiClient.get<ProductListEnvelope>(
        `/api/storefront/${shopSlug}/products`,
        {
          params: {
            category: filters.category,
            search: filters.search,
            page: filters.page,
            limit: filters.limit,
          },
        }
      );
      return { products: res.data, pagination: res.pagination };
    },
    enabled: Boolean(shopSlug),
    staleTime: PRODUCT_LIST_STALE_TIME,
    gcTime: GC_TIME,
    retry: 2,
    // Stock is time-sensitive: refetch on window refocus rather than
    // serving a possibly-oversold cached list (Data Integrity §4).
    refetchOnWindowFocus: true,
    ...options,
  });
}

// ─── 5. Single product detail ───────────────────────────────────────

export function useProduct(
  shopSlug: string,
  productSlug: string,
  options?: Partial<UseQueryOptions<Product, Error>>
) {
  return useQuery({
    queryKey: storefrontKeys.product(shopSlug, productSlug),
    queryFn: async () => {
      const res = await apiClient.get<SingleEnvelope<Product>>(
        `/api/storefront/${shopSlug}/products/${productSlug}`
      );
      return res.data;
    },
    enabled: Boolean(shopSlug) && Boolean(productSlug),
    staleTime: PRODUCT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      if (isNotFound(error)) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}
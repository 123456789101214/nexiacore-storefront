/**
 * types/storefront.ts
 *
 * Strict types for the storefront-safe public API response subset only.
 * Deliberately excludes every ⚠️ INTERNAL field (buyingPrice,
 * minStockLevel, expiryDate, salesVelocity, status on Product, etc).
 * There is no `isActive` field on Product — do not add one here even
 * if a future response accidentally includes it.
 */

export interface Shop {
  name: string;
  address: string;
  phone: string;
  currency: string;
  // isActive is a server-side gating field only (§7 of the master
  // prompt) — it is not part of the public-safe payload and must
  // never be typed/rendered here.
}

export interface Category {
  name: string;
  // status is present in the payload but must never be filtered or
  // branched on by the frontend (§8) — typed here only for completeness
  // of what the API actually sends, not for use.
  status?: string;
}

export interface ProductDiscount {
  isActive: boolean;
  percentage: number;
  discountedPrice: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  discount: ProductDiscount;
  stock: number;
  unit: string;
  image: string;
  // NEVER add: status, buyingPrice, minStockLevel, expiryDate, salesVelocity
  // NOT currently in payload — if PUBLIC_PRODUCT_FIELDS is later
  // extended to include these, add them back here to match:
  // description?: string;
  // compareAtPrice?: number;
  // images?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Matches storefrontController.js exactly:
// res.status(200).json({ success, data: products, pagination: {...} })
export interface ProductListEnvelope {
  success: boolean;
  data: Product[];
  pagination: PaginationMeta;
}

// Matches: res.status(200).json({ success: true, data: product })
export interface SingleEnvelope<T> {
  success: boolean;
  data: T;
}

export interface ProductListFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
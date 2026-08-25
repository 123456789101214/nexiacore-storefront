"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, MapPin, Truck, Banknote, Building } from "lucide-react";
import { useShop, useCategories, useProducts } from "@/hooks/useStorefront";
import { ProductCard } from "@/components/storefront/ProductCard"; // FIX 7
import { CategoryTile } from "@/components/storefront/CategoryTile"; // FIX 7

export default function StorefrontHomePage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;

  const { data: shop, isLoading: shopLoading, isError: shopError } = useShop(shopSlug);
  const { data: categories, isLoading: categoriesLoading } = useCategories(shopSlug);
  const { data: productsData, isLoading: productsLoading } = useProducts(shopSlug, { limit: 4 });

  if (shopError || (!shopLoading && !shop)) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Store Not Found</h1>
        <p className="mt-2 text-gray-500">The store you are looking for does not exist or is currently unavailable.</p>
      </div>
    );
  }

  if (shopLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] animate-pulse bg-white">
        <div className="h-[50vh] w-full bg-blue-50" />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-8 w-48 bg-gray-200 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* HERO SECTION - Fix 4: Generic copy and clean gradient background */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-20 sm:px-6 lg:px-8 lg:py-32 overflow-hidden text-white">
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 leading-[1.1] max-w-3xl">
            Welcome to {shop?.name}
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl">
            Shop the full catalog, delivered directly to your door.
          </p>
          <Link
            href={`/${shopSlug}/products`}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-bold text-blue-900 shadow-md hover:bg-gray-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* SHOP BY CATEGORY - Fix 7: Using extracted component */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">Shop by Category</h3>
          <Link href={`/${shopSlug}/products`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
            View all categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categoriesLoading ? (
             [...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />)
          ) : categories?.map((category) => (
            <CategoryTile key={category.name} category={category} shopSlug={shopSlug} />
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS - Fix 7: Using extracted component */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">Featured Products</h3>
          <Link href={`/${shopSlug}/products`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {productsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          ) : productsData?.products.map((product) => (
            <ProductCard key={product._id} product={product} shopSlug={shopSlug} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50 pt-16 pb-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {shop?.phone || "N/A"}</li>
                {/* Fix 5: Fabricated email line explicitly removed */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Delivery</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Truck className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Islandwide delivery<br />2–4 working days</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Store</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{shop?.address || "Address not provided"}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">We Accept</h4>
              {/* Fix 6: Updated payment method badges with real options */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded border border-gray-200 bg-white text-[11px] font-bold text-gray-700 shadow-sm">
                  <Banknote className="h-3.5 w-3.5 text-gray-400" /> COD
                </div>
                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded border border-gray-200 bg-white text-[11px] font-bold text-gray-700 shadow-sm">
                  <Building className="h-3.5 w-3.5 text-gray-400" /> Bank Transfer
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {shop?.name}. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 flex items-center gap-1">
              Powered by <span className="font-bold text-blue-600">NexiaCore</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
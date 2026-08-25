"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories, useProducts, useShop } from "@/hooks/useStorefront";
import { ProductCard } from "@/components/storefront/ProductCard";

export default function CatalogListPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shopSlug = params.shopSlug as string;

  // Extract URL parameters
  const activeCategory = searchParams.get("category") || "";
  const activeSearch = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 16;

  // Local state for the search input to allow typing before submitting
  const [searchInput, setSearchInput] = useState(activeSearch);

  // Sync local search input if URL changes (e.g., clearing via back button)
  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  const { data: shop, isLoading: shopLoading } = useShop(shopSlug);
  const { data: categories, isLoading: categoriesLoading } = useCategories(shopSlug);
  
  const { 
    data: productsData, 
    isLoading: productsLoading,
    isError: productsError
  } = useProducts(shopSlug, { 
    category: activeCategory, 
    search: activeSearch, 
    page: currentPage, 
    limit 
  });

  // Handle URL updates for filters/pagination
  const updateQueryParams = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput, page: 1 }); // Reset to page 1 on new search
  };

  if (!shopLoading && !shop) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          <Link href={`/${shopSlug}`} className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">
            {activeCategory || activeSearch ? (activeCategory || "Search Results") : "All Products"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {activeCategory || (activeSearch ? `Search: "${activeSearch}"` : "All Products")}
        </h1>
      </div>

      {/* Toolbar: Categories & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 lg:pb-0 lg:mb-0 no-scrollbar">
          <button
            onClick={() => updateQueryParams({ category: null, page: 1 })}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          
          {categoriesLoading ? (
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            categories?.map((category) => (
              <button
                key={category.name}
                onClick={() => updateQueryParams({ category: category.name, page: 1 })}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.name
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-xs shrink-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="block w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </form>
      </div>

      {/* Results Meta info */}
      {!productsLoading && productsData && (
        <div className="mb-6 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing {productsData.products.length > 0 ? (currentPage - 1) * limit + 1 : 0}–
            {Math.min(currentPage * limit, productsData.pagination.total)} of {productsData.pagination.total} products
          </p>
        </div>
      )}

      {/* Product Grid */}
      {productsError ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-red-500">Failed to load products. Please try again.</p>
        </div>
      ) : productsLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : productsData?.products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your category or search terms.</p>
          {(activeCategory || activeSearch) && (
            <button 
              onClick={() => { setSearchInput(""); updateQueryParams({ category: null, search: null, page: 1 }); }}
              className="mt-6 font-medium text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {productsData?.products.map((product) => (
            <ProductCard key={product._id} product={product} shopSlug={shopSlug} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!productsLoading && productsData && productsData.pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 border-t border-gray-100 pt-8">
          <button
            onClick={() => updateQueryParams({ page: currentPage - 1 })}
            disabled={currentPage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Simple numbered pagination logic for demonstration */}
          <div className="hidden sm:flex items-center gap-2">
            {[...Array(productsData.pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => updateQueryParams({ page })}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isCurrent 
                      ? "bg-blue-600 text-white shadow" 
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gray-600 sm:hidden">
            Page {currentPage} of {productsData.pagination.totalPages}
          </span>

          <button
            onClick={() => updateQueryParams({ page: currentPage + 1 })}
            disabled={currentPage === productsData.pagination.totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
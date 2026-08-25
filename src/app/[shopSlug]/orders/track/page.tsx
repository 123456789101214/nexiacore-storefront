"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, ArrowRight } from "lucide-react";
import { useShop } from "@/hooks/useStorefront";

export default function TrackOrderSearchPage() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = params.shopSlug as string;

  const { data: shop, isLoading: shopLoading } = useShop(shopSlug);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedId = orderId.trim();
    
    if (!cleanedId) {
      setError("Please enter a valid order number.");
      return;
    }

    // Route them to the tracking detail page we built earlier
    router.push(`/${shopSlug}/orders/${cleanedId}/track`);
  };

  if (shopLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 animate-pulse">
        <div className="h-16 w-16 bg-gray-100 rounded-full mb-6" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-12">
        <Link href={`/${shopSlug}`} className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Track Order</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm ring-4 ring-blue-50/50">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Enter your order reference number to see the current status and delivery updates for {shop?.name}.
          </p>

          <form onSubmit={handleTrack} className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <label htmlFor="orderId" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Order Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. ORD-1234-56789"
                  className={`block w-full rounded-xl border ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Track Order <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-blue-900 mb-1">Can't find your order number?</p>
            <p>Check the confirmation email sent to you when placing the order.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
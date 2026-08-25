// app/[shopSlug]/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartLineItem } from "@/components/storefront/CartLineItem";
import { useShop } from "@/hooks/useStorefront";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const params = useParams<{ shopSlug: string }>();
  const shopSlug = params.shopSlug;
  const router = useRouter();
  
  const { items, getCartTotal, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const { isError: isShopError } = useShop(shopSlug);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isShopError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Store Not Found</h1>
        <p className="mt-2 text-gray-600">The store you are looking for does not exist or is currently unavailable.</p>
      </div>
    );
  }

  if (!mounted) {
    return <div className="min-h-screen px-4 py-8"><Skeleton className="h-[400px] max-w-3xl mx-auto rounded-xl" /></div>;
  }

  const total = getCartTotal();
  const count = getCartCount();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* BREADCRUMBS */}
      <nav className="mb-8 flex items-center text-sm font-medium text-gray-500">
        <Link href={`/${shopSlug}`} className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-gray-900">Cart</span>
      </nav>

      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Your Cart ({count})
      </h1>

      {items.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
          <Link 
            href={`/${shopSlug}/products`}
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-7 divide-y divide-gray-100 border-t border-gray-100">
            {items.map((item) => (
              <CartLineItem key={item.productSlug} item={item} />
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="mt-10 lg:col-span-5 lg:mt-0 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Order Summary</h2>
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">Rs. {formatPrice(total)}</span>
              </div>
              <p className="mb-8 text-sm text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              
              <button 
                onClick={() => router.push(`/${shopSlug}/checkout`)}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
              >
                Checkout
              </button>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-white p-4 border border-gray-100">
                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                <p className="text-xs font-medium text-gray-600 leading-relaxed">
                  100% secure payments with SSL encryption. Your data is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// components/storefront/PriceDisplay.tsx
"use client";

import type { ProductDiscount } from "@/types/storefront";

interface PriceDisplayProps {
  price: number;
  discount: ProductDiscount;
  currency?: string;
  className?: string;
}

export function PriceDisplay({ price, discount, currency = "Rs.", className = "" }: PriceDisplayProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (discount.isActive) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-semibold text-gray-900">
          {currency} {formatPrice(discount.discountedPrice)}
        </span>
        <span className="text-sm text-gray-400 line-through">
          {currency} {formatPrice(price)}
        </span>
      </div>
    );
  }

  return (
    <div className={`font-semibold text-gray-900 ${className}`}>
      {currency} {formatPrice(price)}
    </div>
  );
}
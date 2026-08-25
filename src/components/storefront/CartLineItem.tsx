// src/components/storefront/CartLineItem.tsx
"use client";

import Image from "next/image";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";

export interface CartItem {
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity?: (productSlug: string, quantity: number) => void;
  onRemove?: (productSlug: string) => void;
  readonly?: boolean;
  stockError?: boolean;
}

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  readonly = false,
  stockError = false,
}: CartLineItemProps) {
  return (
    <div
      className={`flex flex-col py-4 border-b border-gray-100 last:border-0 ${
        stockError ? "bg-red-50/50 -mx-4 px-4 rounded-lg border-red-100" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${
            stockError ? "border-red-200" : "border-gray-100"
          } bg-gray-50`}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              No Img
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between h-20">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-medium line-clamp-2 leading-tight ${
                stockError ? "text-red-900" : "text-gray-900"
              }`}
            >
              {item.name}
            </h4>
            {!readonly && onRemove && (
              <button
                onClick={() => onRemove(item.productSlug)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 shrink-0"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div
              className={`text-sm font-bold ${
                stockError ? "text-red-700" : "text-gray-900"
              }`}
            >
              Rs. {item.price.toFixed(2)}
            </div>

            {readonly ? (
              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
            ) : (
              <div
                className={`flex items-center rounded-full border ${
                  stockError
                    ? "border-red-200 bg-white"
                    : "border-gray-200 bg-white"
                } shadow-sm`}
              >
                <button
                  onClick={() =>
                    onUpdateQuantity?.(
                      item.productSlug,
                      Math.max(1, item.quantity - 1)
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors rounded-l-full disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex h-7 w-6 items-center justify-center text-xs font-semibold text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity?.(
                      item.productSlug,
                      item.quantity + 1
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors rounded-r-full"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Error Messaging */}
      {stockError && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-100/50 p-2 rounded">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            This item does not have enough stock to fulfill your requested
            quantity. Please reduce the quantity or remove it.
          </p>
        </div>
      )}
    </div>
  );
}

export default CartLineItem;
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/storefront";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  product: Product;
  shopSlug: string;
}

export function ProductCard({ product, shopSlug }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isInStock = product.stock > 10;

  const currentPrice = product.discount.isActive 
    ? product.discount.discountedPrice 
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to PDP when clicking the button
    if (isOutOfStock) return;
    
    addItem({
      productSlug: product.slug,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: product.image,
      unit: product.unit,
    });
  };

  return (
    <Link 
      href={`/${shopSlug}/products/${product.slug}`} 
      className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-[#f8f8f8] relative">
        {/* Stock Badges per Master Prompt logic */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="rounded bg-red-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 shadow-sm">
              Out of stock
            </span>
          )}
          {isLowStock && (
            <span className="rounded bg-orange-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 shadow-sm">
              Low stock
            </span>
          )}
          {isInStock && (
            <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700 shadow-sm">
              In stock
            </span>
          )}
        </div>

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover object-center transition-transform group-hover:scale-105 ${isOutOfStock ? 'opacity-60' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">No Image</div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            {product.discount.isActive ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 line-through">Rs. {product.price.toFixed(2)}</span>
                <span className="text-sm font-bold text-gray-900">Rs. {product.discount.discountedPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900">Rs. {product.price.toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
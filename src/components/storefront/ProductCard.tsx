"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    slug?: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    category?: string;
    badge?: string;
    rating?: number;
    reviewCount?: number;
    images?: { url: string }[];
    image?: string;
  };
  shopSlug: string;
}

export function ProductCard({ product, shopSlug }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const image = product.images?.[0]?.url ?? product.image ?? null;
  const isOnSale =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discountPercent = isOnSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : null;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Wire this up to your existing add-to-cart handler/hook — intentionally
    // left as a no-op so no new data-fetching logic is introduced here.
  };

  return (
    <Link
      href={`/${shopSlug}/products/${product.slug ?? product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_20px_45px_-15px_rgba(15,23,42,0.15)] sm:p-3"
    >
      {/* Media */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-300">
            <ShoppingBag className="h-8 w-8" />
          </div>
        )}

        {(isOnSale || product.badge) && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-900 shadow-sm backdrop-blur">
            {isOnSale ? `-${discountPercent}%` : product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border transition-colors duration-200 ${
            isFavorited
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300"
          }`}
        >
          <Heart className="h-3.5 w-3.5" fill={isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
            {product.category}
          </span>
        )}

        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900 sm:text-[15px]">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {product.description}
          </p>
        )}

        {typeof product.rating === "number" && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5"
                  fill={i < Math.round(product.rating!) ? "currentColor" : "none"}
                />
              ))}
            </span>
            {typeof product.reviewCount === "number" && <span>({product.reviewCount})</span>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900 sm:text-lg">
              ${product.price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-xs text-gray-400 line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToBag}
            className="rounded-lg bg-gray-100 px-3 py-2 text-[11px] font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-900 hover:text-white"
          >
            Add to bag
          </button>
        </div>
      </div>
    </Link>
  );
}
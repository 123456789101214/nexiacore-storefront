"use client";

import Link from "next/link";
import type { Category } from "@/types/storefront";

interface CategoryTileProps {
  category: Category;
  shopSlug: string;
}

export function CategoryTile({ category, shopSlug }: CategoryTileProps) {
  return (
    <Link
      href={`/${shopSlug}/products?category=${encodeURIComponent(category.name)}`}
      className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-[#ecebe7] p-4 text-center transition-transform hover:scale-[1.02]"
    >
      <span className="z-10 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
        {category.name}
      </span>
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
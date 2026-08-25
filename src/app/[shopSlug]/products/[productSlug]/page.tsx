"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Truck, RefreshCw, ShieldCheck, Plus, Minus, PackageX } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useStorefront";
import { useCartStore } from "@/store/useCartStore";
import { ProductCard } from "@/components/storefront/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;
  const productSlug = params.productSlug as string;

  const { data: product, isLoading, isError } = useProduct(shopSlug, productSlug);
  
  // Fetch related products based on the current product's category
  const { data: relatedData, isLoading: relatedLoading } = useProducts(
    shopSlug, 
    { category: product?.category, limit: 5 }, 
    { enabled: !!product?.category }
  );

  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reset quantity if the user navigates to a new product
  useEffect(() => {
    setQuantity(1);
  }, [productSlug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse">
        <div className="h-4 w-64 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-3xl" />
          <div className="space-y-6 pt-6">
            <div className="h-6 w-24 bg-gray-100 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="h-8 w-1/3 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded-xl mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
          <PackageX className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md">This item might have been removed or the link is incorrect.</p>
        <Link href={`/${shopSlug}/products`} className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-colors">
          Browse All Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isInStock = product.stock > 10;
  const currentPrice = product.discount.isActive ? product.discount.discountedPrice : product.price;

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    setIsAdding(true);
    addItem({
      productSlug: product.slug,
      name: product.name,
      price: currentPrice,
      quantity,
      image: product.image,
      unit: product.unit,
    });

    // Brief visual feedback before resetting button state
    setTimeout(() => setIsAdding(false), 600);
  };

  // Filter out the current product from related items, limit to 4
  const relatedProducts = relatedData?.products
    .filter(p => p._id !== product._id)
    .slice(0, 4) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap no-scrollbar">
        <Link href={`/${shopSlug}`} className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
        <Link href={`/${shopSlug}/products`} className="hover:text-blue-600 transition-colors">Products</Link>
        <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
        <Link href={`/${shopSlug}/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
        <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* LEFT: Product Image (Strict Data Contract: Only one image allowed) */}
        <div className="flex flex-col">
          <div className={`relative aspect-square w-full overflow-hidden rounded-3xl bg-[#f8f8f8] border border-gray-100 shadow-sm ${isOutOfStock ? 'opacity-70' : ''}`}>
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            
            {/* Mobile-only absolute stock badges (Desktop handles it in the right column) */}
            <div className="absolute top-4 left-4 z-10 lg:hidden flex flex-col gap-2">
              {isOutOfStock && <span className="rounded bg-red-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 shadow-sm">Out of stock</span>}
              {isLowStock && <span className="rounded bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 shadow-sm">Low stock</span>}
            </div>
          </div>
        </div>

        {/* RIGHT: Product Details */}
        <div className="flex flex-col pt-2 lg:pt-6">
          
          {/* Desktop Stock Indicator */}
          <div className="hidden lg:flex items-center gap-2 mb-4">
            {isOutOfStock ? (
              <><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-sm font-semibold text-red-600">Out of Stock</span></>
            ) : isLowStock ? (
              <><span className="h-2 w-2 rounded-full bg-orange-500" /><span className="text-sm font-semibold text-orange-600">Low Stock (Only {product.stock} left)</span></>
            ) : (
              <><span className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-semibold text-green-600">In Stock</span></>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl leading-tight mb-4">{product.name}</h1>
          
          {/* Price Block */}
          <div className="mb-8">
            {product.discount.isActive ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">Rs. {product.discount.discountedPrice.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">Rs. {product.price.toFixed(2)}</span>
                <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">-{product.discount.percentage}%</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">Rs. {product.price.toFixed(2)}</span>
            )}
            <p className="text-sm text-gray-500 mt-2">Unit: {product.unit}</p>
          </div>

          {/* Add to Cart Area */}
          <div className="border-t border-b border-gray-100 py-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
                <div className="flex h-14 items-center justify-between rounded-xl border border-gray-200 bg-white px-2">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-base font-bold text-gray-900 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isAdding ? (
                  "Added to Cart!"
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Static Value Props based on design */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 text-sm text-gray-600">
              <Truck className="h-5 w-5 text-gray-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-0.5">Delivery</strong>
                Islandwide delivery in 2–4 working days
              </div>
            </div>
            <div className="flex items-start gap-4 text-sm text-gray-600">
              <RefreshCw className="h-5 w-5 text-gray-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-0.5">Returns</strong>
                7-day easy returns for unopened items
              </div>
            </div>
            <div className="flex items-start gap-4 text-sm text-gray-600">
              <ShieldCheck className="h-5 w-5 text-gray-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-0.5">Secure Checkout</strong>
                100% secure payments with SSL encryption
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      {!relatedLoading && relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 pt-16 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {relatedProducts.map((relatedProd) => (
              <ProductCard key={relatedProd._id} product={relatedProd} shopSlug={shopSlug} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
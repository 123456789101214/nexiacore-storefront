"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import { useShop, useCategories } from "@/hooks/useStorefront";
import { useCartStore } from "@/store/useCartStore";
import { useCustomerSession } from "@/hooks/useCustomerAuth";
import { CartDrawer } from "./CartDrawer";

export function StoreFrontHeader() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;
  const pathname = usePathname();
  
  const { data: shop, isLoading: shopLoading } = useShop(shopSlug);
  const { data: categories } = useCategories(shopSlug);
  
  const { data: session } = useCustomerSession(shopSlug);
  
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen || isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen, isCartDrawerOpen]);

  // FIX: Strictly prioritize the Email address first to match Gmail-style behavior!
  const getInitial = () => {
    if (!session) return "";
    if (session.email) return session.email.charAt(0).toUpperCase();
    if (session.name) return session.name.charAt(0).toUpperCase();
    return "U";
  };
  
  const userInitial = getInitial();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link href={`/${shopSlug}`} className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                {shopLoading ? "" : shop?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight text-gray-900">{shop?.name || "Loading..."}</h1>
                <p className="text-xs font-medium text-gray-500">Home. Crafted. Sri Lanka.</p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-700 h-full">
            <div className="relative group h-full flex items-center">
              <Link href={`/${shopSlug}/products`} className="flex items-center gap-1 hover:text-blue-600 transition-colors py-8">
                Categories <span className="text-[10px] opacity-50 transition-transform group-hover:rotate-180">▼</span>
              </Link>
              <div className="absolute top-[70px] left-0 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                {categories?.map((cat) => (
                  <Link 
                    key={cat.name} 
                    href={`/${shopSlug}/products?category=${encodeURIComponent(cat.name)}`}
                    className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href={`/${shopSlug}/about`} className="hover:text-blue-600 transition-colors">About</Link>
            <Link href={`/${shopSlug}/orders/track`} className="hover:text-blue-600 transition-colors">Track Order</Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-gray-600 hover:text-blue-600 transition-colors p-2 -mr-2 sm:mr-0">
              <Search className="h-5 w-5" />
            </button>
            
            {/* DYNAMIC AVATAR: Gmail Style */}
            <Link href={`/${shopSlug}/account/orders`} className="hidden sm:block text-gray-600 hover:text-blue-600 transition-colors p-2">
              {session ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm ring-2 ring-white hover:ring-blue-100 transition-all">
                  {userInitial}
                </div>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>

            <button 
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center text-gray-600 hover:text-blue-600 transition-colors p-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
        shopSlug={shopSlug} 
      />

      {/* Mobile Navigation Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
         <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
         <div className={`absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
            
            <div className="flex h-20 shrink-0 items-center justify-between border-b px-6">
              <Link href={`/${shopSlug}`} className="flex items-center gap-3">
                 <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
                  {shopLoading ? "" : shop?.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-gray-900">{shop?.name}</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <nav className="flex flex-col gap-6 font-semibold text-gray-900">
                <Link href={`/${shopSlug}/products`} className="text-lg hover:text-blue-600 transition-colors">All Products</Link>
                
                <div className="h-px w-full bg-gray-100" />
                
                <div className="space-y-4 text-gray-600">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Categories</p>
                  {categories?.map((cat) => (
                    <Link 
                      key={cat.name} 
                      href={`/${shopSlug}/products?category=${encodeURIComponent(cat.name)}`}
                      className="block text-base hover:text-blue-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="h-px w-full bg-gray-100" />
                
                {/* MOBILE DYNAMIC AVATAR PROFILE BLOCK */}
                <Link href={`/${shopSlug}/account/orders`} className="flex items-center gap-3 text-base text-gray-600 hover:text-blue-600 group">
                  {session ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                        {userInitial}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 leading-tight">My Orders</span>
                        <span className="text-xs text-gray-500 font-normal">{session.email}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" /> My Account
                    </>
                  )}
                </Link>
                
                <Link href={`/${shopSlug}/orders/track`} className="text-base text-gray-600 hover:text-blue-600">Track Order</Link>
                <Link href={`/${shopSlug}/about`} className="text-base text-gray-600 hover:text-blue-600">About Us</Link>
              </nav>
            </div>
         </div>
      </div>
    </>
  );
}
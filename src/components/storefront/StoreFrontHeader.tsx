"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  ChevronRight, 
  Moon, 
  MapPin, 
  SlidersHorizontal, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown
} from "lucide-react";
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
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

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

  const getInitial = () => {
    if (!session) return "";
    if (session.email) return session.email.charAt(0).toUpperCase();
    if (session.name) return session.name.charAt(0).toUpperCase();
    return "U";
  };
  
  const userInitial = getInitial();

  return (
    <>
      <header className="sticky top-0 z-50 w-full font-sans text-[#0b0d12]">
        
        {/* Topbar */}
        <div className="hidden sm:block bg-[#0b0d12] text-white text-[12px]">
          <div className="mx-auto flex min-h-[36px] w-[min(1240px,calc(100%-64px))] items-center justify-between lg:w-[min(1240px,calc(100%-80px))] xl:w-[min(1240px,calc(100%-112px))]">
            <span>Complimentary delivery on orders over Rs. 15,000</span>
            <div className="flex items-center gap-[12px] opacity-85">
              <button className="flex items-center gap-1.5 font-bold transition-opacity hover:opacity-80">
                Delivering to <strong className="text-white">Sri Lanka</strong> <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <span className="opacity-35">•</span>
              <Link href={`/${shopSlug}/about`} className="transition-opacity hover:opacity-75">
                Concierge
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Wrap - Increased paddings and height for mobile/tab breathing room */}
        <div className="bg-white/90 backdrop-blur-[16px] border-b border-[#0b0d12]/[0.09] mix-blend-normal">
          <div className="mx-auto grid min-h-[155px] w-[min(1240px,calc(100%-48px))] grid-cols-[auto_1fr_auto] items-center gap-[16px] sm:w-[min(1240px,calc(100%-64px))] sm:gap-[20px] lg:min-h-[76px] lg:w-[min(1240px,calc(100%-80px))] lg:grid-cols-[auto_auto_1fr_auto] xl:w-[min(1240px,calc(100%-112px))]">
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#0b0d12]/[0.09] bg-white text-[#0b0d12] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)] focus-visible:outline-2 focus-visible:outline-[#5a5cf6] focus-visible:outline-offset-3 lg:hidden"
            >
              <Menu className="h-[24px] w-[24px]" strokeWidth={2} />
            </button>

            {/* Brand Logo */}
            <Link 
              href={`/${shopSlug}`} 
              aria-label={`${shop?.name || 'Shop'} home`} 
              className="group flex items-center gap-[12px] rounded-md text-[18px] font-[950] uppercase tracking-[0.18em] text-[#0b0d12] focus-visible:outline-2 focus-visible:outline-[#5a5cf6] focus-visible:outline-offset-3"
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#0b0d12] text-[15px] text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.15)] transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105">
                {shopLoading ? "N" : (shop?.name.charAt(0).toUpperCase() || "N")}
              </span>
              <span className="hidden sm:block mt-0.5">{shop?.name || "NEOLUX"}</span>
            </Link>

            {/* Desktop Links */}
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-[24px] text-[14px] font-[900] text-[#0b0d12]">
              <Link href={`/${shopSlug}/products`} className="transition-opacity hover:opacity-70">New arrivals</Link>
              <Link href={`/${shopSlug}/products`} className="transition-opacity hover:opacity-70">Best sellers</Link>
              <Link href={`/${shopSlug}/about`} className="transition-opacity hover:opacity-70">Journal</Link>
              <Link href={`/${shopSlug}/orders/track`} className="transition-opacity hover:opacity-70">Track Order</Link>
            </nav>

            {/* Search Input - Allowed a bit more vertical padding on mobile */}
            <div className="order-3 col-span-full mb-2 flex h-[50px] items-center gap-[12px] rounded-[16px] border border-[#0b0d12]/[0.09] bg-white/85 px-[16px] lg:order-none lg:col-auto lg:mb-0 lg:h-[46px] transition-colors focus-within:border-[#5a5cf6] focus-within:shadow-[0_0_0_1px_#5a5cf6]">
              <Search className="h-[20px] w-[20px] text-[#69707d]" strokeWidth={2.5} />
              <input 
                type="search" 
                placeholder="Search products, brands, styles..." 
                autoComplete="off"
                className="w-full bg-transparent text-[15px] text-[#0b0d12] outline-none placeholder:text-[#69707d]" 
              />
              <kbd className="hidden rounded-[7px] border border-[#0b0d12]/[0.09] px-2 py-[3px] text-[11px] font-bold text-[#69707d] xl:block">⌘ K</kbd>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-[10px] justify-end">
              <button aria-label="Toggle theme" className="hidden lg:flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#0b0d12]/[0.09] bg-white text-[#0b0d12] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)]">
                <Moon className="h-[20px] w-[20px]" strokeWidth={2} />
              </button>
              
              <button aria-label="Choose location" className="hidden lg:flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#0b0d12]/[0.09] bg-white text-[#0b0d12] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)]">
                <MapPin className="h-[20px] w-[20px]" strokeWidth={2} />
              </button>

              <Link 
                href={`/${shopSlug}/account/orders`} 
                aria-label="Account"
                className="hidden sm:flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#0b0d12]/[0.09] bg-white text-[#0b0d12] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)] focus-visible:outline-2 focus-visible:outline-[#5a5cf6] focus-visible:outline-offset-3"
              >
                {session ? (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#5a5cf6] text-[15px] font-[900] text-white">
                    {userInitial}
                  </div>
                ) : (
                  <User className="h-[22px] w-[22px]" strokeWidth={2} />
                )}
              </Link>

              <button 
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Shopping bag"
                className="flex h-[46px] items-center gap-[10px] rounded-full border border-[#0b0d12]/[0.09] bg-white px-4 text-[#0b0d12] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)] focus-visible:outline-2 focus-visible:outline-[#5a5cf6] focus-visible:outline-offset-3"
              >
                <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={2} />
                <span className="hidden sm:block text-[14px] font-[900]">Bag</span>
                <b className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#5a5cf6] text-[12px] font-bold text-white px-1">
                  {mounted ? cartCount : 0}
                </b>
              </button>
            </div>

          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border-b border-[#0b0d12]/[0.09]">
          <div className="mx-auto flex min-h-[46px] w-[min(1240px,calc(100%-48px))] items-center gap-[12px] py-2 text-[12px] sm:w-[min(1240px,calc(100%-64px))] lg:w-[min(1240px,calc(100%-80px))] xl:w-[min(1240px,calc(100%-112px))]">
            <span className="shrink-0 rounded-[7px] bg-[#1d8f66]/10 px-[8px] py-[5px] text-[10px] font-[900] tracking-[0.12em] text-[#1d8f66]">LIVE</span>
            <span className="truncate leading-relaxed">48-hour studio drop · Selected items up to 30% off</span>
            <Link href={`/${shopSlug}/products`} className="ml-auto flex shrink-0 items-center gap-1.5 font-[800] transition-opacity hover:opacity-70">
              Explore <ArrowRight className="h-[14px] w-[14px]" />
            </Link>
          </div>
        </div>

        {/* Commerce Bar (Categories & Shortcuts) */}
        <div className="hidden lg:block bg-white border-b border-[#0b0d12]/[0.09]">
          <div className="mx-auto flex min-h-[48px] w-[min(1240px,calc(100%-80px))] items-center gap-[24px] xl:w-[min(1240px,calc(100%-112px))]">
            
            <div className="group relative flex h-full items-center">
              <button className="flex items-center gap-[8px] rounded-[10px] bg-[#0b0d12] px-[12px] py-[9px] text-[12px] font-[900] text-white transition-all hover:bg-[#0b0d12]/90">
                <SlidersHorizontal className="h-[16px] w-[16px]" strokeWidth={2.5} /> Browse categories
              </button>
              
              <div className="absolute left-0 top-full mt-1 w-60 invisible translate-y-2 rounded-[22px] border border-[#0b0d12]/[0.09] bg-white p-3 opacity-0 shadow-[0_22px_60px_rgba(11,13,18,0.10)] transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="px-3 pb-2 pt-1 text-[11px] font-[800] uppercase tracking-[0.12em] text-[#69707d]">
                  Shop by category
                </div>
                {categories?.map((cat) => (
                  <Link 
                    key={cat.name} 
                    href={`/${shopSlug}/products?category=${encodeURIComponent(cat.name)}`}
                    className="block rounded-[12px] px-3 py-2.5 text-[14px] font-[700] text-[#0b0d12] transition-colors hover:bg-[#eef0f4]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <nav aria-label="Marketplace shortcuts" className="flex items-center gap-[24px] text-[12px] font-[850] text-[#69707d]">
              <Link href={`/${shopSlug}/products`} className="transition-colors hover:text-[#5a5cf6]">Flash deals</Link>
              <Link href={`/${shopSlug}/products`} className="transition-colors hover:text-[#5a5cf6]">Top rated</Link>
            </nav>

            <span className="ml-auto flex items-center gap-[6px] text-[11px] font-[900] text-[#1d8f66]">
              <ShieldCheck className="h-[16px] w-[16px]" strokeWidth={2.5} /> Buyer protected
            </span>
          </div>
        </div>

      </header>

      {/* Cart Drawer Component */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
        shopSlug={shopSlug} 
      />

      {/* Mobile Navigation Drawer - Extra padding for breathable mobile experience */}
      <aside 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!isMobileMenuOpen}
      >
         <div className="absolute inset-0 bg-[#0b0d12]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
         
         <div className={`absolute inset-y-0 left-0 flex w-[min(88vw,420px)] flex-col bg-white p-[36px] sm:p-[36px] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-6"}`}>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-[8px] text-[13px] font-[800] uppercase tracking-[0.14em] text-[#69707d]">
                Menu
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                aria-label="Close menu"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#0b0d12]/[0.09] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,13,18,0.06)]"
              >
                <X className="h-[24px] w-[24px] text-[#0b0d12]" strokeWidth={2} />
              </button>
            </div>

            <nav className="mt-[32px] grid">
              <Link href={`/${shopSlug}/products`} className="flex items-center justify-between border-b border-[#0b0d12]/[0.09] py-[22px] sm:py-[24px] text-[22px] font-[900] tracking-[-0.03em] text-[#0b0d12]">
                New arrivals <ChevronRight className="h-[20px] w-[20px]" strokeWidth={2.5} />
              </Link>
              
              <div className="border-b border-[#0b0d12]/[0.09] py-[22px] sm:py-[24px]">
                <button 
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="flex w-full items-center justify-between text-[13px] font-[800] uppercase tracking-[0.14em] text-[#69707d] transition-opacity hover:opacity-80"
                  aria-expanded={isMobileCategoriesOpen}
                >
                  <span>Categories</span>
                  <ChevronDown 
                    className={`h-[16px] w-[16px] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobileCategoriesOpen ? "rotate-180" : ""}`} 
                    strokeWidth={2.5} 
                  />
                </button>
                
                {/* Smooth Dropdown Container */}
                <div 
                  className={`grid transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    isMobileCategoriesOpen 
                      ? "grid-rows-[1fr] opacity-100 mt-5" 
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-4 pb-2">
                      {categories?.map((cat) => (
                        <Link 
                          key={cat.name} 
                          href={`/${shopSlug}/products?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)} // Link eka click karama drawer eka close wenna
                          className="text-[18px] font-[700] text-[#0b0d12] transition-colors hover:text-[#5a5cf6]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link href={`/${shopSlug}/orders/track`} className="flex items-center justify-between border-b border-[#0b0d12]/[0.09] py-[22px] sm:py-[24px] text-[22px] font-[900] tracking-[-0.03em] text-[#0b0d12]">
                Track Order <ChevronRight className="h-[20px] w-[20px]" strokeWidth={2.5} />
              </Link>
              <Link href={`/${shopSlug}/about`} className="flex items-center justify-between border-b border-[#0b0d12]/[0.09] py-[22px] sm:py-[24px] text-[22px] font-[900] tracking-[-0.03em] text-[#0b0d12]">
                Journal <ChevronRight className="h-[20px] w-[20px]" strokeWidth={2.5} />
              </Link>
            </nav>

            <div className="mt-auto grid gap-[12px] rounded-[20px] bg-[#eef0f4] p-[24px]">
              <span className="flex items-center gap-[8px] text-[13px] font-[800] uppercase tracking-[0.14em] text-[#69707d]">
                Account
              </span>
              
              {session ? (
                <div className="mt-1 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <strong className="block text-[20px] font-bold leading-none text-[#0b0d12] truncate">
                      {session.name || "Customer"}
                    </strong>
                    <span className="mt-1.5 block text-[13px] font-medium text-[#69707d] truncate">{session.email}</span>
                  </div>
                  <Link 
                    href={`/${shopSlug}/account/orders`} 
                    className="flex shrink-0 h-[46px] items-center justify-center rounded-full bg-[#5a5cf6] px-5 text-[14px] font-[900] text-white shadow-[0_10px_22px_rgba(90,92,246,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    My Orders
                  </Link>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
                  <strong className="text-[20px] font-bold text-[#0b0d12]">Guest</strong>
                  <Link 
                    href={`/${shopSlug}/account/orders`} 
                    className="flex h-[44px] items-center justify-center rounded-full border border-[#0b0d12]/[0.14] bg-transparent px-6 text-[14px] font-[800] text-[#0b0d12] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
         </div>
      </aside>
    </>
  );
}
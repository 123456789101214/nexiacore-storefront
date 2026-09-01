"use client";
import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, MapPin, Truck, Banknote, Building, Sparkles, Layers, LayoutGrid, ShoppingBag } from "lucide-react";
import { useShop, useCategories, useProducts } from "@/hooks/useStorefront";

import { ProductCard } from "@/components/storefront/ProductCard"; // FIX 7
import { CategoryTile } from "@/components/storefront/CategoryTile"; // FIX 7
import { ProductCardSkeleton } from "@/components/storefront/ProductCardSkeleton";
import type { Product } from "@/types/storefront";

export default function StorefrontHomePage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;

  const { data: shop, isLoading: shopLoading, isError: shopError } = useShop(shopSlug);
  const { data: categories, isLoading: categoriesLoading } = useCategories(shopSlug);
  const { data: productsData, isLoading: productsLoading } = useProducts(shopSlug, { limit: 4 });

  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Refs ────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Track precise coordinates for the premium lerp cursor
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorCoords = useRef({ x: -100, y: -100 });

  // ─── State ───────────────────────────────────────────────────────
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // ─── Premium Cursor Physics (Lerp) ───────────────────────────────
  useEffect(() => {
    // Only track global mouse movement when hovering the zone to save performance
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    if (isHovering) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [isHovering]);

  useEffect(() => {
    if (!isHovering) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const updateCursor = () => {
      const ease = 0.25; // Lower = more delayed/smooth, Higher = snappier

      // Calculate linear interpolation
      cursorCoords.current.x += (mousePos.current.x - cursorCoords.current.x) * ease;
      cursorCoords.current.y += (mousePos.current.y - cursorCoords.current.y) * ease;

      if (cursorRef.current) {
        // Apply 3D transform for hardware acceleration and smooth scaling when dragging
        cursorRef.current.style.transform = `translate3d(${cursorCoords.current.x}px, ${cursorCoords.current.y}px, 0) translate(-50%, -50%) scale(${isDragging ? 0.85 : 1})`;
      }
      requestRef.current = requestAnimationFrame(updateCursor);
    };

    requestRef.current = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isHovering, isDragging]);

  // ─── Drag to Scroll Logic ────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Prevent text/element selection while dragging

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier

    setDragDistance((prev) => prev + Math.abs(walk));
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Prevent link navigation if the user was just trying to drag the carousel
  const preventClickOnDrag = (e: React.MouseEvent) => {
    if (dragDistance > 10) {
      e.preventDefault();
    }
  };

  if (shopError || (!shopLoading && !shop)) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Store Not Found</h1>
        <p className="mt-2 text-gray-500">The store you are looking for does not exist or is currently unavailable.</p>
      </div>
    );
  }

  if (shopLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] animate-pulse bg-white">
        <div className="h-[50vh] w-full bg-blue-50" />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-8 w-48 bg-gray-200 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const allProducts = productsData?.products || [];

  // Prioritize products with active discounts, fallback to regular products
  const discountedProducts = allProducts.filter((p) => p.discount?.isActive);
  const displayProducts = discountedProducts.length >= 3
    ? discountedProducts.slice(0, 3)
    : allProducts.slice(0, 3);

  // If the shop has literally 0 products, hide the section entirely
  if (displayProducts.length === 0) {
    return null;
  }

  const mainDeal = displayProducts[0];
  const sideDeal1 = displayProducts[1];
  const sideDeal2 = displayProducts[2];
  const currency = shop?.currency || "Rs.";

  return (
    <main className="flex-1">
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto w-full" id="hero">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">

          {/* Main Hero Panel */}
          <article className="lg:col-span-8 bg-[linear-gradient(145deg,#e9edff,#d8ddf2_55%,#f5f6fa)] rounded-3xl lg:rounded-[30px] relative overflow-hidden flex flex-col lg:flex-row shadow-sm min-h-[520px] lg:min-h-[620px]">

            {/* Ambient Glow Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] right-[10%] w-[60%] aspect-square rounded-full bg-[#5a5cf6]/10 blur-3xl mix-blend-multiply transform -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-[20%] left-[10%] w-[40%] aspect-square rounded-full bg-white/60 blur-3xl" />
            </div>

            {/* Copy Content */}
            <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-center w-full lg:w-[58%]">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] uppercase text-slate-500 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#5a5cf6]" />
                Welcome to {shop?.name || "Our Store"}
              </span>

              <h1 className="text-[2.5rem] sm:text-5xl lg:text-[4.5rem] font-black leading-[0.94] tracking-[-0.06em] text-[#0b0d12] mb-5">
                Discover products<br className="hidden sm:block" />
                that <em className="not-italic text-[#5a5cf6]">elevate</em> your <br className="hidden sm:block" />
                everyday.
              </h1>

              <p className="text-base lg:text-[16px] text-[#4f5663] max-w-[420px] mb-8 leading-relaxed">
                Shop our complete catalog, carefully curated and delivered directly to your door with zero hassle.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${shopSlug}/products`}
                  className="inline-flex h-12 lg:h-[50px] items-center justify-center gap-2.5 px-6 lg:px-7 rounded-full bg-[#5a5cf6] text-white text-sm font-extrabold tracking-tight shadow-[0_10px_22px_rgba(90,92,246,0.22)] hover:-translate-y-0.5 transition-all duration-240 ease-out"
                >
                  Shop the collection <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link
                  href={`/${shopSlug}/products`}
                  className="inline-flex h-12 lg:h-[50px] items-center justify-center px-6 lg:px-7 rounded-full bg-transparent border border-[#0b0d12]/15 text-[#0b0d12] text-sm font-extrabold tracking-tight hover:-translate-y-0.5 hover:bg-white/50 transition-all duration-240 ease-out"
                >
                  See all categories
                </Link>
              </div>

              {/* Meta metrics */}
              <div className="flex flex-wrap gap-8 lg:gap-10 mt-10 lg:mt-12">
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg lg:text-[20px] font-black text-[#0b0d12] tracking-tight">4.9/5</span>
                  <span className="text-[11px] font-semibold text-[#69707d] tracking-wide">Community rating</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg lg:text-[20px] font-black text-[#0b0d12] tracking-tight">48h</span>
                  <span className="text-[11px] font-semibold text-[#69707d] tracking-wide">Dispatch on stocked items</span>
                </div>
              </div>
            </div>

            {/* Universal Abstract Visuals (Replaces Phone/Audio) */}
            <div className="relative flex-1 flex items-center justify-center min-h-[340px] lg:min-h-0 pointer-events-none mt-4 lg:mt-0">
              <div className="relative w-[220px] h-[260px] z-10 flex items-center justify-center">

                {/* Floating Accent Sphere Behind */}
                <div className="absolute top-4 right-2 w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#5a5cf6] to-[#a88cff] shadow-[0_10px_30px_rgba(90,92,246,0.4)] animate-pulse z-0" />

                {/* Main Glassmorphic Orb */}
                <div className="absolute w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(90,92,246,0.15)] z-10 flex items-center justify-center">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-white/40 to-transparent border border-white/30" />
                </div>

                {/* Floating Dark Card overlapping the orb */}
                <div className="absolute bottom-6 left-2 w-[110px] h-[110px] rounded-[24px] bg-[linear-gradient(145deg,#1c2330,#0d1119)] rotate-[-8deg] shadow-2xl z-20 flex flex-col justify-between p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-6 h-1.5 rounded-full bg-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-white/80" />
                    <div className="w-2/3 h-2 rounded-full bg-[#5a5cf6]" />
                  </div>
                </div>

              </div>

              {/* Glowing Ambient Specs */}
              <div className="absolute w-4 h-4 rounded-full bg-white/80 blur-[1px] right-[14%] top-[20%]" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#5a5cf6]/40 blur-[1px] left-[13%] bottom-[15%]" />
            </div>
          </article>

          {/* Right Rail: Story Cards */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">

            {/* Card 1 - Dark (Universal Content) */}
            <article className="flex-1 rounded-[26px] bg-[#11141a] text-white p-6 relative overflow-hidden flex flex-col justify-between min-h-[250px] lg:min-h-[300px] group border border-transparent">
              <div className="relative z-10">
                <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-white/60 mb-2.5 block">
                  Featured
                </span>
                <h2 className="text-[28px] lg:text-[32px] font-black leading-[1] tracking-[-0.045em] mb-4">
                  Curated quality.<br />Built to last.
                </h2>
                <Link
                  href={`/${shopSlug}/products`}
                  className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide hover:gap-2.5 transition-all duration-200"
                >
                  Explore collection <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>

              {/* Abstract Graphic: Glowing overlapping rings */}
              <div className="absolute -bottom-8 -right-8 w-[150px] h-[150px] pointer-events-none">
                <div className="absolute inset-0 rounded-full border-[18px] border-[#5a5cf6]/20 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-6 rounded-full border-[12px] border-white/10 transition-transform duration-500 group-hover:scale-95" />
              </div>
            </article>

            {/* Card 2 - Light (Universal Content) */}
            <article className="flex-1 rounded-[26px] bg-white border border-[#0b0d12]/10 text-[#0b0d12] p-6 relative overflow-hidden flex flex-col justify-between min-h-[250px] lg:min-h-[300px] group">
              <div className="relative z-10">
                <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#69707d] mb-2.5 block">
                  Essentials
                </span>
                <h2 className="text-[28px] lg:text-[32px] font-black leading-[1] tracking-[-0.045em] mb-4">
                  Everything you<br />need, right here.
                </h2>
                <Link
                  href={`/${shopSlug}/products`}
                  className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide hover:gap-2.5 transition-all duration-200"
                >
                  Shop now <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>

              {/* Abstract Graphic: Soft elegant spheres */}
              <div className="absolute -bottom-6 -right-4 w-[120px] h-[120px] pointer-events-none flex items-center justify-center">
                <div className="absolute w-[100px] h-[100px] rounded-full bg-[linear-gradient(140deg,#d7dbf4,#f5f6fa)] opacity-80" />
                <div className="absolute w-[60px] h-[60px] rounded-full bg-[linear-gradient(140deg,#ffffff,#e9edff)] shadow-[0_12px_24px_rgba(11,13,18,0.06)] translate-x-4 -translate-y-4" />
              </div>
            </article>

          </div>
        </div>
      </section>

      <section
        aria-label="Shop by category"
        className="py-16 sm:py-20 lg:py-24 relative"
      >
        {/* ─── Custom Floating Cursor (Hidden on touch devices/mobile) ─── */}
        <div
          ref={cursorRef}
          className={`pointer-events-none fixed left-0 top-0 z-[100] hidden h-16 w-16 items-center justify-center rounded-full bg-gray-950/90 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl backdrop-blur transition-opacity duration-300 sm:flex ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        >
          {isDragging ? 'Hold' : 'Drag'}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="mb-8 flex flex-col items-start gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-gray-500/80">
                Browse the universe
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl md:text-5xl">
                Shop by mood.
              </h2>
            </div>
            <Link
              href={`/${shopSlug}/products`}
              className="group inline-flex items-center gap-2 text-sm font-bold text-gray-900 transition-colors hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </Link>
          </div>

          {/* Smooth Horizontal Scroll Tabs Menu */}
          <div
            className="relative -mx-4 px-4 sm:mx-0 sm:px-0"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div
              ref={scrollRef}
              // Smart classes: disable snap when dragging so physics feel natural, hide default cursor on desktop
              className={`flex w-full gap-3 overflow-x-auto pb-6 pt-2 sm:cursor-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'select-none' : 'snap-x snap-mandatory scroll-smooth'}`}
            >

              {/* 'All' Static Pill */}
              <Link
                href={`/${shopSlug}/products`}
                onClick={preventClickOnDrag}
                draggable={false} // Prevent ghost image drag
                className="group flex shrink-0 snap-start items-center gap-3 rounded-full border border-gray-950 bg-gray-950 py-2.5 pl-2.5 pr-5 text-sm font-extrabold text-white shadow-sm transition-all duration-200 ease-out hover:bg-gray-900 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:cursor-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white/20 pointer-events-none">
                  <Layers className="h-4 w-4" />
                </div>
                All
              </Link>

              {/* Dynamic Category Pills */}
              {categoriesLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex h-[56px] w-36 shrink-0 animate-pulse rounded-full border border-gray-100 bg-gray-100"
                  />
                ))
              ) : (
                categories?.map((category) => (
                  <Link
                    key={category.name}
                    href={`/${shopSlug}/products?category=${encodeURIComponent(category.name)}`}
                    onClick={preventClickOnDrag}
                    draggable={false}
                    className="group flex shrink-0 snap-start items-center gap-3 rounded-full border border-gray-200 bg-white py-2.5 pl-2.5 pr-5 text-sm font-extrabold text-gray-900 shadow-sm transition-all duration-200 ease-out hover:border-gray-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:cursor-none"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 text-gray-500 transition-colors group-hover:bg-gray-200 group-hover:text-gray-900 pointer-events-none">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    {category.name}
                  </Link>
                ))
              )}

              {/* Spacer for right-edge breathing room on mobile scroll */}
              <div className="w-1 shrink-0 sm:hidden" aria-hidden="true" />
            </div>
          </div>

        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#f5f6f8] text-slate-900" id="deals">
        <div className="max-w-[1240px] mx-auto px-5 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.15em] uppercase text-slate-500 mb-3">
                Limited-time edit
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none text-slate-950">
                Flash deals, without the flash-sale chaos.
              </h2>
            </div>

            {/* Countdown Timer (Static layout, hydrating safely) */}
            <div
              className="flex items-center gap-3 px-5 py-2.5 border border-slate-200/80 bg-white rounded-[20px] shadow-sm shrink-0 transition-opacity duration-500"
              style={{ opacity: mounted ? 1 : 0 }}
              aria-label="Deal countdown"
            >
              <div className="flex flex-col items-center justify-center min-w-[36px]">
                <span className="text-xl md:text-2xl font-black leading-none text-slate-900">18</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Hrs</span>
              </div>
              <span className="text-slate-300 font-black text-lg -translate-y-2">:</span>
              <div className="flex flex-col items-center justify-center min-w-[36px]">
                <span className="text-xl md:text-2xl font-black leading-none text-slate-900">05</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Min</span>
              </div>
              <span className="text-slate-300 font-black text-lg -translate-y-2">:</span>
              <div className="flex flex-col items-center justify-center min-w-[36px]">
                <span className="text-xl md:text-2xl font-black leading-none text-slate-900">24</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Sec</span>
              </div>
            </div>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4 md:gap-5">

            {/* Main Featured Deal */}
            {mainDeal && (
              <article className="relative min-h-[460px] lg:min-h-[500px] rounded-[28px] bg-gradient-to-br from-[#232736] to-[#161821] p-8 lg:p-10 flex flex-col justify-center overflow-hidden group shadow-lg">
                {mainDeal.discount?.isActive && (
                  <span className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs font-black text-white z-20">
                    −{mainDeal.discount.percentage}%
                  </span>
                )}

                <div className="relative z-10 max-w-[480px]">
                  <span className="text-white/50 text-[11px] font-extrabold uppercase tracking-widest block mb-4">
                    {mainDeal.category}
                  </span>
                  <h3 className="text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[0.95] mb-4">
                    {mainDeal.name}
                  </h3>

                  {/* Description intentionally omitted per Data Contract Rule 1: No mock fields */}

                  <div className="flex items-center flex-wrap gap-4 mt-8 mb-8">
                    {mainDeal.discount?.isActive ? (
                      <>
                        <strong className="text-3xl font-black text-white">
                          {currency} {mainDeal.discount.discountedPrice.toLocaleString()}
                        </strong>
                        <del className="text-white/40 text-base font-semibold">
                          {currency} {mainDeal.price.toLocaleString()}
                        </del>
                        <span className="text-emerald-400 text-[11px] font-black uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-md">
                          Save {currency} {(mainDeal.price - mainDeal.discount.discountedPrice).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <strong className="text-3xl font-black text-white">
                        {currency} {mainDeal.price.toLocaleString()}
                      </strong>
                    )}
                  </div>

                  {/* Real Stock Status (Replaces mock progress bar) */}
                  <div className="mb-8">
                    {mainDeal.stock <= 0 ? (
                      <span className="text-red-400 font-bold text-sm">Out of stock</span>
                    ) : mainDeal.stock <= 10 ? (
                      <span className="text-amber-400 font-bold text-sm">Low stock: Only {mainDeal.stock} left</span>
                    ) : (
                      <span className="text-emerald-400 font-bold text-sm">In stock</span>
                    )}
                  </div>

                  <button
                    disabled={mainDeal.stock <= 0}
                    className="bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-slate-950 px-6 py-4 rounded-full font-extrabold text-sm inline-flex items-center gap-2.5 transition-transform hover:-translate-y-1 shadow-xl shadow-white/5"
                  >
                    {mainDeal.stock <= 0 ? "Out of stock" : "Add to bag"}
                    <ShoppingBag strokeWidth={2.5} className="w-4 h-4" />
                  </button>
                </div>

                {/* Real Product Image Visual */}
                <div className="absolute right-[-5%] md:right-[2%] bottom-[-5%] md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-[240px] md:w-[320px] aspect-square drop-shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-3 z-0 pointer-events-none">
                  <Image
                    src={mainDeal.image}
                    alt={mainDeal.name}
                    fill
                    sizes="(max-width: 768px) 240px, 320px"
                    className="object-contain"
                  />
                </div>
              </article>
            )}

            {/* Side Deals Column */}
            <div className="grid grid-rows-2 gap-4 md:gap-5">
              {[sideDeal1, sideDeal2].filter(Boolean).map((sideDeal, idx) => (
                <Link
                  key={sideDeal._id}
                  href={`/${shopSlug}/products/${sideDeal.slug}`}
                  className="bg-white border border-slate-200/70 rounded-[28px] p-6 lg:p-8 flex items-center relative overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
                >
                  <div className="flex-1 relative z-10 pr-28">
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block mb-2 line-clamp-1">
                      {sideDeal.category}
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3 line-clamp-2">
                      {sideDeal.name}
                    </h3>

                    <div className="flex items-center gap-3">
                      {sideDeal.discount?.isActive ? (
                        <>
                          <strong className="text-xl font-black text-slate-900">
                            {currency} {sideDeal.discount.discountedPrice.toLocaleString()}
                          </strong>
                          <del className="text-slate-400 text-sm font-semibold">
                            {currency} {sideDeal.price.toLocaleString()}
                          </del>
                        </>
                      ) : (
                        <strong className="text-xl font-black text-slate-900">
                          {currency} {sideDeal.price.toLocaleString()}
                        </strong>
                      )}
                    </div>

                    {sideDeal.stock <= 10 && sideDeal.stock > 0 && (
                      <span className="text-amber-500 font-bold text-[10px] uppercase tracking-wider block mt-2">
                        Low stock
                      </span>
                    )}
                    {sideDeal.stock <= 0 && (
                      <span className="text-red-500 font-bold text-[10px] uppercase tracking-wider block mt-2">
                        Out of stock
                      </span>
                    )}
                  </div>

                  {/* Real Side Deal Image Visual */}
                  <div className="absolute right-[85px] md:right-[100px] w-[90px] h-[90px] md:w-[110px] md:h-[110px] transition-transform duration-500 group-hover:scale-105 pointer-events-none">
                    <Image
                      src={sideDeal.image}
                      alt={sideDeal.name}
                      fill
                      sizes="110px"
                      className="object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="w-11 h-11 rounded-full border border-slate-200 grid place-items-center bg-white absolute right-6 lg:right-8 shadow-sm transition-colors group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white shrink-0">
                    <ArrowRight strokeWidth={2.5} className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Handpicked for you
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Products
            </h2>
          </div>
 
          <Link
            href={`/${shopSlug}/products`}
            className="group inline-flex items-center gap-1.5 self-start text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700 sm:self-auto"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
 
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-7">
          {productsLoading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : productsData?.products.map((product) => (
                <ProductCard key={product._id} product={product} shopSlug={shopSlug} />
              ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50 pt-16 pb-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {shop?.phone || "N/A"}</li>
                {/* Fix 5: Fabricated email line explicitly removed */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Delivery</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Truck className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Islandwide delivery<br />2–4 working days</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Store</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{shop?.address || "Address not provided"}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">We Accept</h4>
              {/* Fix 6: Updated payment method badges with real options */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded border border-gray-200 bg-white text-[11px] font-bold text-gray-700 shadow-sm">
                  <Banknote className="h-3.5 w-3.5 text-gray-400" /> COD
                </div>
                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded border border-gray-200 bg-white text-[11px] font-bold text-gray-700 shadow-sm">
                  <Building className="h-3.5 w-3.5 text-gray-400" /> Bank Transfer
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {shop?.name}. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 flex items-center gap-1">
              Powered by <span className="font-bold text-blue-600">NexiaCore</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function FlashDeals() {
  // Safe, hydration-friendly static timer setup
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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

          {/* Countdown Timer */}
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
          <article className="relative min-h-[460px] lg:min-h-[500px] rounded-[28px] bg-gradient-to-br from-[#232736] to-[#161821] p-8 lg:p-10 flex flex-col justify-center overflow-hidden group shadow-lg">
            <span className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs font-black text-white z-20">
              −22%
            </span>
            
            <div className="relative z-10 max-w-[480px]">
              <span className="text-white/50 text-[11px] font-extrabold uppercase tracking-widest block mb-4">
                Featured deal
              </span>
              <h3 className="text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[0.95] mb-4">
                StudioPods Max
              </h3>
              <p className="text-white/70 text-base md:text-lg max-w-[400px] font-medium">
                Adaptive audio, spatial tuning and 40-hour battery.
              </p>
              
              <div className="flex items-center gap-4 mt-8 mb-8">
                <strong className="text-3xl font-black text-white">$179</strong>
                <del className="text-white/40 text-base font-semibold">$229</del>
                <span className="text-emerald-400 text-[11px] font-black uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-md">
                  Save $50
                </span>
              </div>
              
              <div className="max-w-[340px]">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[76%]" />
                </div>
                <div className="flex justify-between text-white/50 text-[11px] mt-3 font-semibold">
                  <span>76% claimed</span>
                  <span>14 left</span>
                </div>
              </div>

              <button className="mt-8 bg-white hover:bg-slate-100 text-slate-950 px-6 py-4 rounded-full font-extrabold text-sm inline-flex items-center gap-2.5 transition-transform hover:-translate-y-1 shadow-xl shadow-white/5">
                Add to bag
                <ShoppingBag strokeWidth={2.5} className="w-4 h-4" />
              </button>
            </div>

            {/* CSS Art: Headphones Visual */}
            <div className="absolute right-[-10%] md:right-[2%] bottom-[-5%] w-[320px] h-[280px] -rotate-12 drop-shadow-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:-rotate-6 z-0">
              {/* Headband */}
              <div className="absolute left-[45px] top-[15px] w-[210px] h-[190px] border-[28px] border-[#8f97a8] border-b-0 rounded-t-[120px]" />
              {/* Left Cup */}
              <div className="absolute w-[86px] h-[105px] rounded-[42px] top-[130px] left-[20px] bg-gradient-to-br from-[#eaedf3] to-[#7f899d] shadow-[inset_0_-8px_12px_rgba(0,0,0,0.2)]" />
              {/* Right Cup */}
              <div className="absolute w-[86px] h-[105px] rounded-[42px] top-[130px] right-[4px] bg-gradient-to-br from-[#eaedf3] to-[#7f899d] shadow-[inset_0_-8px_12px_rgba(0,0,0,0.2)]" />
            </div>
          </article>

          {/* Side Deals Column */}
          <div className="grid grid-rows-2 gap-4 md:gap-5">
            
            {/* Side Deal 1: Watch */}
            <article className="bg-white border border-slate-200/70 rounded-[28px] p-6 lg:p-8 flex items-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex-1 relative z-10">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
                  Wearable
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
                  Arc Watch S4
                </h3>
                <div className="flex items-center gap-3">
                  <strong className="text-xl font-black text-slate-900">$149</strong>
                  <del className="text-slate-400 text-sm font-semibold">$189</del>
                </div>
              </div>
              
              {/* CSS Art: Watch Visual */}
              <div className="absolute right-[85px] md:right-[100px] w-[110px] h-[110px] rounded-[36px] bg-gradient-to-br from-[#8ea0b3] to-[#1b2432] grid place-items-center drop-shadow-xl pointer-events-none transition-transform duration-500 group-hover:scale-105">
                <div className="w-[74px] h-[74px] rounded-[28px] bg-[#090c11] text-white flex items-center justify-center text-sm font-bold tracking-wider shadow-inner">
                  10:09
                </div>
              </div>

              <button 
                className="w-11 h-11 rounded-full border border-slate-200 grid place-items-center bg-white absolute right-6 lg:right-8 shadow-sm transition-colors group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                aria-label="View Arc Watch S4"
              >
                <ArrowRight strokeWidth={2.5} className="w-4 h-4" />
              </button>
            </article>

            {/* Side Deal 2: Lamp */}
            <article className="bg-white border border-slate-200/70 rounded-[28px] p-6 lg:p-8 flex items-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex-1 relative z-10">
                <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
                  Desk
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
                  Halo Desk Lamp
                </h3>
                <div className="flex items-center gap-3">
                  <strong className="text-xl font-black text-slate-900">$69</strong>
                  <del className="text-slate-400 text-sm font-semibold">$89</del>
                </div>
              </div>
              
              {/* CSS Art: Lamp Visual */}
              <div className="absolute right-[85px] md:right-[100px] w-[110px] h-[110px] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
                <div className="absolute left-[24px] top-[14px] w-[64px] h-[46px] rounded-t-[34px] rounded-b-[16px] bg-gradient-to-br from-[#e8f1ff] to-[#b5bfda] shadow-[0_20px_30px_rgba(71,80,120,0.15)] z-10">
                  {/* Lamp Legs generated via Box Shadow */}
                  <div 
                    className="absolute left-[30px] top-[44px] w-[4px] h-[48px] bg-[#4f5968] z-0"
                    style={{ boxShadow: "-24px 44px 0 0 #4f5968, 24px 44px 0 0 #4f5968" }}
                  />
                </div>
              </div>

              <button 
                className="w-11 h-11 rounded-full border border-slate-200 grid place-items-center bg-white absolute right-6 lg:right-8 shadow-sm transition-colors group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                aria-label="View Halo Desk Lamp"
              >
                <ArrowRight strokeWidth={2.5} className="w-4 h-4" />
              </button>
            </article>

          </div>
        </div>

      </div>
    </section>
  );
}
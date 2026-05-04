"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { LiffSidebar } from "./LiffSidebar";
import { useCartStore } from "@/lib/cartStore";
import { useSearchStore } from "@/lib/searchStore";

interface LiffHeaderProps {
  shopName: string;
  categories: any[];
}

export function LiffHeader({ shopName, categories }: LiffHeaderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getItemCount } = useCartStore();
  const { searchQuery, setSearchQuery, isSearchVisible, setSearchVisible } = useSearchStore();
  const cartCount = getItemCount();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  return (
    <>
      <div className="sticky top-4 z-50 px-4 w-full flex justify-center h-0">
        <nav 
          className={`flex items-center justify-between bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
            isSearchVisible 
              ? "w-full h-[56px] rounded-[24px] px-3" 
              : "w-full h-[64px] rounded-[32px] px-2"
          }`}
        >
          {/* Main Controls - Hidden when search is visible */}
          <div className={`flex items-center gap-2 transition-all duration-500 ${isSearchVisible ? "opacity-0 invisible w-0 translate-x-[-20px]" : "opacity-100 visible w-auto translate-x-0"}`}>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-stone-900 text-white active:scale-90 transition-transform shadow-lg shadow-stone-900/10"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Dynamic Search Pill */}
          <div 
            className={`flex-1 flex items-center transition-all duration-500 bg-stone-100/10 rounded-full h-full mx-2 ${
              isSearchVisible ? "translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <Search size={18} className="text-stone-400 ml-4 shrink-0" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search pieces..."
              className="bg-transparent border-none outline-none flex-1 px-3 text-[15px] font-medium text-stone-900 placeholder:text-stone-400 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => {
                setSearchQuery("");
                setSearchVisible(false);
              }}
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors mr-1 shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Right Side Actions - Hidden when search is visible */}
          <div className={`flex items-center gap-1.5 transition-all duration-500 ${isSearchVisible ? "opacity-0 invisible w-0 translate-x-[20px]" : "opacity-100 visible w-auto translate-x-0"}`}>
            {!isSearchVisible && (
              <button 
                onClick={() => setSearchVisible(true)}
                className="w-12 h-12 rounded-full flex items-center justify-center text-stone-900 hover:bg-stone-100 active:scale-90 transition-all font-bold"
              >
                <Search size={20} strokeWidth={2.5} />
              </button>
            )}
            
            <Link 
              href="/liff/cart" 
              className="relative group w-12 h-12 rounded-full flex items-center justify-center text-stone-900 hover:bg-stone-100 active:scale-90 transition-all"
            >
              <ShoppingBag size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              {mounted && cartCount > 0 && (
                <div className="absolute top-[8px] right-[8px] min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center border-2 border-white animate-pulse-once">
                  {cartCount}
                </div>
              )}
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content jump since island is sticky top-4 but nav height is h-0 wrapper */}
      <div className="h-[80px]" />

      <LiffSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        categories={categories}
        shopName={shopName}
      />
    </>
  );
}

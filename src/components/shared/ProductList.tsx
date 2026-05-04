"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { PackageSearch } from "lucide-react";
import { useSearchStore } from "@/lib/searchStore";
import { useLocale } from "next-intl";

interface ProductListProps {
  initialProducts: any[];
  categories: any[];
}

export function ProductList({ initialProducts, categories }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const { searchQuery, setSearchQuery } = useSearchStore();
  const locale = useLocale();
  const isEn = locale === "en";

  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category?.id === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => 
          (isEn ? p.name_en : p.name_th)?.toLowerCase().includes(q) || 
          p.name_th.toLowerCase().includes(q) || 
          (isEn ? p.category?.name_en : p.category?.name_th)?.toLowerCase().includes(q) ||
          p.category?.name_th?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialProducts, activeCategory, searchQuery]);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Categories Modern Tab - Simplified & Clean */}
      <section className="mb-12 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
          <button 
            className={`px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex-shrink-0 rounded-2xl border ${
              activeCategory === 'all' 
                ? "bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-900/10" 
                : "bg-white border-stone-100 text-stone-500 hover:border-stone-300"
            }`}
            onClick={() => setActiveCategory('all')} 
          >
            Show All
          </button>
          {categories.map((cat: any) => (
            <button 
              key={cat.id} 
              className={`px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex-shrink-0 rounded-2xl border ${
                activeCategory === cat.id 
                  ? "bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-900/10" 
                  : "bg-white border-stone-100 text-stone-500 hover:border-stone-300"
              }`}
              onClick={() => setActiveCategory(cat.id)} 
            >
              {isEn ? (cat.name_en || cat.name_th) : cat.name_th}
            </button>
          ))}
        </div>
      </section>

      {/* Main Unified Product Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
            {searchQuery ? `Search Results (${filteredProducts.length})` : 'Curated Selection'}
          </h3>
          <div className="flex-1 h-[1px] bg-stone-200/60" />
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10">
            {filteredProducts.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="standard"
              />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center px-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-stone-100 rounded-[32px] flex items-center justify-center mb-6">
              <PackageSearch className="text-stone-300" size={32} />
            </div>
            <h4 className="text-[15px] font-bold text-stone-900 mb-2">No matching pieces</h4>
            <p className="text-[13px] text-stone-500 leading-relaxed font-medium">
              We couldn't find any results for your current selection. Try adjusting your search or category.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-8 text-[11px] font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1"
            >
              Reset Discovery
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import React from "react";
import { Plus, Check, ShoppingBag, Zap } from "lucide-react";
import { useCartSync } from "@/lib/useCartSync";
import { Product } from "@/lib/api";
import { useLocale } from "next-intl";

interface ProductCardProps {
  product: Product;
  variant?: "featured" | "standard";
  isLoading?: boolean;
}

export function ProductCard({ product, variant = "standard", isLoading = false }: ProductCardProps) {
  const { addItem } = useCartSync();
  const [isAdded, setIsAdded] = React.useState(false);
  const locale = useLocale();
  const isEn = locale === "en";
  const imageUrl = product.image_url || 
    (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${variant === 'featured' ? 'w-full' : 'flex flex-col'}`}>
        <div className={`bg-stone-200 rounded-[28px] mb-4 ${variant === 'featured' ? 'aspect-[4/5]' : 'aspect-square'}`} />
        <div className="space-y-2 px-2">
          <div className="h-3 bg-stone-200 rounded-full w-1/3" />
          <div className="h-5 bg-stone-200 rounded-full w-2/3" />
        </div>
      </div>
    );
  }

  // Modern Bento Grid Card Design
  return (
    <div className="group flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
      {/* Visual Container */}
      <div className="relative aspect-[3/4] bg-stone-100 rounded-[28px] overflow-hidden mb-4 shadow-sm border border-stone-200/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] translate-z-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={isEn ? (product.name_en || product.name_th) : product.name_th} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
            <Zap size={24} className="text-stone-200" />
          </div>
        )}
        
        {/* Availability Overlay */}
        {(product.inventory <= 0) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 bg-white/90 px-4 py-2 rounded-2xl shadow-sm border border-stone-200/50">
              Sold Out
            </span>
          </div>
        )}

        {/* Global Action Pill - Persistent for Mobile */}
        {product.inventory > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 z-20">
            <button 
              onClick={handleAdd}
              disabled={isAdded}
              className={`w-full h-11 rounded-[18px] flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90 border overflow-hidden ${
                isAdded 
                  ? "bg-green-500 border-green-400 text-white" 
                  : "bg-white/90 backdrop-blur-md border-white/50 text-stone-900"
              }`}
            >
              {isAdded ? (
                <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                  <Check size={18} strokeWidth={3} />
                  <span className="text-[12px] font-bold">Added</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center text-white transition-transform group-hover:rotate-90">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                  <span className="text-[12px] font-bold tracking-tight">Add to Bag</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Category Label (Glass) */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
              <span className="text-[9px] font-black text-white uppercase tracking-wider">{product.category ? (isEn ? (product.category.name_en || product.category.name_th) : product.category.name_th) : "Curated"}</span>
           </div>
        </div>
      </div>
      
      {/* Info Container */}
      <div className="px-1.5">
        <h3 className="text-[15px] font-bold text-stone-900 leading-snug mb-0.5 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {isEn ? (product.name_en || product.name_th) : product.name_th}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[16px] font-black text-stone-900 font-outfit">฿{product.price.toLocaleString()}</span>
          {product.category && (
            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide truncate">
              • {isEn ? (product.category.name_en || product.category.name_th) : product.category.name_th}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

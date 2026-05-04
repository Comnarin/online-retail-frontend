"use client";

import React from "react";
import { X, LogOut, ShoppingBag, User, Settings, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";

interface LiffSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  shopName: string;
}

export function LiffSidebar({ isOpen, onClose, categories, shopName }: LiffSidebarProps) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const isEn = locale === "en";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] isolate">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Sidebar Content */}
      <div className="absolute top-0 left-0 h-screen w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-500 ease-out-expo flex flex-col">
        {/* Header */}
        <div className="px-6 py-8 border-b border-stone-100 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-xl">
              {shopName.charAt(0)}
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight">{shopName}</h2>
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Official Store</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="mb-8">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Discovery</h3>
            <nav className="space-y-1">
              <Link 
                href="/liff/shop" 
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  pathname === "/liff/shop" ? "bg-primary-light text-primary font-bold" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <ShoppingBag size={20} />
                <span className="text-sm">{tNav("shop")}</span>
              </Link>
              <Link 
                href="/liff/profile" 
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  pathname === "/liff/profile" ? "bg-primary-light text-primary font-bold" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <User size={20} />
                <span className="text-sm">{tNav("profile")}</span>
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Categories</h3>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/liff/shop?category=${cat.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-stone-600 hover:bg-stone-50 transition-all group"
                >
                  <span className="text-sm">{isEn ? (cat.name_en || cat.name_th) : cat.name_th}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200 group-hover:bg-primary transition-colors" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 flex flex-col gap-4">
          <LanguageSwitcher />
           <Link 
            href="/liff/login"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="text-sm">{tAuth("logout")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

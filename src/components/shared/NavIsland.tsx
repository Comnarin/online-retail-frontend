"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { ShoppingBag, ShoppingCart, History, UserCircle } from "lucide-react";

const navItems = [
  { href: "/liff/shop",    icon: ShoppingBag, label: "Shop" },
  { href: "/liff/cart",    icon: ShoppingCart, label: "Cart" },
  { href: "/liff/orders",  icon: History,     label: "Orders" },
  { href: "/liff/profile", icon: UserCircle,  label: "Profile" },
];

export function NavIsland() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = getItemCount();

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px]">
      <nav className="bg-white/80 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/40 flex justify-between items-center p-1.5 isolate">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isCart = item.label === "Cart";

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`relative flex flex-col items-center justify-center h-[52px] transition-all duration-300 rounded-full ${
                isActive ? "flex-[1.5] px-4" : "flex-1"
              }`}
            >
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-full animate-in zoom-in-90 duration-300" 
                  style={{ backgroundColor: 'var(--primary)' }} 
                />
              )}
              
              <div className="relative flex items-center gap-2">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className="transition-colors duration-300"
                  style={{ color: isActive ? 'white' : 'var(--liff-text-muted)' }}
                />
                
                {isActive && (
                  <span className="text-[12px] font-bold text-white whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {isCart && cartCount > 0 && !isActive && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center px-1 border-2 border-white animate-pulse-once">
                    {cartCount}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, Package, Layers, Truck, Users, 
  Tag, Star, Settings, LogOut, Zap, CreditCard
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard",  icon: BarChart2, label: "Dashboard"  },
  { href: "/admin/products",   icon: Package,   label: "Products"   },
  { href: "/admin/categories", icon: Layers,    label: "Categories" },
  { href: "/admin/orders",     icon: Truck,     label: "Orders"     },
  { href: "/admin/transactions", icon: CreditCard,  label: "Transactions" },
  { href: "/admin/customers",  icon: Users,     label: "Customers"  },
  { href: "/admin/coupons",    icon: Tag,       label: "Coupons"    },
  { href: "/admin/membership", icon: Star,      label: "Membership" },
  { href: "/admin/appearance", icon: Settings,  label: "Appearance" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<{role: string, tenantId: string} | null>(null);
  
  React.useEffect(() => {
    const role = document.cookie.match(/user_role=([^;]+)/)?.[1] ?? "";
    const tenantId = document.cookie.match(/tenant_id=([^;]+)/)?.[1] ?? "";
    setUser({ role, tenantId });
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; max-age=0; path=/";
    document.cookie = "user_role=; max-age=0; path=/";
    document.cookie = "tenant_id=; max-age=0; path=/";
    window.location.href = "/login";
  };

  const handlePreviewShop = () => {
    if (!user?.tenantId) return;
    window.open(`/liff/login?tenantId=${user.tenantId}`, "_blank");
  };

  return (
    <aside className="w-[248px] min-w-[248px] bg-sidebar-bg flex flex-col fixed inset-y-0 left-0 z-40 overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* Logo */}
      <div className="px-5 pt-[22px] pb-[18px] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-[14px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(232,87,42,0.35)] shrink-0">
            <Zap size={17} fill="currentColor" />
          </div>
          <div>
            <div className="font-display text-[14px] font-bold text-white tracking-[-0.2px]">Admin Panel</div>
            <div className="text-[9px] text-sidebar-muted font-semibold tracking-[0.8px] uppercase">Shop Management</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-3 flex-1">
        <div className="text-[9px] font-bold text-sidebar-muted tracking-[1px] uppercase px-5 pt-[14px] pb-1.5">Menu</div>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-[10px] px-5 py-[9px] text-[13px] font-medium relative w-full text-left transition-colors ${
                active
                  ? "text-white bg-sidebar-active before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-primary before:rounded-r-[3px]"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-65 group-hover:opacity-100"}`} size={16} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Preview Shop Link */}
        {user?.tenantId && (
          <div className="px-5 mt-6">
            <Link 
              href={`/liff/login?tenantId=${user.tenantId}`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-xl font-bold text-[13px] shadow-[0_4px_12px_rgba(232,87,42,0.25)] hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              <Zap size={14} fill="currentColor" />
              <span>Preview Shop</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-[14px] pt-[10px] pb-4 border-t border-white/5">
        <div className="flex items-center gap-[10px] p-2 rounded-md cursor-pointer transition-colors hover:bg-sidebar-hover">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white shrink-0">AD</div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-[#E7E5E4] leading-[1.3] truncate">Administrator</div>
            <div className="text-[10px] text-sidebar-muted">Shop Admin</div>
          </div>
        </div>
        <button className="flex items-center gap-[10px] p-2 w-full rounded-md text-[12px] font-medium text-sidebar-muted transition-colors mt-1 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

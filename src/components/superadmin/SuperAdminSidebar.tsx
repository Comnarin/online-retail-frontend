"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Globe } from "lucide-react";

const navItems = [
  { href: "/superadmin/tenants", icon: Building2, label: "Shops", sub: "Manage Tenants" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "auth_token=; max-age=0; path=/";
    document.cookie = "user_role=; max-age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <aside className="w-[248px] min-w-[248px] bg-sidebar-bg flex flex-col fixed inset-y-0 left-0 z-40 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className="px-5 pt-[22px] pb-[18px] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-[14px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(232,87,42,0.35)] shrink-0">
            <Globe size={17} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display text-[14px] font-bold text-white tracking-[-0.2px]">Super Admin</div>
            <div className="text-[9px] text-sidebar-muted font-semibold tracking-[0.8px] uppercase">Platform Control</div>
          </div>
        </div>
      </div>

      <nav className="py-3 flex-1">
        <div className="text-[9px] font-bold text-sidebar-muted tracking-[1px] uppercase px-5 pt-[14px] pb-1.5">Navigation</div>
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
      </nav>

      <div className="px-[14px] pt-[10px] pb-4 border-t border-white/5">
        <div className="flex items-center gap-[10px] p-2 rounded-md cursor-pointer transition-colors hover:bg-sidebar-hover">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white shrink-0">SA</div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-[#E7E5E4] leading-[1.3] truncate">Super Admin</div>
            <div className="text-[10px] text-sidebar-muted">Platform Admin</div>
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

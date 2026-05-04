"use client";
import { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function TopBar() {
  const [role, setRole] = useState("admin");

  useEffect(() => {
    const roleCookie = document.cookie.match(/user_role=([^;]+)/)?.[1];
    if (roleCookie) setRole(roleCookie);
  }, []);

  const isSuperAdmin = role === "superadmin";
  const label = isSuperAdmin ? "Super Admin" : "Shop Admin";
  const initials = isSuperAdmin ? "SA" : "AD";

  return (
    <header className="flex items-center h-[54px] px-7 gap-3 bg-surface border-b border-surface-border sticky top-0 z-30 shrink-0">
      <div className="relative flex-1 max-w-[380px]">
        <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint w-[14px] height-[14px] pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          id="topbar-search-input"
          placeholder={isSuperAdmin ? "Search tenants…" : "Search products, orders…"}
          className="w-full h-8 bg-main-bg border border-surface-border rounded-full pl-[34px] pr-3 text-[13px] text-main-text outline-none transition-colors focus:border-primary placeholder:text-text-faint"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="w-[120px] shrink-0 hidden md:block mr-2">
           <LanguageSwitcher />
        </div>
        <button className="flex items-center justify-center w-8 h-8 rounded-full border border-surface-border bg-transparent text-text-muted transition-colors hover:bg-surface-hover hover:text-main-text" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-full border border-surface-border bg-transparent text-text-muted transition-colors hover:bg-surface-hover hover:text-main-text" aria-label="Settings">
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-2 pl-1 pr-2.5 py-[3px] border border-surface-border rounded-full bg-surface cursor-pointer transition-colors hover:bg-surface-hover">
          <div
            className="flex items-center justify-center shrink-0 w-[26px] h-[26px] rounded-full bg-primary text-white font-bold text-[10px]"
          >
            {initials}
          </div>
          <span className="text-[12px] font-semibold text-main-text">{label}</span>
        </div>
      </div>
    </header>
  );
}

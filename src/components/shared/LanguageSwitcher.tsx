"use client";
import React, { useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setUserLocale } from "@/app/actions/locale";

export default function LanguageSwitcher() {
  const locale = useLocale() as "th" | "en";
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const switchLocale = (next: "th" | "en") => {
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <div className="zen-modern-lang">
      <div className="pill-track">
        <div 
          className="pill-slider" 
          style={{ 
            transform: locale === "th" ? "translateX(0)" : "translateX(100%)",
            background: 'var(--primary)'
          }} 
        />
        <button 
          className={`pill-btn ${locale === "th" ? "active" : ""}`}
          onClick={() => switchLocale("th")}
        >
          TH
        </button>
        <button 
          className={`pill-btn ${locale === "en" ? "active" : ""}`}
          onClick={() => switchLocale("en")}
        >
          EN
        </button>
      </div>

      <style jsx>{`
        .zen-modern-lang {
          width: 100%;
          padding: 4px 0;
        }
        .pill-track {
          position: relative;
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          height: 30px;
          padding: 2px;
          overflow: hidden;
        }
        .pill-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          bottom: 2px;
          width: calc(50% - 2px);
          border-radius: 999px;
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          z-index: 1;
        }
        .pill-btn {
          flex: 1;
          position: relative;
          z-index: 2;
          background: transparent;
          border: none;
          color: var(--sidebar-muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: color 0.3s;
        }
        .pill-btn.active {
          color: white;
        }
        .pill-btn:hover:not(.active) {
          color: var(--sidebar-text);
        }
      `}</style>
    </div>
  );
}

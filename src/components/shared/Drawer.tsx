"use client";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "md",
}: DrawerProps) {
  if (!open) return null;

  const widthClass = size === "lg" ? "w-[640px]" : size === "sm" ? "w-[400px]" : "w-[520px]";

  return (
    <div className="fixed inset-0 bg-[#1C1917]/45 backdrop-blur-[6px] z-50 flex justify-end animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`h-full bg-surface shadow-[-20px_0_60px_rgba(0,0,0,0.12)] flex flex-col animate-in slide-in-from-right-full duration-300 overflow-hidden ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-6 border-b border-surface-border flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            {icon && <div className="w-10 h-10 rounded-[10px] bg-primary-light text-primary flex items-center justify-center shrink-0">{icon}</div>}
            <div>
              <h2 className="font-display text-[16px] font-bold text-main-text leading-[1.2]">{title}</h2>
              {subtitle && <p className="text-[12px] text-text-faint mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button className="w-8 h-8 rounded-[10px] flex items-center justify-center text-text-muted transition-colors shrink-0 hover:bg-surface-hover hover:text-main-text" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--surface-border) transparent" }}>{children}</div>

        {/* Footer */}
        {footer && <div className="px-7 py-4 border-t border-surface-border bg-surface-low flex justify-between items-center gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

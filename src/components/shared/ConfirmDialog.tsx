"use client";
import { AlertTriangle, Trash2, Info } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantIcons: Record<string, React.ReactNode> = {
  danger:  <Trash2 size={22} />,
  warning: <AlertTriangle size={22} />,
  info:    <Info size={22} />,
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-[8px] z-[60] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="bg-surface rounded-[24px] p-8 w-full max-w-[400px] shadow-xl animate-in zoom-in-95 duration-250" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 ${
          variant === "danger" ? "bg-red-bg text-red-tx" : 
          variant === "warning" ? "bg-amber-bg text-amber-tx" : 
          "bg-blue-bg text-blue-tx"
        }`}>
          {variantIcons[variant]}
        </div>
        <h3 className="font-display text-[18px] font-bold text-main-text mb-2">{title}</h3>
        <p className="text-[13px] text-text-muted leading-[1.6] mb-6">{message}</p>
        <div className="flex gap-[10px] justify-end">
          <button
            className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-text-muted outline-none hover:bg-surface-hover hover:text-main-text"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed outline-none ${
              variant === "danger" 
                ? "bg-red-bg text-red-tx hover:opacity-85" 
                : "bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

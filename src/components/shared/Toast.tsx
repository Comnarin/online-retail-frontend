"use client";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/lib/toast";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-[320px] bg-surface rounded-xl p-3.5 shadow-lg border border-surface-border flex items-start gap-3 relative pointer-events-auto transition-all ${
            t.exiting ? "animate-out fade-out slide-out-to-right-3 duration-200" : "animate-in slide-in-from-bottom-5 duration-300"
          }`}
        >
          <div className={`mt-0.5 shrink-0 ${
            t.type === "success" ? "text-green-tx" : 
            t.type === "error" ? "text-red-tx" : 
            "text-blue-tx"
          }`}>
            {icons[t.type]}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="font-display text-[13.5px] font-bold text-main-text leading-[1.2]">{t.title}</div>
            {t.message && <div className="text-[12px] text-text-muted mt-1 leading-snug">{t.message}</div>}
          </div>
          <button className="absolute top-3 right-3 text-text-faint hover:text-main-text transition-colors" onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

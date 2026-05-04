"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { appearanceApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Paintbrush, Layout, Type, Image as ImageIcon, Zap, Tag, Star, ShoppingBag, Loader2, Rocket } from "lucide-react";

const FONT_OPTIONS = ["Plus Jakarta Sans", "Inter", "Outfit", "Poppins", "DM Sans"];

interface AppearanceConfig {
  brand_name: string;
  primary_color: string;
  logo_url: string;
  theme?: string;
  shop_title: string;
  shop_description: string;
  shop_hero_url: string;
}

export default function AppearancePage() {
  const [config, setConfig] = useState<AppearanceConfig>({
    brand_name: "My Store",
    primary_color: "#E8572A",
    logo_url: "",
    shop_title: "",
    shop_description: "",
    shop_hero_url: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["appearance"],
    queryFn: async () => (await appearanceApi.get()).data,
  });

  useEffect(() => { 
    if (data) {
      setConfig((p) => ({ 
        ...p, 
        brand_name: data.name,
        ...data.appearance 
      })); 
    } 
  }, [data]);

  const mutation = useMutation({
    mutationFn: (d: AppearanceConfig) => {
      if (!data) throw new Error("No data found");
      const payload = {
        name: d.brand_name,
        order_code: data.order_code || "ORD",
        appearance: {
          logo_url: d.logo_url,
          primary_color: d.primary_color,
          banner_url: "",
          theme: d.theme || "default",
          shop_title: d.shop_title,
          shop_description: d.shop_description,
          shop_hero_url: d.shop_hero_url,
        },
        features: data.features
      };
      return appearanceApi.update(payload);
    },
    onSuccess: () => toast.success("Appearance saved", "Your changes are now live."),
    onError: (err: any) => toast.error("Failed to save", err.response?.data?.message || err.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-text-muted">Loading aesthetic settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Store Identity</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Manage your brand's visual presence and discovery</p>
        </div>
        <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => mutation.mutate(config)} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-7 items-start">
        {/* Settings Panel */}
        <div className="w-full xl:w-[440px] flex flex-col gap-5">
          {/* Shop Configuration */}
          <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <ShoppingBag size={80} strokeWidth={1} />
            </div>

            <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-5 flex items-center gap-1.5">
              <ShoppingBag size={13} /> Shop Discovery & Identity
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Store Name</label>
              <input 
                className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-bold text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
                value={config.brand_name} 
                onChange={e => setConfig({ ...config, brand_name: e.target.value })} 
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Brand Color</label>
              <div className="flex gap-3 items-center p-2.5 bg-main-bg rounded-md border border-surface-border focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-light)] transition-colors">
                <input type="color" className="w-9 h-9 p-0 border-none bg-transparent cursor-pointer rounded shrink-0 overflow-hidden"
                  value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} />
                <input className="bg-transparent border-none outline-none font-mono font-bold text-[14px] text-main-text uppercase flex-1"
                  value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Logo URL</label>
              <div className="relative">
                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input 
                  className="w-full h-10 bg-surface border border-surface-border rounded-md pl-[34px] pr-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
                  placeholder="https://…" 
                  value={config.logo_url} 
                  onChange={e => setConfig({ ...config, logo_url: e.target.value })} 
                />
              </div>
            </div>

            <hr className="border-t border-surface-border my-5" />

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Hero Title</label>
              <input 
                className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-bold text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
                placeholder="The New Elite"
                value={config.shop_title} 
                onChange={e => setConfig({ ...config, shop_title: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Hero Description</label>
              <textarea 
                className="w-full min-h-[80px] bg-surface border border-surface-border rounded-md p-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint resize-none" 
                placeholder="Experience luxury through our pieces..."
                value={config.shop_description} 
                onChange={e => setConfig({ ...config, shop_description: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Hero Banner Image URL</label>
              <div className="relative">
                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input 
                  className="w-full h-10 bg-surface border border-surface-border rounded-md pl-[34px] pr-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
                  placeholder="https://images.unsplash.com/..." 
                  value={config.shop_hero_url} 
                  onChange={e => setConfig({ ...config, shop_hero_url: e.target.value })} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 w-full max-w-[360px] mx-auto xl:max-w-none xl:sticky xl:top-5">
          <div className="flex justify-between items-center mb-4 max-w-[360px] mx-auto">
            <span className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px]">Live Preview</span>
            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] bg-green-bg text-green-tx">
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              Live
            </span>
          </div>

          <div className="w-full max-w-[360px] mx-auto bg-[#1C1917] rounded-[48px] p-[10px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
            <div className="bg-[#FDFCF9] rounded-[38px] overflow-hidden max-h-[700px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {/* Mock header */}
              <div className="px-5 pt-9 pb-3.5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-black/5">
                <span className="font-extrabold text-[14px] text-[#1C1917]">{config.brand_name || "My Store"}</span>
                <ShoppingBag size={17} className="text-[#1C1917]" />
              </div>
              {/* Mock hero */}
              <div className="p-4">
                <div className="rounded-[28px] p-8 text-white mb-4 relative overflow-hidden flex flex-col justify-end min-h-[160px]">
                  {config.shop_hero_url ? (
                    <img src={config.shop_hero_url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${config.primary_color}EE, ${config.primary_color})` }} />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10">
                    <div className="text-[9px] font-bold opacity-80 uppercase tracking-[1px] mb-1.5">Collection</div>
                    <div className="text-[20px] font-extrabold pb-0.5 leading-tight tracking-tight line-clamp-2">
                      {config.shop_title || "Featured"}
                    </div>
                    {config.shop_description && (
                      <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-relaxed">{config.shop_description}</p>
                    )}
                    <button className="mt-3 px-4 py-2 bg-white text-[#1C1917] rounded-full text-[8px] font-extrabold tracking-[1px] uppercase border-none cursor-pointer">Explore</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {["Sample Item", "Another Item"].map((n, i) => (
                    <div key={i} className="bg-white rounded-[18px] p-3 border border-black/5 shadow-sm">
                      <div className="aspect-square rounded-[12px] bg-[#F3F4F6] mb-2" />
                      <div className="text-[10px] font-bold text-[#1C1917] mb-[2px]">{n}</div>
                      <div className="text-[10px] font-medium text-[#9CA3AF]">฿1,250</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, label, desc, active, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-surface-border rounded-xl transition-all hover:border-primary-light hover:shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-surface-low text-text-faint flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <div className="text-[13px] font-semibold text-main-text">{label}</div>
          <div className="text-[12px] text-text-faint mt-0.5">{desc}</div>
        </div>
      </div>
      <button 
        className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--primary-light)] ${active ? "bg-primary" : "bg-surface-border"}`} 
        onClick={onToggle} 
        aria-label={label}
      >
        <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? "translate-x-[18px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

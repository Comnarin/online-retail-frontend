"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appearanceApi, couponsApi, membershipApi, Coupon, TenantFeatures, MembershipTier } from "@/lib/api";
import { toast } from "@/lib/toast";
import EmptyState from "@/components/shared/EmptyState";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Tag, Plus, Search, Trash2, ToggleLeft, ToggleRight, Loader2, Ticket } from "lucide-react";

const TABS = ["all", "active", "paused"];

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState("all");
  const [coupon, setCoupon]     = useState<Partial<Coupon> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data: appearanceData, isLoading: isLoadingAppearance } = useQuery({
    queryKey: ["appearance"],
    queryFn: async () => (await appearanceApi.get()).data,
  });

  const { data: couponsData, isLoading: isLoadingCoupons, error } = useQuery({
    queryKey: ["coupons", search],
    queryFn: async () => await couponsApi.list({ search }),
  });
  const allCoupons = couponsData?.data || [];
  const coupons = tab === "all" ? allCoupons : allCoupons.filter((c: Coupon) => tab === "active" ? c.is_active : !c.is_active);

  const { data: tiersData } = useQuery({
    queryKey: ["membership-tiers"],
    queryFn: async () => await membershipApi.listTiers(),
  });
  const tiers = tiersData?.data || [];

  const saveFeaturesMutation = useMutation({
    mutationFn: (features: TenantFeatures) => {
      if (!appearanceData) throw new Error("No data found");
      return appearanceApi.update({
        name: appearanceData.name,
        order_code: appearanceData.order_code || "ORD",
        appearance: appearanceData.appearance,
        features: features,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appearance"] });
      toast.success("Coupon system updated");
    },
    onError: (err: any) => toast.error("Failed to update settings", err.response?.data?.message || err.message),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: Partial<Coupon>) => coupon?.id ? couponsApi.update(coupon.id, data) : couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success(coupon?.id ? "Coupon updated" : "Coupon created");
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to save coupon", err.response?.data?.message || err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => couponsApi.toggle(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["coupons"] }); toast.success("Coupon status toggled"); },
    onError: (err: any) => toast.error("Failed to toggle", err.response?.data?.message || err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      closeDrawer();
    },
    onError: (err: any) => { toast.error("Failed to delete", err.response?.data?.message || err.message); setDeleteTarget(null); },
  });

  const openDrawer = (c: Coupon | null = null) => {
    setCoupon(c || { code: "", description: "", discount_type: "percent", discount_value: 0, min_order_value: 0, max_discount: 0, usage_limit: 0, start_date: new Date().toISOString().split('T')[0], end_date: null, is_active: true, tier_id: null });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setCoupon(null); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (coupon) upsertMutation.mutate(coupon); };

  return (
    <>
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pl-[34px] text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Search coupon codes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="inline-flex p-[3px] bg-surface-low rounded-[8px] overflow-x-auto max-w-max">
          {TABS.map(t => (
            <button key={t} className={`px-3 py-1.5 rounded-[6px] text-[12.5px] font-semibold transition-all whitespace-nowrap ${tab === t ? "bg-surface text-main-text shadow-xs" : "bg-transparent text-text-faint hover:text-main-text"}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4"><span>Failed to load coupons. Please try again.</span></div>}

      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: "30%" }}>Code</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Discount</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Usage</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Min. Order</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Expiry</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Status</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {isLoadingCoupons
              ? Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={7} className="px-5 py-[14px]"><div className="animate-pulse bg-surface-border rounded-md h-5" /></td></tr>
                ))
              : coupons.length === 0
              ? (
                <tr className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={7} className="px-5 py-[14px] border-none">
                  <EmptyState icon={Tag} title="No coupons" description="Create your first coupon to start offering promotions."
                    action={<button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => openDrawer()}><Plus size={15} /> Create Coupon</button>} />
                </td></tr>
              )
              : coupons.map((c: Coupon) => (
                <tr key={c.id} onClick={() => openDrawer(c)} className="transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse" style={{ opacity: c.is_active ? 1 : 0.55 }}>
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-md bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary overflow-hidden shrink-0">
                        <Ticket size={14} />
                      </div>
                      <div>
                        <div className="font-extrabold uppercase tracking-[0.5px] text-main-text">{c.code}</div>
                        <div className="text-[11px] text-text-faint">{c.description || "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold text-[13px] px-5 py-[14px] align-middle text-main-text">
                    {c.discount_type === "percent" ? `${c.discount_value}%` : `฿${c.discount_value}`}
                    <span className="text-[11px] text-text-faint ml-1">OFF</span>
                  </td>
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-main-text text-[13px]">{c.used_count}</span>
                       {c.usage_limit > 0 ? (
                         <>
                           <span className="text-[11px] text-text-faint">/ {c.usage_limit}</span>
                           <div className="h-1.5 w-10 bg-surface-border rounded-full overflow-hidden shrink-0">
                             <div className="h-full rounded-full transition-all duration-300 bg-primary" style={{ width: `${Math.min((c.used_count / c.usage_limit) * 100, 100)}%` }} />
                           </div>
                         </>
                       ) : <span className="text-[11px] text-text-faint">∞</span>}
                    </div>
                  </td>
                   <td className="text-[13px] text-text-muted px-5 py-[14px] align-middle">{c.min_order_value ? `฿${c.min_order_value.toLocaleString()}` : "None"}</td>
                   <td className="text-[12px] text-text-muted px-5 py-[14px] align-middle">{c.end_date ? new Date(c.end_date).toLocaleDateString() : "No expiry"}</td>
                  <td className="px-5 py-[14px] align-middle"><span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] ${c.is_active ? "bg-green-bg text-green-tx" : "bg-gray-bg text-gray-tx"}`}>{c.is_active ? "Active" : "Paused"}</span></td>
                  <td className="px-5 py-[14px] align-middle"><Tag size={14} className="text-text-faint" /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={coupon?.id ? "Edit Coupon" : "Create Coupon"} subtitle="Coupon details" icon={<Tag size={18} />}
        footer={
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {coupon?.id && <button type="button" className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-red-bg text-red-tx hover:opacity-85" onClick={() => setDeleteTarget(coupon as Coupon)}><Trash2 size={15} /></button>}
              {coupon?.id && (
                <button type="button" className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-surface-low text-main-text hover:bg-surface-hover hover:shadow-xs border border-surface-border" onClick={() => toggleMutation.mutate(coupon.id!)} disabled={toggleMutation.isPending}>
                  {coupon.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  {coupon.is_active ? "Pause" : "Activate"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Cancel</button>
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={handleSubmit} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : coupon?.id ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Coupon Code</label>
            <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-extrabold text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none uppercase tracking-[1px]" placeholder="e.g. SUMMER20"
              value={coupon?.code || ""} onChange={e => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} required />
          </div>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Description</label>
            <textarea className="w-full bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none h-auto py-2.5 resize-y min-h-[80px]" placeholder="Describe this offer…" value={coupon?.description || ""} onChange={e => setCoupon({ ...coupon, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Discount Type</label>
              <select className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none cursor-pointer" value={coupon?.discount_type || "percent"} onChange={e => setCoupon({ ...coupon, discount_type: e.target.value as any })}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (฿)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Discount Value</label>
              <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0" value={coupon?.discount_value || 0} onChange={e => setCoupon({ ...coupon, discount_value: Number(e.target.value) })} required />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
             <div className="flex flex-col gap-1.5 last:mb-0">
               <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Max Discount (฿)</label>
               <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="No limit" value={coupon?.max_discount || ""} onChange={e => setCoupon({ ...coupon, max_discount: Number(e.target.value) })} />
             </div>
             <div className="flex flex-col gap-1.5 last:mb-0">
               <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Min. Order (฿)</label>
               <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0" value={coupon?.min_order_value || 0} onChange={e => setCoupon({ ...coupon, min_order_value: Number(e.target.value) })} />
             </div>
           </div>
           
           <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
             <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Membership Restriction</label>
             <select className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none cursor-pointer" value={coupon?.tier_id || ""} onChange={e => setCoupon({ ...coupon, tier_id: e.target.value || null })}>
               <option value="">Any Tier (No Restriction)</option>
               {tiers.map((t: any) => (
                 <option key={t.id} value={t.id}>{t.name} Member</option>
               ))}
             </select>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
             <div className="flex flex-col gap-1.5 last:mb-0">
               <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Start Date</label>
               <input type="date" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" value={coupon?.start_date ? new Date(coupon.start_date).toISOString().split("T")[0] : ""}
                 onChange={e => setCoupon({ ...coupon, start_date: e.target.value })} />
             </div>
             <div className="flex flex-col gap-1.5 last:mb-0">
               <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Expiry Date</label>
               <input type="date" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" value={coupon?.end_date ? new Date(coupon.end_date).toISOString().split("T")[0] : ""}
                 onChange={e => setCoupon({ ...coupon, end_date: e.target.value || null })} />
             </div>
           </div>

           <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
             <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Usage Limit</label>
             <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Unlimited" value={coupon?.usage_limit || ""} onChange={e => setCoupon({ ...coupon, usage_limit: e.target.value ? Number(e.target.value) : 0 })} />
           </div>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Status</label>
            <div className="flex gap-2">
              <button type="button" className={`flex-1 p-[10px] rounded-md text-[12px] font-bold border cursor-pointer transition-all ${coupon?.is_active ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-surface-border'}`}
                onClick={() => setCoupon({ ...coupon, is_active: true })}>Active</button>
              <button type="button" className={`flex-1 p-[10px] rounded-md text-[12px] font-bold border cursor-pointer transition-all ${!coupon?.is_active ? 'bg-text text-white border-text' : 'bg-surface text-text-muted border-surface-border'}`}
                onClick={() => setCoupon({ ...coupon, is_active: false })}>Paused</button>
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog open={!!deleteTarget} title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deleteTarget?.code}"? This cannot be undone.`}
        confirmLabel="Delete Coupon" variant="danger" loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)} />
    </>
  );
}

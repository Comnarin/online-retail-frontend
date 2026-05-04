"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appearanceApi, membershipApi, MembershipTier, TenantFeatures, PointTransaction } from "@/lib/api";
import { toast } from "@/lib/toast";
import EmptyState from "@/components/shared/EmptyState";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Star, Plus, Trash2, Loader2, Crown, Sparkles, Zap, History, ShieldCheck, ChevronRight } from "lucide-react";

const PRESET_COLORS = ["#E8572A", "#1C1917", "#2563EB", "#059669", "#7C3AED", "#DB2777", "#F59E0B"];

export default function MembershipPage() {
  const queryClient = useQueryClient();
  const [tier, setTier]         = useState<Partial<MembershipTier> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MembershipTier | null>(null);

  // Feature Settings State
  const { data: appearanceData, isLoading: isLoadingAppearance } = useQuery({
    queryKey: ["appearance"],
    queryFn: async () => (await appearanceApi.get()).data,
  });

  const { data: tiers, isLoading: isLoadingTiers, error } = useQuery({
    queryKey: ["membership-tiers"],
    queryFn: async () => (await membershipApi.listTiers()).data,
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["point-transactions"],
    queryFn: async () => (await membershipApi.listTransactions({ limit: 5 })).data,
    enabled: !!appearanceData?.features?.enable_points,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: Partial<MembershipTier>) => tier?.id ? membershipApi.updateTier(tier.id, data) : membershipApi.createTier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
      toast.success(tier?.id ? "Tier updated" : "Tier created");
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to save tier", err.response?.data?.message || err.message),
  });

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
      toast.success("Settings updated");
    },
    onError: (err: any) => toast.error("Failed to update settings", err.response?.data?.message || err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membershipApi.deleteTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
      toast.success("Tier deleted");
      setDeleteTarget(null);
      closeDrawer();
    },
    onError: (err: any) => { 
      toast.error("Failed to delete", err.response?.data?.message || err.message); 
      setDeleteTarget(null); 
    },
  });

  const openDrawer  = (t: MembershipTier | null = null) => { 
    if (!appearanceData?.features?.enable_membership) return;
    setTier(t || { name: "", min_points: 0, discount_rate: 0, color: "#E8572A", level: (tiers?.length || 0) + 1 }); 
    setDrawerOpen(true); 
  };
  const closeDrawer = () => { setDrawerOpen(false); setTier(null); };
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (tier) upsertMutation.mutate(tier); 
  };

  const isEnabled = appearanceData?.features?.enable_membership;
  const isPointsEnabled = appearanceData?.features?.enable_points;

  if (isLoadingAppearance || isLoadingTiers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-text-muted">Loading privileges...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header with Switch */}
      <div className="flex items-start justify-between gap-4 mb-7 bg-surface border border-surface-border rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Privilege Suite</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Manage membership tiers and loyalty systems</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[12px] font-bold uppercase tracking-[0.5px] ${isEnabled ? "text-primary" : "text-text-faint"}`}>
            {isEnabled ? "Active" : "Inactive"}
          </span>
          <button 
            className={`w-12 h-6.5 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 ${isEnabled ? "bg-primary" : "bg-surface-border"}`} 
            onClick={() => appearanceData && saveFeaturesMutation.mutate({ ...appearanceData.features, enable_membership: !isEnabled })}
            disabled={saveFeaturesMutation.isPending}
          >
            <span className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isEnabled ? "translate-x-5.5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-7 transition-all duration-500 ${!isEnabled ? "opacity-40 grayscale pointer-events-none select-none" : ""}`}>
        {/* Left: Tiers List */}
        <div className="xl:col-span-8 flex flex-col gap-7">
          <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-primary" />
                <h2 className="text-[15px] font-bold text-main-text">Membership Tiers</h2>
              </div>
              <button 
                className="inline-flex items-center gap-[6px] px-3.5 py-1.5 rounded-md text-[12px] font-bold transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover shadow-sm"
                onClick={() => openDrawer()}
              >
                <Plus size={14} /> Add Tier
              </button>
            </div>
            
            <table className="w-full border-collapse">
              <thead className="bg-surface-low">
                <tr>
                  <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left border-b border-surface-border">Tier</th>
                  <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left border-b border-surface-border">Points</th>
                  <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left border-b border-surface-border">Benefit</th>
                  <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left border-b border-surface-border text-center" style={{ width: 48 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {!tiers?.length ? (
                  <tr><td colSpan={4} className="py-20"><EmptyState icon={Star} title="No Tiers Defined" description="Add membership levels to incentivize repeat purchases." /></td></tr>
                ) : tiers.map((t: MembershipTier) => (
                  <tr key={t.id} onClick={() => openDrawer(t)} className="group transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: t.color || 'var(--primary)' }}>
                          <Crown size={16} />
                        </div>
                        <div className="text-[14px] font-bold text-main-text">{t.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-bold text-main-text">{t.min_points?.toLocaleString()} <span className="text-[11px] text-text-faint font-medium ml-0.5">PTS</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-bg text-amber-tx">
                        <Sparkles size={11} /> {t.discount_rate}% Discount
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-tx animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Points History */}
          <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-text-faint" />
                <h2 className="text-[15px] font-bold text-main-text">Recent Point Transactions</h2>
              </div>
            </div>
            {!isPointsEnabled ? (
              <div className="p-12 text-center bg-surface-low/30">
                <Zap size={24} className="mx-auto text-text-faint mb-3 opacity-20" />
                <p className="text-[13px] text-text-faint">Points system is currently disabled.</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-surface-low/50">
                  <tr>
                    <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left">Activity</th>
                    <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-left">Points</th>
                    <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!transactionsData?.length ? (
                    <tr><td colSpan={3} className="py-12 text-center text-[13px] text-text-faint">No transactions tracked yet.</td></tr>
                  ) : transactionsData.map((tx: PointTransaction) => (
                    <tr key={tx.id} className="border-b border-surface-border last:border-0">
                      <td className="px-6 py-4 font-medium text-[13px] text-main-text">{tx.description}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[13px] font-extrabold ${tx.type === 'earn' ? 'text-green-tx' : 'text-red-tx'}`}>
                          {tx.type === 'earn' ? '+' : ''}{tx.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[12px] text-text-faint">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Privilege Settings */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={18} className="text-primary" />
              <h3 className="text-[15px] font-bold text-main-text">Privilege Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Point Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-main-text">Loyalty Points</div>
                  <div className="text-[11px] text-text-faint mt-0.5">Enable points on every purchase</div>
                </div>
                <button 
                  className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${isPointsEnabled ? "bg-primary" : "bg-surface-border"}`} 
                  onClick={() => appearanceData && saveFeaturesMutation.mutate({ ...appearanceData.features, enable_points: !isPointsEnabled })}
                >
                  <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 shadow-sm ${isPointsEnabled ? "translate-x-[18px]" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Point Rate */}
              <div className={`transition-all duration-300 ${!isPointsEnabled ? "opacity-30 pointer-events-none grayscale" : ""}`}>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-2">Point Exchange Rate</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-surface-low border border-surface-border rounded-xl px-4 py-2.5 focus-within:border-primary transition-all">
                    <span className="text-[13px] font-bold text-text-faint mr-2">฿</span>
                    <input 
                      type="number"
                      className="bg-transparent border-none outline-none text-[14px] font-extrabold text-main-text w-full"
                      value={appearanceData?.features?.point_exchange_rate || 100}
                      onChange={(e) => appearanceData && saveFeaturesMutation.mutate({ ...appearanceData.features, point_exchange_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="text-[14px] font-bold text-text-faint">=</div>
                  <div className="flex-1 bg-surface-low border border-surface-border rounded-xl px-4 py-2.5">
                    <span className="text-[14px] font-extrabold text-main-text">1</span>
                    <span className="text-[11px] font-bold text-text-faint ml-1.5 uppercase tracking-wide">PTS</span>
                  </div>
                </div>
                <p className="text-[11px] text-text-faint italic mt-2.5 px-1 leading-relaxed">
                  Recommended: ฿100 = 1 Point. 1 Point = ฿1 during checkout redemption.
                </p>
              </div>

              <hr className="border-t border-surface-border" />

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                < Crown size={18} className="text-primary mb-2" />
                <div className="text-[13px] font-bold text-main-text mb-1">Tier Progression</div>
                <p className="text-[12px] text-text-muted leading-relaxed opacity-80">
                  Customers are automatically upgraded when their points cross the next tier threshold. No manual action required.
                </p>
              </div>
            </div>
          </div>

          {/* Tutorial / Help */}
          <div className="bg-main-bg border border-surface-border rounded-2xl p-6">
            <div className="text-[13px] font-bold text-main-text mb-3">Loyalty Strategy</div>
            <div className="space-y-3">
              {[
                "Increase retention with tiered rewards",
                "Higher tiers unlock exclusive benefits",
                "Encourage spending to hit point targets"
              ].map(item => (
                <div key={item} className="flex gap-2.5 text-[12px] text-text-muted">
                  <div className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-[12px] font-bold text-primary flex items-center justify-center gap-1.5 hover:underline transition-all">
              Learn more about Loyalty <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={tier?.id ? "Edit Tier" : "Add Tier"} subtitle="Membership tier settings" icon={<Star size={18} />}
        footer={
          <div className="flex justify-between w-full">
            <div>{tier?.id && <button type="button" className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-red-bg text-red-tx hover:opacity-85" onClick={() => setDeleteTarget(tier as MembershipTier)}><Trash2 size={15} /> Delete</button>}</div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Cancel</button>
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => tier && upsertMutation.mutate(tier)} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : tier?.id ? "Save Changes" : "Create Tier"}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Tier Name</label>
            <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="e.g. Gold, Platinum" value={tier?.name || ""} onChange={e => setTier({ ...tier, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Points Required</label>
              <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0" value={tier?.min_points || 0} onChange={e => setTier({ ...tier, min_points: Number(e.target.value) })} required />
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Discount Rate (%)</label>
              <input type="number" step="0.1" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0.0" value={tier?.discount_rate || 0} onChange={e => setTier({ ...tier, discount_rate: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Tier Color</label>
            <div className="flex gap-2.5 items-center p-3 bg-main-bg rounded-md border border-surface-border">
              <div className="w-10 h-10 rounded-md shadow-sm shadow-black/15 shrink-0" style={{ background: tier?.color }} />
              <div className="flex-1 flex gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" className="w-7 h-7 rounded-full cursor-pointer shadow-sm shadow-black/20 transition-transform" style={{ background: c, border: tier?.color === c ? "3px solid var(--text)" : "2px solid white", transform: tier?.color === c ? "scale(1.2)" : "scale(1)" }}
                    onClick={() => setTier({ ...tier, color: c })} />
                ))}
                <input type="color" className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer rounded-full"
                  value={tier?.color || "#E8572A"} onChange={e => setTier({ ...tier, color: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="bg-primary-light rounded-lg px-4 py-3.5 text-primary">
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] mb-1.5 flex items-center gap-1.5">
              <Crown size={12} /> Perk Summary
            </div>
            <p className="text-[13px] text-text-muted leading-[1.6]">
              Customers at <strong className="text-main-text font-bold">&ldquo;{tier?.name || "New Tier"}&rdquo;</strong> get a <strong className="text-main-text font-bold">{tier?.discount_rate}% discount</strong> on all purchases.
            </p>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog open={!!deleteTarget} title="Delete Tier"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" tier? Customers in this tier will be unassigned.`}
        confirmLabel="Delete Tier" variant="danger" loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

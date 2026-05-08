"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Building2, Users, Shield, Trash, Loader2, Globe, X, Layers, Zap } from "lucide-react";
import { tenantsApi, Tenant, User as Admin, TenantFeatures } from "@/lib/api";
import { toast } from "@/lib/toast";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";

const featureList = [
  { key: "enable_membership", label: "Membership", desc: "Loyalty tiers and rewards" },
  { key: "enable_coupons",     label: "Coupons",    desc: "Promotional discount codes" },
  { key: "enable_points",     label: "Points",     desc: "Earn & redeem points" },
  { key: "enable_reviews",    label: "Reviews",    desc: "Customer product reviews" },
  { key: "enable_delivery",   label: "Delivery",   desc: "Delivery management" },
];

export default function SuperAdminTenantsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch]           = useState("");
  const [tenant, setTenant]           = useState<Tenant | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const [step, setStep]               = useState(1);
  const [newTenant, setNewTenant]     = useState({ name: "" });
  const [newAdmin, setNewAdmin]       = useState({ name: "", email: "", password: "" });
  const [newTenantId, setNewTenantId] = useState<string | null>(null);
  const [addAdminForm, setAddAdminForm] = useState({ name: "", email: "", password: "" });
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<Admin | null>(null);

  const { data: tenantsRes, isLoading, error } = useQuery({
    queryKey: ["tenants", search],
    queryFn: () => tenantsApi.list({ search }),
  });
  const tenants: Tenant[] = tenantsRes?.data || [];

  const { data: adminsRes, isLoading: loadingAdmins } = useQuery({
    queryKey: ["tenant-admins", tenant?.id],
    queryFn: () => tenantsApi.listAdmins(tenant!.id),
    enabled: !!tenant,
  });
  const admins: Admin[] = adminsRes?.data?.data || [];

  const createTenantMutation = useMutation({
    mutationFn: (data: typeof newTenant) => tenantsApi.create({ ...data, features: { enable_membership: false, enable_coupons: false, enable_points: false, enable_reviews: false, enable_delivery: false, point_exchange_rate: 0 } }),
    onSuccess: (res) => { setNewTenantId(res.data.id); setStep(2); toast.success("Shop created", "Now add the first admin."); },
    onError: (err: any) => toast.error("Failed to create shop", err.response?.data?.message || err.message),
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: typeof newAdmin) => tenantsApi.createAdmin(newTenantId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenants"] }); toast.success("Shop setup complete!"); resetCreate(); },
    onError: (err: any) => toast.error("Failed to create admin", err.response?.data?.message || err.message),
  });

  const addAdminMutation = useMutation({
    mutationFn: (data: typeof addAdminForm) => tenantsApi.createAdmin(tenant!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-admins", tenant?.id] }); setAddAdminForm({ name: "", email: "", password: "" }); toast.success("Admin added"); },
    onError: (err: any) => toast.error("Failed to add admin", err.response?.data?.message || err.message),
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.removeAdmin(tenant!.id, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-admins", tenant?.id] }); setDeleteAdminTarget(null); toast.success("Admin removed"); },
    onError: (err: any) => { toast.error("Failed to remove admin", err.response?.data?.message || err.message); setDeleteAdminTarget(null); },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: (features: TenantFeatures) => tenantsApi.updateFeatures(tenant!.id, features),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenants"] }); toast.success("Feature updated"); },
    onError: (err: any) => toast.error("Failed to update feature", err.response?.data?.message || err.message),
  });

  const openDrawer = (t: Tenant) => { setTenant(t); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setTenant(null); };
  const resetCreate = () => { setCreateOpen(false); setStep(1); setNewTenant({ name: "" }); setNewAdmin({ name: "", email: "", password: "" }); setNewTenantId(null); };
  const handleToggle = (key: keyof TenantFeatures) => {
    if (!tenant) return;
    const next = { ...tenant.features, [key]: !tenant.features[key] };
    setTenant({ ...tenant, features: next });
    toggleFeatureMutation.mutate(next);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Shop Management</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Manage all shops, features, and admin users</p>
        </div>
        <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add New Shop
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xs flex flex-col items-start transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-light text-primary mb-4 shrink-0">
            <Building2 size={18} />
          </div>
          <div className="font-display text-[32px] font-extrabold text-main-text leading-[1] tracking-[-0.5px] mb-1">{tenants.length}</div>
          <div className="text-[12px] font-semibold text-text-faint uppercase tracking-[0.5px]">Total Shops</div>
        </div>
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xs flex flex-col items-start transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-light text-primary mb-4 shrink-0">
            <Zap size={18} />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <div className="font-display text-[32px] font-extrabold text-main-text leading-[1] tracking-[-0.5px]">99.9</div>
            <span className="font-display text-[20px] font-bold text-main-text">%</span>
          </div>
          <div className="text-[12px] font-semibold text-text-faint uppercase tracking-[0.5px]">System Uptime</div>
        </div>
        <div className="bg-text rounded-[var(--r-xl)] p-6 text-white shadow-xs flex flex-col items-start transition-shadow hover:shadow-sm relative overflow-hidden">
          <div className="absolute -right-5 -bottom-5 text-white/5 pointer-events-none">
            <Globe size={140} strokeWidth={0.5} />
          </div>
          <Layers className="text-primary mb-4 shrink-0" size={22} />
          <div className="font-bold text-white text-[14px] leading-relaxed">Multi-tenant<br />Platform Active</div>
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] bg-green-bg text-green-tx">
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />Live
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface border border-surface-border rounded-xl p-2.5 mb-6 shadow-xs">
        <div className="relative w-full max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-[34px] bg-main-bg border border-surface-border rounded-md pl-9 pr-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint" placeholder="Search shops…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4"><span>Failed to load shops. Please try again.</span></div>}

      {/* Table */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Shop</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Status</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Features</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Created</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={5} className="px-5 py-[14px] border-none"><div className="animate-pulse bg-surface-border rounded-md h-5" /></td></tr>
                ))
              : tenants.length === 0
              ? (
                <tr className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={5} className="px-5 py-[14px] border-none">
                  <EmptyState icon={Building2} title="No shops yet" description="Add your first shop to get started."
                    action={<button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => setCreateOpen(true)}><Plus size={15} /> Add Shop</button>} />
                </td></tr>
              )
              : tenants.map(t => (
                <tr key={t.id} onClick={() => openDrawer(t)} className={`transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse ${tenant?.id === t.id ? "bg-surface-low" : ""}`}>
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-md bg-surface-border text-main-text flex items-center justify-center font-extrabold text-[12px] uppercase shrink-0">{t.name.slice(0, 1)}</div>
                      <div>
                        <div className="text-[13px] font-semibold text-main-text leading-[1.3]">{t.name}</div>
                        <div className="flex items-center mt-0.5">
                          <span className="text-[10px] font-mono text-text-muted bg-main-bg border border-surface-border px-1 py-[2px] rounded leading-none truncate max-w-[120px]" title={t.id}>{t.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-[14px] align-middle">
                    <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] ${t.status === 'active' ? "bg-green-bg text-green-tx" : "bg-red-bg text-red-tx"}`}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: t.status === 'active' ? "var(--green-tx)" : "var(--red-tx)" }} />
                      {t.status === 'active' ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2">
                      {Object.values(t.features).map((on, idx) => (
                        <div key={idx} className="w-2 h-2 rounded-full" style={{ background: on ? "var(--primary)" : "var(--surface-border)" }} />
                      ))}
                      <span className="text-[11px] text-text-faint ml-1">
                        {Object.values(t.features).filter(f => f).length}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-[14px] align-middle font-mono text-[12px] text-text-faint">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-[14px] align-middle"><Shield size={14} className="text-text-faint" /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Shop Detail Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={tenant?.name || "Shop"} subtitle={tenant ? "Shop Details" : ""} icon={<Building2 size={18} />} size="lg"
        footer={<div className="flex justify-end w-full"><button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Close</button></div>}
      >
        {tenant && (
          <div>
            {/* Shop Info */}
            <div className="mb-6 p-4 bg-main-bg border border-surface-border rounded-[var(--r-xl)]">
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-1.5">Shop ID</div>
              <div className="font-mono text-[13px] text-main-text select-all">{tenant.id}</div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-3 flex items-center gap-1.5">
                <Shield size={12} /> Features
              </div>
              <div className="flex flex-col gap-3">
                {featureList.map(f => {
                  const enabled = tenant.features[f.key as keyof TenantFeatures];
                  return (
                    <div key={f.key} className="flex items-center justify-between p-4 bg-surface border border-surface-border rounded-[var(--r-xl)] transition-all hover:border-primary-light hover:shadow-xs cursor-pointer" onClick={() => handleToggle(f.key as keyof TenantFeatures)}>
                      <div>
                        <div className="text-[13px] font-semibold text-main-text">{f.label}</div>
                        <div className="text-[12px] text-text-faint mt-0.5">{f.desc}</div>
                      </div>
                      <button className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--primary-light)] ${enabled ? "bg-primary" : "bg-surface-border"}`}>
                        <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 shadow-sm ${enabled ? "translate-x-[18px]" : "translate-x-0"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Users */}
            <div>
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-3 flex items-center gap-1.5">
                <Users size={12} /> Admins <span className="ml-auto">{admins.length} users</span>
              </div>

              {loadingAdmins ? (
                <div className="flex justify-center p-8">
                  <Loader2 size={20} className="text-text-faint animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  {admins.map(admin => (
                    <div key={admin.id} className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-surface-border rounded-lg">
                      <div className="w-[34px] h-[34px] rounded-md bg-surface-border text-main-text flex items-center justify-center font-extrabold text-[12px] uppercase shrink-0">{admin.name.slice(0, 1)}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-[13px] text-main-text">{admin.name}</div>
                        <div className="text-[11px] text-text-faint">{admin.email}</div>
                      </div>
                      <button className="w-[30px] h-[30px] flex items-center justify-center rounded-md border border-surface-border text-red-500 bg-surface transition-colors hover:bg-red-500 hover:text-white" onClick={() => setDeleteAdminTarget(admin)}>
                        <Trash size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Admin */}
              <div className="p-5 bg-main-bg border border-dashed border-surface-border rounded-xl">
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-3">Add New Admin</div>
                <div className="flex flex-col gap-1.5 mb-4">
                  <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Full Name" value={addAdminForm.name} onChange={e => setAddAdminForm({ ...addAdminForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Email" value={addAdminForm.email} onChange={e => setAddAdminForm({ ...addAdminForm, email: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input type="password" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Password" value={addAdminForm.password} onChange={e => setAddAdminForm({ ...addAdminForm, password: e.target.value })} />
                  </div>
                </div>
                <button className="flex w-full items-center justify-center gap-[6px] px-4 py-2 mt-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-text text-white hover:bg-main-text"
                  onClick={() => addAdminMutation.mutate(addAdminForm)}
                  disabled={addAdminMutation.isPending || !addAdminForm.name || !addAdminForm.email || !addAdminForm.password}>
                  {addAdminMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Admin"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Shop Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={resetCreate}>
          <div className="bg-surface w-full max-w-[520px] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-0 flex flex-col">
              <div className="flex justify-between items-start w-full mb-6 relative">
                <div>
                  <h3 className="font-display text-[20px] font-extrabold text-main-text tracking-[-0.3px] mb-1.5">Add New Shop</h3>
                  <div className="flex items-center gap-2">
                    {[1, 2].map(s => (
                      <div key={s} className="w-7 h-1 rounded-full transition-colors duration-200" style={{ background: step >= s ? "var(--primary)" : "var(--surface-border)" }} />
                    ))}
                    <span className="text-[11px] text-text-faint ml-1.5">Step {step} of 2</span>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-low text-text-faint transition-transform hover:scale-110 active:scale-95 z-10" onClick={resetCreate}><X size={18} /></button>
              </div>

              {step === 1 ? (
                <div>
                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Shop Name</label>
                    <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="e.g. Fashion Store" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2 p-5 bg-surface-low border-t border-surface-border -mx-6 mt-2">
                    <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={resetCreate}>Cancel</button>
                    <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => createTenantMutation.mutate(newTenant as any)}
                      disabled={createTenantMutation.isPending || !newTenant.name}>
                      {createTenantMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : "Continue →"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="px-[14px] py-3 bg-primary-light rounded-md mb-5 text-[12px] text-primary font-medium">
                    Now create the first admin user for <strong className="font-bold">{newTenant.name}</strong>.
                  </div>
                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Admin Name</label>
                    <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="John Smith" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Email</label>
                      <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="admin@shop.com" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Password</label>
                      <input type="password" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="••••••••" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 p-5 bg-surface-low border-t border-surface-border -mx-6 mt-2">
                    <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={() => setStep(1)}>← Back</button>
                    <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => createAdminMutation.mutate(newAdmin)}
                      disabled={createAdminMutation.isPending || !newAdmin.name || !newAdmin.email || !newAdmin.password}>
                      {createAdminMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : "Complete Setup"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteAdminTarget} title="Remove Admin"
        message={`Remove "${deleteAdminTarget?.name}" as admin? They'll lose access to this shop.`}
        confirmLabel="Remove Admin" variant="danger" loading={deleteAdminMutation.isPending}
        onConfirm={() => deleteAdminTarget && deleteAdminMutation.mutate(deleteAdminTarget.id)}
        onCancel={() => setDeleteAdminTarget(null)} />
    </div>
  );
}

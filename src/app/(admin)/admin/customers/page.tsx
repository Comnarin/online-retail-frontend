"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";
import Drawer from "@/components/shared/Drawer";
import EmptyState from "@/components/shared/EmptyState";
import { Users, Search, ChevronRight, User, Star } from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch]         = useState("");
  const [customer, setCustomer]     = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => await customersApi.list({ search }),
  });
  const customers = customersData?.data || [];

  const openDrawer  = (c: any) => { setCustomer(c); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setCustomer(null); };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Customers</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">View and manage your customer base</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pl-[34px] text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4"><span>Failed to load customers. Please try again.</span></div>}

      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: "30%" }}>Customer</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Membership</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Points</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Orders</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Joined</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={6} className="px-5 py-[14px]"><div className="animate-pulse bg-surface-border rounded-md h-5" /></td></tr>
                ))
              : customers.length === 0
              ? (
                <tr className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={6} className="px-5 py-[14px] border-none"><EmptyState icon={Users} title="No customers yet" description="Customers will appear as they register through your shop." /></td></tr>
              )
              : customers.map((c: any) => (
                <tr key={c.id} onClick={() => openDrawer(c)} className="transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse">
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-md bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary overflow-hidden shrink-0">
                        {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : (c.name?.charAt(0) || "?")}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-main-text">{c.name}</div>
                        <div className="text-[11px] text-text-faint">{c.phone || c.email || "No contact"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-[14px] align-middle">
                    {c.membership?.tier
                      ? <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] bg-amber-bg text-amber-tx"><Star size={10} />{c.membership.tier.name}</span>
                      : <span className="text-[12px] text-text-faint">None</span>}
                  </td>
                  <td className="px-5 py-[14px] align-middle">
                    <span className="font-bold text-main-text text-[13px]">{(c.total_points || 0).toLocaleString()}</span>
                    <span className="text-[11px] text-text-faint ml-1">pts</span>
                  </td>
                  <td className="text-text-muted text-[13px] px-5 py-[14px] align-middle">{c.order_count || 0}</td>
                  <td className="text-text-faint text-[13px] px-5 py-[14px] align-middle">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-[14px] align-middle"><ChevronRight size={16} className="text-text-faint" /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={customer?.name || "Customer"} subtitle="Customer profile" icon={<User size={18} />}
        footer={<div className="flex justify-end w-full"><button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Close</button></div>}
      >
        {customer && (
          <div>
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 bg-main-bg rounded-[var(--r-xl)] mb-5">
              <div className="w-[52px] h-[52px] rounded-full bg-primary-light flex items-center justify-center text-[20px] font-extrabold text-primary shrink-0 overflow-hidden">
                {customer.avatar ? <img src={customer.avatar} alt="" className="w-full h-full object-cover" /> : customer.name?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-[15px] text-main-text">{customer.name}</div>
                <div className="text-[12px] text-text-muted mt-0.5">{customer.email || customer.phone || "No contact info"}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              {[
                { label: "Points Balance",  value: `${(customer.total_points || 0).toLocaleString()} pts` },
                { label: "Total Orders",    value: customer.order_count || 0 },
                { label: "Total Spent",     value: `฿${(customer.total_spent || 0).toLocaleString()}` },
                { label: "Member Since",    value: new Date(customer.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface border border-surface-border rounded-lg px-4 py-3.5">
                  <div className="text-[11px] text-text-faint mb-1">{label}</div>
                  <div className="font-bold text-[18px] text-main-text">{value}</div>
                </div>
              ))}
            </div>

            {/* Membership Tier */}
            {customer.membership?.tier && (
              <div className="bg-text rounded-[var(--r-xl)] px-5 py-[18px] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={15} className="text-[#FBBF24]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.5px] opacity-50">Membership Tier</span>
                </div>
                <div className="font-bold text-[17px]">{customer.membership.tier.name}</div>
                <div className="text-[12px] opacity-50 mt-1">{customer.membership.tier.discount_rate}% discount on all purchases</div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

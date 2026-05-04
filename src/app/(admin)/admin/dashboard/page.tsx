import React from "react";
import { liffApi, dashboardApi, ordersApi } from "@/lib/api";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number;
  iconBg?: string;
};

function StatCard({ icon: Icon, label, value, trend, iconBg = "var(--primary-light)" }: StatCardProps) {
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5 relative overflow-hidden transition-shadow hover:shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={18} className="text-primary" />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] ${trend >= 0 ? "bg-green-bg text-green-tx" : "bg-red-bg text-red-tx"}`}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="font-display text-[26px] font-extrabold text-main-text tracking-[-0.5px] leading-none">{value}</div>
        <div className="text-[11px] font-semibold text-text-faint uppercase tracking-[0.5px] mt-1">{label}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  // 1. Fetch data on the server
  let stats: any = {};
  let recentOrders: any[] = [];
  let error = false;

  try {
    const [statsResp, ordersResp] = await Promise.all([
      dashboardApi.stats(),
      ordersApi.list({ limit: 5 })
    ]);
    stats = statsResp.data || {};
    recentOrders = ordersResp.data || [];
  } catch (err) {
    console.error("Dashboard data fetch failed:", err);
    error = true;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Dashboard</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Overview of your store&apos;s performance</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4">
          <AlertCircle size={16} />
          Failed to load dashboard data. Check your connection or try refreshing.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={DollarSign} label="Total Revenue"  value={`฿${(stats.total_revenue   || 0).toLocaleString()}`} trend={stats.revenue_trend} />
        <StatCard icon={ShoppingCart} label="Total Orders"  value={(stats.total_orders    || 0).toLocaleString()}          trend={stats.orders_trend}    />
        <StatCard icon={Users}        label="Customers"     value={(stats.total_customers  || 0).toLocaleString()}          trend={stats.customers_trend} />
        <StatCard icon={Package}      label="Products"      value={(stats.total_products   || 0).toLocaleString()}                                        />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] font-bold font-display text-main-text">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-[12px] font-semibold text-primary transition-colors hover:text-primary-hover">
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full border-collapse">
            <thead className="bg-surface-low">
              <tr>
                <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Order #</th>
                <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Customer</th>
                <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Total</th>
                <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Status</th>
                <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0
                ? (
                  <tr className="border-b border-surface-border last:border-0 border-collapse">
                    <td colSpan={5} className="py-[40px] px-5 text-center text-text-faint text-[13px] border-none">
                      No orders yet. Orders will appear here once customers start purchasing.
                    </td>
                  </tr>
                )
                : recentOrders.map((order: any) => (
                  <tr key={order.id} className="transition-colors hover:bg-surface-low cursor-default border-b border-surface-border last:border-0 border-collapse">
                    <td className="font-mono text-[12px] font-semibold px-5 py-[14px] align-middle">#{order.order_number}</td>
                    <td className="px-5 py-[14px] text-[13px] text-main-text align-middle">{order.customer?.name || "Unknown"}</td>
                    <td className="font-bold px-5 py-[14px] text-[13px] text-main-text align-middle">฿{order.total?.toLocaleString()}</td>
                    <td className="px-5 py-[14px] align-middle"><StatusBadge status={order.status} /></td>
                    <td className="text-text-faint px-5 py-[14px] text-[13px] align-middle">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

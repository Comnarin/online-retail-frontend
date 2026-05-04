import React, { Suspense } from "react";
import { dashboardApi, ordersApi } from "@/lib/api";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

// ─── Sub-Components ──────────────────────────────

async function StatsGrid() {
  try {
    const resp = await dashboardApi.stats();
    const stats = resp.data || {};

    const items = [
      { icon: DollarSign, label: "Total Revenue", value: `฿${(stats.total_revenue || 0).toLocaleString()}`, trend: stats.revenue_trend },
      { icon: ShoppingCart, label: "Total Orders", value: (stats.total_orders || 0).toLocaleString(), trend: stats.orders_trend },
      { icon: Users, label: "Customers", value: (stats.total_customers || 0).toLocaleString(), trend: stats.customers_trend },
      { icon: Package, label: "Products", value: (stats.total_products || 0).toLocaleString() },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {items.map((item, i) => (
          <div key={i} className="bg-surface border border-surface-border rounded-xl p-5 relative overflow-hidden transition-shadow hover:shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-md flex items-center justify-center bg-primary/10 shrink-0">
                <item.icon size={18} className="text-primary" />
              </div>
              {item.trend !== undefined && (
                <span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold ${item.trend >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {item.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(item.trend)}%
                </span>
              )}
            </div>
            <div className="font-display text-[26px] font-extrabold text-main-text tracking-[-0.5px] leading-none">{item.value}</div>
            <div className="text-[11px] font-semibold text-text-faint uppercase tracking-[0.5px] mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    );
  } catch (err) {
    return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6">Failed to load stats</div>;
  }
}

async function RecentOrders() {
  try {
    const resp = await ordersApi.list({ limit: 5 });
    const orders = resp.data || [];

    return (
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead className="bg-surface-low border-b border-surface-border">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold text-text-faint uppercase tracking-wider">Order #</th>
              <th className="px-5 py-3 text-[11px] font-bold text-text-faint uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-[11px] font-bold text-text-faint uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 text-[11px] font-bold text-text-faint uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[11px] font-bold text-text-faint uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-text-faint text-sm">No orders yet.</td></tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-surface-low transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold">#{order.order_number}</td>
                  <td className="px-5 py-4 text-sm text-main-text">{order.customer?.name || "Anonymous"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-main-text">฿{order.total?.toLocaleString()}</td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4 text-sm text-text-faint">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  } catch (err) {
    return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">Failed to load recent orders</div>;
  }
}

function SectionSkeleton({ height = "100px" }) {
  return (
    <div style={{ height }} className="w-full bg-surface-low animate-pulse rounded-xl border border-surface-border flex items-center justify-center">
      <Loader2 className="animate-spin text-text-faint" size={20} />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-main-text tracking-tight">Dashboard</h1>
          <p className="text-[14px] text-text-muted mt-1">Real-time overview of your store performance</p>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6"><SectionSkeleton height="110px" /><SectionSkeleton height="110px" /><SectionSkeleton height="110px" /><SectionSkeleton height="110px" /></div>}>
        <StatsGrid />
      </Suspense>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-bold font-display text-main-text">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton height="300px" />}>
          <RecentOrders />
        </Suspense>
      </div>
    </div>
  );
}

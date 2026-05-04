"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { liffApi, Order } from "@/lib/api";
import { 
  ArrowLeft,
  ChevronRight,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import "../../liff.css";

export default function LiffOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const locale = useLocale();
  const isEn = locale === "en";

  const { data: orders, isLoading } = useQuery({
    queryKey: ["liff-orders", activeTab],
    queryFn: async () => {
      const resp = await liffApi.orders({ status: activeTab !== "all" ? activeTab : undefined });
      return resp.data;
    },
  });

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return { color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock, label: 'Pending' };
    if (s === 'confirmed' || s === 'completed') return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, label: 'Confirmed' };
    if (s === 'processing') return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Package, label: 'Processing' };
    if (s === 'shipping') return { color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck, label: 'Shipping' };
    return { color: 'text-liff-text-muted', bg: 'bg-black/5', icon: AlertCircle, label: status };
  };

  return (
    <div className="pb-32 bg-liff-bg min-h-screen">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-black/5">
        <button 
          onClick={() => router.push("/liff/shop")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-sm font-bold tracking-tight">Order History</div>
        <div className="w-10" />
      </nav>

      <div className="p-4 max-w-[500px] mx-auto space-y-6">
        {/* Tabs */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {["all", "pending", "confirmed", "delivering"].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeTab === t 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-liff-text-muted border-black/5 shadow-sm"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </section>

        {/* Orders List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="retail-card animate-pulse h-40" />
            ))
          ) : orders?.map((order: Order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            
            return (
              <div key={order.id} className="retail-card p-0 overflow-hidden flex flex-col group active:scale-[0.98] transition-all">
                {/* Order Top Info */}
                <div className="p-4 flex justify-between items-start border-b border-black/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Order #</span>
                       <span className="text-xs font-bold font-mono text-liff-text uppercase">#{order.order_number?.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-liff-text-muted">
                       <Calendar size={12} />
                       <span className="text-[11px] font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.color} text-[11px] font-bold`}>
                    <StatusIcon size={12} />
                    {config.label}
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-black/5 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {order.items?.[0]?.product?.image_url || order.items?.[0]?.product?.images?.[0]?.url ? (
                      <img src={order.items[0].product.image_url || order.items[0].product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-black/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold truncate pr-6 leading-tight mb-1">
                      {order.items?.[0] ? (isEn ? (order.items[0].name_en || order.items[0].name_th) : order.items[0].name_th) : "Premium Products"}
                    </h4>
                    <p className="text-[11px] text-liff-text-muted font-medium">
                      {order.items?.length > 1 ? `And ${order.items.length - 1} other items` : "1 Item Purchased"}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                       <span className="text-[11px] font-bold text-black/30">Total</span>
                       <span className="text-sm font-black text-liff-text tracking-tight">฿{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="self-center">
                    <ChevronRight size={18} className="text-black/10 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}

          {(!orders || orders.length === 0) && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Package className="text-black/20" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">No orders found</h3>
              <p className="text-xs text-liff-text-muted mb-6">You haven't made any purchases yet.</p>
              <Link href="/liff/shop" className="btn-primary px-8 h-12 text-xs">Start Shopping</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

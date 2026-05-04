"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, appearanceApi, Order } from "@/lib/api";
import { toast } from "@/lib/toast";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { Truck, Search, ChevronRight, User, MapPin, Rocket, Receipt, CheckCircle2, XCircle, ZoomIn } from "lucide-react";

const STATUS_FLOW = ["pending", "pending_verification", "confirmed", "processing", "shipping", "delivered"];
const STATUS_ACTIONS: Record<string, string> = {
  pending:                "Waiting for Slip",
  pending_verification:   "Confirm Payment",
  confirmed:              "Start Processing",
  processing:             "Mark as Shipped",
  shipping:               "Mark as Delivered",
};
const STATUS_TABS = ["all", "pending", "pending_verification", "confirmed", "processing", "shipping", "delivered"];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [order, setOrder]         = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<{ order: Order; nextStatus: string } | null>(null);

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ["orders", search, statusFilter],
    queryFn: async () => await ordersApi.list({ search, status: statusFilter === "all" ? undefined : statusFilter }),
  });
  const orders = ordersData?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
      setStatusConfirm(null);
      closeDrawer();
    },
    onError: (err: { response?: { data?: { message?: string } }; message: string }) => { 
      toast.error("Failed to update status", err.response?.data?.message || err.message); 
      setStatusConfirm(null); 
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (id: string) => ordersApi.confirmPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment confirmed! Order is now processing.");
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to confirm payment", err.message),
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (id: string) => ordersApi.rejectPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment rejected. Order cancelled.");
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to reject payment", err.message),
  });

  const [slipViewerOpen, setSlipViewerOpen] = useState(false);

  const openDrawer = (o: Order) => { setOrder(o); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setOrder(null); };
  const getNextStatus = (s: string) => { const i = STATUS_FLOW.indexOf(s); return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

  const { data: appearanceData } = useQuery({
    queryKey: ["appearance"],
    queryFn: async () => (await appearanceApi.get()).data,
  });

  const [localOrderCode, setLocalOrderCode] = useState("");
  useEffect(() => {
    if (appearanceData?.order_code) setLocalOrderCode(appearanceData.order_code);
  }, [appearanceData]);

  const saveOrderCodeMutation = useMutation({
    mutationFn: (newCode: string) => {
      if (!appearanceData) throw new Error("No data found");
      return appearanceApi.update({
        name: appearanceData.name,
        order_code: newCode,
        appearance: appearanceData.appearance,
        features: appearanceData.features,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appearance"] });
      toast.success("Order prefix updated");
    },
    onError: (err: any) => toast.error("Failed to update prefix", err.response?.data?.message || err.message),
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Orders</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Track and manage customer orders</p>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-low text-text-faint flex items-center justify-center shrink-0">
            <Rocket size={18} className="text-primary" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-main-text leading-tight">Order Configuration</div>
            <div className="text-[12px] text-text-muted mt-0.5">Define prefix for generated order numbers</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input 
            className="w-24 h-9 bg-surface-low border border-surface-border rounded-md px-3 text-[13px] font-bold text-main-text uppercase outline-none focus:border-primary transition-colors"
            placeholder="ORD"
            value={localOrderCode}
            onChange={e => setLocalOrderCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          />
          <button 
            className="h-9 px-4 rounded-md bg-main-bg border border-surface-border text-[12px] font-bold text-main-text hover:bg-surface-low active:scale-95 transition-all disabled:opacity-50"
            onClick={() => saveOrderCodeMutation.mutate(localOrderCode)}
            disabled={saveOrderCodeMutation.isPending || localOrderCode === appearanceData?.order_code}
          >
            {saveOrderCodeMutation.isPending ? "..." : "Set Prefix"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pl-[34px] text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Search by order number…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="inline-flex p-[3px] bg-surface-low rounded-[8px] overflow-x-auto max-w-max">
          {STATUS_TABS.map(s => (
            <button 
              key={s} 
              className={`px-3 py-1.5 rounded-[6px] text-[12.5px] font-semibold transition-all whitespace-nowrap ${statusFilter === s ? "bg-surface text-main-text shadow-xs" : "bg-transparent text-text-faint hover:text-main-text"}`} 
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4"><span>Failed to load orders. Please try again.</span></div>}

      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Order #</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Customer</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Items</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Total</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Status</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Date</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={7} className="px-5 py-[14px]"><div className="animate-pulse bg-surface-border rounded-md h-5" /></td></tr>
                ))
              : orders.length === 0
              ? (
                <tr className="border-b border-surface-border last:border-0 border-collapse"><td colSpan={7} className="px-5 py-[14px] border-none"><EmptyState icon={Truck} title="No orders yet" description="Orders will appear here once customers start purchasing." /></td></tr>
              )
              : orders.map((o: Order) => (
                <tr key={o.id} onClick={() => openDrawer(o)} className="transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse">
                  <td className="font-mono text-[12px] font-bold px-5 py-[14px] align-middle">#{o.order_number}</td>
                  <td className="px-5 py-[14px] align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-md bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary overflow-hidden shrink-0">{o.customer?.name?.charAt(0) || "?"}</div>
                      <span className="text-[13px] font-semibold text-main-text">{o.customer?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="text-[13px] text-text-muted px-5 py-[14px] align-middle">{o.items?.length || 0} items</td>
                  <td className="font-bold text-[13px] px-5 py-[14px] align-middle">฿{o.total?.toLocaleString()}</td>
                  <td className="px-5 py-[14px] align-middle"><StatusBadge status={o.status} /></td>
                  <td className="text-text-faint text-[13px] px-5 py-[14px] align-middle">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-[14px] align-middle"><ChevronRight size={16} className="text-text-faint" /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={`Order #${order?.order_number || ""}`} subtitle="Order details" icon={<Truck size={18} />}
        footer={
          order && (
            <div className="flex justify-between w-full">
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Close</button>
              {order.status === 'pending_verification' ? (
                <div className="flex gap-2">
                  <button 
                    className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => rejectPaymentMutation.mutate(order.id)}
                    disabled={rejectPaymentMutation.isPending}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button 
                    className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-[#16A34A] text-white hover:bg-[#15803d] hover:shadow-[0_4px_12px_rgba(22,163,74,0.30)]"
                    onClick={() => confirmPaymentMutation.mutate(order.id)}
                    disabled={confirmPaymentMutation.isPending}
                  >
                    <CheckCircle2 size={14} /> Confirm Payment
                  </button>
                </div>
              ) : getNextStatus(order.status) ? (
                <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => setStatusConfirm({ order, nextStatus: getNextStatus(order.status)! })}>
                  {STATUS_ACTIONS[order.status] || "Update Status"}
                </button>
              ) : null}
            </div>
          )
        }
      >
        {order && (
          <div>
            {/* Status + timestamp */}
            <div className="flex items-center gap-3 mb-5">
              <StatusBadge status={order.status} />
              <span className="text-[12px] text-text-faint">Placed on {new Date(order.created_at).toLocaleString()}</span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-6">
              {STATUS_FLOW.map((s, i) => {
                const currentIdx = STATUS_FLOW.indexOf(order.status);
                const done = i <= currentIdx;
                return (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full h-[3px] rounded-full ${done ? "bg-primary" : "bg-surface-border"}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-[0.6px] ${done ? "text-main-text" : "text-text-faint"}`}>{s}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-main-bg rounded-xl px-4 py-3.5 mb-5">
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-2 flex items-center gap-1.5">
                <User size={12} /> Customer
              </div>
              <div className="font-bold text-main-text">{order.customer?.name}</div>
              <div className="text-[12px] text-text-muted mt-0.5">{order.customer?.email || order.customer?.phone || "No contact info"}</div>
            </div>

            {/* Shipping Address */}
            <div className="bg-main-bg rounded-xl px-4 py-3.5 mb-5">
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Shipping Address
              </div>
              <div className="text-[13px] font-semibold text-main-text">
                {order.shipping_address?.name} ({order.shipping_address?.phone})
              </div>
              <div className="text-[12px] text-text-muted mt-1 leading-relaxed">
                {order.shipping_address?.address}, {order.shipping_address?.district},<br/>
                {order.shipping_address?.province}, {order.shipping_address?.zip_code}
              </div>
            </div>

            {/* Payment Slip */}
            {order.slip_image_url && (
              <div className="bg-main-bg rounded-xl px-4 py-3.5 mb-5">
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-2 flex items-center gap-1.5">
                  <Receipt size={12} /> Payment Slip
                </div>
                <div className="relative group cursor-pointer" onClick={() => setSlipViewerOpen(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={order.slip_image_url} 
                    alt="Payment slip" 
                    className="w-full max-h-[200px] object-contain rounded-lg border border-surface-border bg-surface" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-lg">
                    <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                {order.status === 'pending_verification' && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Awaiting your verification
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              <div className="text-[11px] font-bold text-text-faint uppercase tracking-[0.5px] mb-2.5">Items</div>
              <div className="flex flex-col gap-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center px-3.5 py-3 bg-surface border border-surface-border rounded-xl">
                    <div>
                      <div className="font-semibold text-[13px] text-main-text">{item.name_th}</div>
                      <div className="text-[11px] text-text-faint">Qty: {item.quantity} × ฿{item.price?.toLocaleString()}</div>
                    </div>
                    <span className="font-bold text-[13px] text-main-text">฿{item.subtotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-surface-border mt-5 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-[13px] text-text-muted">
                <span>Subtotal</span><span>฿{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-text-muted">Discount</span>
                  <span className="text-[#16A34A]">-฿{order.discount_amount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[15px] border-t border-surface-border pt-2.5 text-main-text">
                <span>Total</span><span>฿{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!statusConfirm} title="Update Order Status"
        message={`Change order #${statusConfirm?.order?.order_number} status to "${statusConfirm?.nextStatus}"?`}
        confirmLabel={(statusConfirm?.order?.status ? STATUS_ACTIONS[statusConfirm.order.status] : null) || "Confirm"}
        variant="warning" loading={updateStatusMutation.isPending}
        onConfirm={() => statusConfirm && updateStatusMutation.mutate({ id: statusConfirm.order.id, status: statusConfirm.nextStatus })}
        onCancel={() => setStatusConfirm(null)} />
    </div>
  );
}

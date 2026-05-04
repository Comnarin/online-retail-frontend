"use client";
import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { liffApi, couponsApi, addressesApi, liffPaymentApi, Coupon, OrderAddress, PaymentMethod, Order } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";
import { useCartSync } from "@/lib/useCartSync";
import { toast } from "@/lib/toast";
import { 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  MapPin,
  CheckCircle2,
  Plus,
  Zap,
  Clock,
  Package,
  Trash2,
  Minus,
  Ticket,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Loader2,
  HourglassIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import "../../liff.css";

type Step = "items" | "shipping" | "payment_selection" | "payment_execution" | "awaiting_verification" | "success";

export default function LiffCartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, getTotal, clearCart } = useCartStore();
  const { updateQty, removeItem, toggleSelect, isLoading: isCartLoading } = useCartSync();
  const locale = useLocale();
  const isEn = locale === "en";
  const [step, setStep] = useState<Step>("items");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState<OrderAddress>({
    name: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    zip_code: ""
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");
  const [addressMode, setAddressMode] = useState<"saved" | "manual">("manual");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: addressesData } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.list(),
  });
  const savedAddresses = addressesData?.data || [];

  const { data: paymentMethodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => liffPaymentApi.listMethods(),
  });
  const paymentMethods = paymentMethodsData?.data || [];

  const { data: activeOrderData, refetch: refetchActiveOrder } = useQuery({
    queryKey: ["active-pending-order"],
    queryFn: () => liffApi.getActivePendingOrder(),
    enabled: mounted && step === "items",
    retry: false
  });

  React.useEffect(() => {
    if (activeOrderData?.data && !currentOrder && step === "items" && mounted) {
      const order = activeOrderData.data;
      if (order.status === "pending") {
        setOrderId(order.id);
        setCurrentOrder(order);
        setSelectedPaymentMethodId(order.payment_method_id || null);
        setStep("payment_execution");
        setStep("payment_execution");

      } else if (order.status === "pending_verification") {
        setOrderId(order.id);
        setCurrentOrder(order);
        setStep("awaiting_verification");

      } else if (order.status === "cancelled") {
        setStep("items");
        clearCart();
        console.log("ℹ️ [Resumption] Order is cancelled:", order.id);
      }
    }
  }, [activeOrderData, currentOrder, step, mounted]);

  const couponMutation = useMutation({
    mutationFn: (code: string) => couponsApi.list({ search: code }),
    onSuccess: (resp) => {
      const coupon = resp.data.find((c: Coupon) => c.code === couponCode.trim() && c.is_active);
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponError("");
        toast.success("Coupon applied!");
      } else {
        setAppliedCoupon(null);
        setCouponError("Invalid or expired coupon.");
      }
    },
  });

  const orderMutation = useMutation({
    mutationFn: (data: Parameters<typeof liffApi.createOrder>[0]) => liffApi.createOrder({
      ...data,
      save_address: saveAddress,
      address_label: addressLabel,
      payment_method_id: selectedPaymentMethodId!
    }),
    onSuccess: (resp) => {
      setOrderId(resp.data.id);
      setCurrentOrder(resp.data);
      setStep("payment_execution");
      // Invalidate cart because backend clears selected items on order creation
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("Checkout failed");
    },
  });

  const slipUploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => liffApi.uploadSlip(id, file),
    onSuccess: () => {
      setStep("awaiting_verification");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["active-pending-order"] });

    },
    onError: () => {
      toast.error("Failed to upload slip. Please try again.");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentMethodId }: { id: string, paymentMethodId: string }) => 
      liffApi.updateOrderPaymentMethod(id, paymentMethodId),
    onSuccess: (resp) => {
      setCurrentOrder(resp.data);
      setStep("payment_execution");
      setStep("payment_execution");
      toast.success("Payment method updated");
    },
    onError: () => {
      toast.error("Failed to update payment method");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await liffApi.cancelOrder(id);
        setOrderId(null);
        setCurrentOrder(null);
        setStep("items");
        queryClient.invalidateQueries({ queryKey: ["active-pending-order"] });
        toast.success("Order cancelled");
      } catch (err) {
        throw err;
      }
    },
    onError: () => {
      toast.error("Failed to cancel order");
    }
  });

  const handleCancelOrder = () => {
    if (orderId) {
      if (confirm("Are you sure you want to cancel this order? Item stock will be released.")) {
        cancelMutation.mutate(orderId);
      }
    }
  };

  const subtotal = getTotal();
  const discount = appliedCoupon 
    ? (appliedCoupon.discount_type === 'percent' ? subtotal * (appliedCoupon.discount_value / 100) : appliedCoupon.discount_value)
    : 0;
  const shipping = subtotal > 0 ? 45 : 0; // Standard retail shipping
  const total = Math.max(0, subtotal - discount + shipping);

  // INVENTORY CHECK
  const selectedItems = items.filter(i => i.selected !== false);
  const hasInventoryIssues = selectedItems.some(i => i.qty > (i.inventory ?? 0));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode) couponMutation.mutate(couponCode);
  };

  const nextToShipping = () => {
    if (items.length > 0 && !hasInventoryIssues) setStep("shipping");
  };

  const handleCreateOrder = () => {
    if (!selectedPaymentMethodId || hasInventoryIssues) return;

    if (orderId) {
      // If order already exists, just update payment method
      updatePaymentMutation.mutate({ id: orderId, paymentMethodId: selectedPaymentMethodId });
      return;
    }

    const orderData = {
      items: selectedItems.map(it => ({
        product_id: it.id,
        quantity: it.qty,
      })),
      coupon_code: appliedCoupon?.code || "",
      points_to_redeem: 0, // Points deduction logic can be added here if implemented in UI
      shipping_address: address,
      save_address: saveAddress,
      address_label: addressLabel,
      payment_method_id: selectedPaymentMethodId,
      note: ""
    };
    orderMutation.mutate(orderData);
  };

  const handleUploadSlip = () => {
    if (orderId && slipFile) {
      slipUploadMutation.mutate({ id: orderId, file: slipFile });
    }
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPG, PNG, or WebP image.');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  // Success Step
  if (step === "success") {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 text-center animate-slide-up">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tighter">Order Success!</h1>
        <p className="text-liff-text-muted mb-10 max-w-[280px]">
          Your payment slip has been submitted and verified. We&apos;re getting your items ready for shipment.
        </p>
        <div className="w-full space-y-3">
          <Link 
            href="/liff/orders" 
            className="btn-primary w-full"
          >
            Track Order
          </Link>
          <Link 
            href="/liff/shop" 
            className="w-full h-[54px] flex items-center justify-center text-sm font-bold text-liff-text-muted transition-all active:scale-95"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-liff-bg pb-32">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-black/5">
        <button 
          onClick={() => {
              if (step === "items") router.push("/liff/shop");
              else if (step === "shipping") setStep("items");
              else if (step === "payment_selection") setStep("shipping");
              else if (step === "payment_execution") {
                // Prevent accidental back. Customer must explicitly cancel or change payment.
                toast.info("Please use the 'Change Payment' or 'Cancel' buttons below.");
              }
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-sm font-bold tracking-tight">
          {step === "items" && "Shopping Bag"}
          {step === "shipping" && "Delivery Info"}
          {step === "payment_selection" && "Payment Method"}
          {step === "payment_execution" && "Pay Now"}
          {step === "awaiting_verification" && "Verification"}
        </div>
        <div className="w-10" />
      </nav>

      <div className="p-4 max-w-[500px] mx-auto space-y-6">
        {!mounted ? (
           <div className="flex flex-col items-center justify-center py-32 text-center animate-slide-up">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="text-black/20" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Loading bag...</h3>
           </div>
        ) : items.length === 0 && step === "items" ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-slide-up">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="text-black/20" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">Your bag is empty</h3>
            <p className="text-sm text-liff-text-muted mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link href="/liff/shop" className="btn-primary px-8">Browse Products</Link>
          </div>
        ) : (
          <>
            {/* Step Indicators */}
            <div className="flex justify-center gap-2 py-4">
              <div className={`step-indicator ${step === 'items' ? 'active' : ''}`} />
              <div className={`step-indicator ${step === 'shipping' ? 'active' : ''}`} />
              <div className={`step-indicator ${step === 'payment_selection' ? 'active' : ''}`} />
              <div className={`step-indicator ${step === 'payment_execution' || step === 'awaiting_verification' ? 'active' : ''}`} />
            </div>

            {/* Step 1: Items Overview */}
            {step === "items" && (
              <div className="space-y-6 animate-slide-up">
                <div className="space-y-3">
                  {items.map(item => {
                    const isShortage = item.qty > (item.inventory ?? 0);
                    return (
                      <div key={item.id} className={`retail-card flex flex-col gap-2 p-3 ${item.selected === false ? 'opacity-60 grayscale-[0.5]' : ''} ${isShortage ? 'border-2 border-red-500/50 bg-red-50/30' : ''}`}>
                        <div className="flex gap-4 items-center">
                          {/* Checkbox */}
                          <button 
                            onClick={() => toggleSelect(item.id, !item.selected, item.cart_item_id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              item.selected !== false 
                                ? 'bg-primary border-primary text-white' 
                                : 'border-black/10 bg-black/5'
                            }`}
                          >
                            {item.selected !== false && <CheckCircle2 size={14} />}
                          </button>

                          <div className="w-20 h-24 bg-black/5 rounded-xl overflow-hidden shrink-0">
                            {item.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image_url} alt={isEn ? (item.name_en || item.name_th) : item.name_th} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-black/10"><Package size={24} /></div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1 h-24">
                            <div>
                              <h4 className="text-[15px] font-bold line-clamp-1 leading-tight">{isEn ? (item.name_en || item.name_th) : item.name_th}</h4>
                              <p className="text-sm text-primary font-bold mt-1">฿{item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-black/5 rounded-full p-1 border border-black/5">
                                <button 
                                  onClick={() => item.qty > 1 ? updateQty(item.id, -1, item.cart_item_id) : removeItem(item.id, item.cart_item_id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-black shadow-sm active:scale-90 transition-all font-bold"
                                >
                                  {item.qty === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                                </button>
                                <span className={`text-xs font-bold w-4 text-center ${isShortage ? 'text-red-600' : ''}`}>{item.qty}</span>
                                <button 
                                  onClick={() => updateQty(item.id, 1, item.cart_item_id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-black shadow-sm active:scale-90 transition-all font-bold"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-[15px] font-bold tracking-tight">฿{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {isShortage && (
                          <div className="px-2 py-2 mt-1 rounded-lg bg-red-100 flex items-center gap-2 animate-pulse">
                            <Zap size={12} className="text-red-600" />
                            <p className="text-[10px] font-black uppercase text-red-600 tracking-tight">
                              Insufficient Stock: {item.inventory} units remaining
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Panel */}
                <div className="retail-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket size={18} className="text-primary" />
                    <span className="text-sm font-bold">Promo Code</span>
                  </div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      className="flex-1 h-12 bg-black/5 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      type="submit"
                      disabled={!couponCode || couponMutation.isPending}
                      className="px-6 h-12 bg-black text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-30"
                    >
                      Apply
                    </button>
                  </form>
                  {appliedCoupon && (
                    <div className="mt-3 flex items-center gap-2 text-[13px] font-bold text-green-600">
                      <CheckCircle2 size={14} />
                      Code &quot;{appliedCoupon.code}&quot; applied!
                    </div>
                  )}
                  {couponError && <p className="mt-3 text-[13px] font-bold text-red-500">{couponError}</p>}
                </div>

                {/* Bill Card */}
                <div className="retail-card space-y-3">
                  <div className="flex justify-between text-sm text-liff-text-muted">
                    <span>Subtotal</span>
                    <span className="font-bold text-liff-text">฿{subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-liff-text-muted pb-3 border-b border-black/5">
                    <span>Shipping</span>
                    <span className="font-bold text-liff-text">฿{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-base font-bold">Total Amount</span>
                    <span className="text-2xl font-black text-primary tracking-tighter">฿{total.toLocaleString()}</span>
                  </div>
                </div>

                {hasInventoryIssues && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-bottom-4">
                    <Zap className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-red-600 mb-1">Stock Shortage Detected</p>
                      <p className="text-[11px] text-red-500/80 leading-relaxed font-medium">
                        Some items in your bag have insufficient inventory. Please reduce quantity or remove them before proceeding to shipping.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={nextToShipping}
                  disabled={hasInventoryIssues || items.filter(i => i.selected !== false).length === 0}
                  className={`btn-primary w-full group overflow-hidden relative ${hasInventoryIssues ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <span className="relative z-10">
                    {hasInventoryIssues ? "Check Stock Levels" : "Proceed to Shipping"}
                  </span>
                  {!hasInventoryIssues && <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            )}

            {/* Step 2: Shipping Details */}
            {step === "shipping" && (
              <div className="space-y-6 animate-slide-up">
                <div className="retail-card space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      <span className="text-sm font-bold">Shipping Address</span>
                    </div>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex p-1 bg-black/5 rounded-xl">
                    <button 
                      onClick={() => setAddressMode("manual")}
                      className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${addressMode === "manual" ? "bg-white text-primary shadow-sm" : "text-black/40"}`}
                    >
                      New Address
                    </button>
                    <button 
                      onClick={() => {
                        setAddressMode("saved");
                        if (savedAddresses.length > 0 && !selectedAddressId) {
                          // Select default or first one
                          const def = savedAddresses.find(a => a.is_default) || savedAddresses[0];
                          setSelectedAddressId(def.id);
                          setAddress({
                            name: def.name,
                            phone: def.phone,
                            address: def.address,
                            district: def.district,
                            province: def.province,
                            zip_code: def.zip_code
                          });
                        }
                      }}
                      disabled={savedAddresses.length === 0}
                      className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${addressMode === "saved" ? "bg-white text-primary shadow-sm" : "text-black/40 disabled:opacity-30"}`}
                    >
                      Saved ({savedAddresses.length})
                    </button>
                  </div>

                  {addressMode === "saved" && selectedAddressId && (
                    <div className="space-y-4">
                      {/* Selected Address Card */}
                      <div className="grid grid-cols-1 gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setAddress({
                                name: addr.name,
                                phone: addr.phone,
                                address: addr.address,
                                district: addr.district,
                                province: addr.province,
                                zip_code: addr.zip_code
                              });
                            }}
                            className={`flex items-start gap-3 p-4 rounded-xl text-left border-2 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-black/5 bg-white'}`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary' : 'border-black/10'}`}>
                              {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[13px] font-black">{addr.label || 'Home'}</span>
                                    {addr.is_default && <span className="text-[9px] font-black text-white bg-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">Default</span>}
                                </div>
                                <p className="text-[12px] font-bold text-liff-text mb-0.5">{addr.name} ({addr.phone})</p>
                                <p className="text-[11px] text-liff-text-muted leading-relaxed line-clamp-2">
                                    {addr.address}, {addr.district}, {addr.province} {addr.zip_code}
                                </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {addressMode === "manual" && (
                    <div className="space-y-4 pt-1 animate-slide-up">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Name</label>
                        <input 
                          className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Receiver Name"
                          value={address.name}
                          onChange={e => setAddress({...address, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Phone</label>
                        <input 
                          className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Contact Number"
                          value={address.phone}
                          onChange={e => setAddress({...address, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Address Detail</label>
                        <textarea 
                          className="w-full bg-black/5 rounded-xl p-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] transition-all"
                          placeholder="House No, Road, Soy..."
                          value={address.address}
                          onChange={e => setAddress({...address, address: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-black/30 uppercase pl-1">District</label>
                          <input 
                            className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="District"
                            value={address.district}
                            onChange={e => setAddress({...address, district: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Province</label>
                          <input 
                            className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Province"
                            value={address.province}
                            onChange={e => setAddress({...address, province: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Zip Code</label>
                        <input 
                          className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Zip Code"
                          value={address.zip_code}
                          onChange={e => setAddress({...address, zip_code: e.target.value})}
                        />
                      </div>

                      <div className="pt-2 space-y-3">
                        <button 
                          onClick={() => setSaveAddress(!saveAddress)}
                          className="flex items-center gap-2 group"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${saveAddress ? 'bg-primary border-primary' : 'border-black/10'}`}>
                            {saveAddress && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className="text-xs font-bold text-liff-text group-active:translate-x-0.5 transition-transform">Save this address for future use</span>
                        </button>

                        {saveAddress && (
                          <div className="space-y-1 animate-in zoom-in-95 duration-200">
                            <label className="text-[11px] font-bold text-black/30 uppercase pl-1">Address Label</label>
                            <input 
                              className="w-full h-12 bg-black/5 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="e.g. My Home, Office, Mom's House"
                              value={addressLabel}
                              onChange={e => setAddressLabel(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="retail-card flex justify-between items-center py-4">
                  <span className="text-sm font-bold">Total Amount</span>
                  <span className="text-xl font-black text-primary tracking-tighter">฿{total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={() => setStep("payment_selection")}
                  disabled={orderMutation.isPending || !address.name || !address.phone || !address.address}
                  className="btn-primary w-full gap-2"
                >
                  Continue to Payment
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 3: Payment Method Selection */}
            {step === "payment_selection" && (
              <div className="space-y-6 animate-slide-up">
                <div className="retail-card space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-primary" />
                    <span className="text-sm font-bold">How would you like to pay?</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((pm: PaymentMethod) => (
                      <button
                        key={pm.id}
                        onClick={() => setSelectedPaymentMethodId(pm.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedPaymentMethodId === pm.id ? 'border-primary bg-primary/5' : 'border-black/5 bg-white'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethodId === pm.id ? 'bg-primary text-white' : 'bg-black/5 text-black/40'}`}>
                           <CreditCard size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold">{pm.name}</h4>
                          <p className="text-[11px] text-liff-text-muted mt-0.5">{pm.description}</p>
                        </div>
                        {selectedPaymentMethodId === pm.id && <CheckCircle2 size={20} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="retail-card flex justify-between items-center py-4">
                  <span className="text-sm font-bold">Total Amount</span>
                  <span className="text-xl font-black text-primary tracking-tighter">฿{total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCreateOrder}
                  disabled={orderMutation.isPending || updatePaymentMutation.isPending || !selectedPaymentMethodId}
                  className="btn-primary w-full gap-2"
                >
                   {orderMutation.isPending || updatePaymentMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                   <ChevronRight size={18} />
                </button>
              </div>
            )}
                        {/* Step 4: Payment Execution (with Timer) */}
            {step === "payment_execution" && (
              <div className="animate-slide-up flex flex-col gap-4 pb-4">


                <div className="retail-card flex flex-col items-center p-6 relative overflow-hidden">
                  {/* Accent Layer for depth */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                  <div className="flex items-center justify-between w-full mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard size={16} className="text-primary" />
                      </div>
                      <span className="text-[13px] font-bold tracking-tight">
                        {paymentMethods.find(p => p.id === selectedPaymentMethodId || p.id === currentOrder?.payment_method_id)?.name || 'Order Payment'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      <ShieldCheck size={10} /> Secure
                    </div>
                  </div>

                  {/* QR Code Image from admin */}
                  {(() => {
                    const pm = paymentMethods.find(p => p.id === selectedPaymentMethodId || p.id === currentOrder?.payment_method_id);
                    const qrUrl = pm?.qr_code_url;
                    return qrUrl ? (
                      <div className="w-56 aspect-square bg-white border-[8px] border-liff-bg rounded-[24px] flex items-center justify-center p-2 mb-5 shadow-sm overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="Payment QR Code" className="w-full h-full object-contain rounded-xl" />
                      </div>
                    ) : (
                      <div className="w-44 aspect-square bg-white border-[8px] border-liff-bg rounded-[24px] flex flex-col items-center justify-center p-3 relative mb-5 shadow-sm">
                        <div className="w-full h-full bg-liff-bg/50 rounded-xl flex items-center justify-center border border-dashed border-black/5">
                          <Zap size={32} className="text-primary/10" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-black/5 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                          No QR Set
                        </div>
                      </div>
                    );
                  })()}

                  <div className="text-center mb-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-liff-text/40 mb-1">Amount to Pay</p>
                    <p className="text-4xl font-black tracking-tightest leading-none">฿{(currentOrder?.total ?? 0).toLocaleString()}</p>
                  </div>

                  <div className="w-full py-3 px-4 bg-liff-bg/50 rounded-xl border border-black/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-liff-text/40 uppercase tracking-widest">Order ID</span>
                    <span className="text-[11px] font-black font-mono">#{currentOrder?.id.slice(0, 8).toUpperCase() || orderId?.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                {/* Slip Upload Section */}
                <div className="retail-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Upload size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold tracking-tight">Upload Payment Slip</p>
                      <p className="text-[10px] text-liff-text/50">Take a screenshot of your payment confirmation</p>
                    </div>
                  </div>

                  <input
                    ref={slipInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSlipFileChange}
                    className="hidden"
                  />

                  {slipPreview ? (
                    <div className="relative mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slipPreview}
                        alt="Payment slip preview"
                        className="w-full max-h-[300px] object-contain rounded-2xl border-2 border-primary/20 bg-liff-bg"
                      />
                      <button
                        onClick={() => {
                          setSlipFile(null);
                          setSlipPreview(null);
                          if (slipInputRef.current) slipInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => slipInputRef.current?.click()}
                      className="w-full h-32 rounded-2xl border-2 border-dashed border-black/10 bg-liff-bg/50 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all mb-4 hover:border-primary/30"
                    >
                      <ImageIcon size={28} className="text-black/15" />
                      <span className="text-[11px] font-bold text-liff-text/40">Tap to select image</span>
                      <span className="text-[9px] text-liff-text/30">JPG, PNG, WebP • Max 5MB</span>
                    </button>
                  )}
                </div>

                <div className="mt-auto space-y-4">
                  <button
                    onClick={handleUploadSlip}
                    disabled={!slipFile || slipUploadMutation.isPending}
                    className="btn-primary w-full h-[58px] text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {slipUploadMutation.isPending ? (
                      <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                    ) : !slipFile ? (
                      "Select payment slip first"
                    ) : (
                      <><Upload size={18} /> Submit Payment Slip</>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStep("payment_selection")}
                      className="h-12 rounded-[16px] bg-white border border-black/5 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all text-liff-text"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      className="h-12 rounded-[16px] bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Awaiting Verification */}
            {step === "awaiting_verification" && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-30" />
                  <HourglassIcon size={40} className="text-amber-500 relative z-10" />
                </div>
                
                <h3 className="text-2xl font-black mb-3 tracking-tight">Awaiting Verification</h3>
                <p className="text-sm text-liff-text/60 max-w-[280px] leading-relaxed mb-10">
                  Your payment slip has been submitted. Our team will verify your payment shortly. You&apos;ll be notified once it&apos;s confirmed.
                </p>

                {currentOrder?.slip_image_url && (
                  <div className="w-full max-w-[280px] mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-liff-text/30 mb-3">Your Submitted Slip</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={currentOrder.slip_image_url} 
                      alt="Payment slip" 
                      className="w-full max-h-[200px] object-contain rounded-2xl border border-black/5 bg-liff-bg" 
                    />
                  </div>
                )}

                <div className="w-full space-y-3">
                  <Link 
                    href="/liff/orders" 
                    className="btn-primary w-full"
                  >
                    View My Orders
                  </Link>
                  <Link 
                    href="/liff/shop" 
                    className="w-full h-[54px] flex items-center justify-center text-sm font-bold text-liff-text-muted transition-all active:scale-95"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}

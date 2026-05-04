"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liffPaymentApi, PaymentMethod, CustomerPaymentMethod } from "@/lib/api";
import { 
  ArrowLeft,
  Plus,
  CreditCard,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Clock
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import "../../../liff.css";

export default function LiffPaymentsPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    payment_method_id: "",
    last4: "",
    brand: "",
    exp_month: 1,
    exp_year: 2025,
    is_default: false
  });

  const { data: methodsResp } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => liffPaymentApi.listMethods(),
  });
  const supportedMethods = methodsResp?.data || [];

  const { data: savedResp } = useQuery({
    queryKey: ["saved-payment-methods"],
    queryFn: () => liffPaymentApi.listSavedMethods(),
  });
  const savedMethods = savedResp?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<CustomerPaymentMethod>) => liffPaymentApi.createSavedMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
      setIsAdding(false);
      resetForm();
      toast.success("Payment method added");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => liffPaymentApi.deleteSavedMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
      toast.success("Payment method deleted");
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => liffPaymentApi.setDefaultMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
      toast.success("Default payment updated");
    }
  });

  const resetForm = () => {
    setForm({
      payment_method_id: "",
      last4: "",
      brand: "",
      exp_month: 1,
      exp_year: 2025,
      is_default: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="liff-app pb-24">
      <nav className="sticky top-0 z-50 px-6 py-5 flex justify-between items-center glass-nav border-b border-stone-100">
        <Link href="/liff/profile" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-900 border border-stone-100 shadow-sm active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Profile</span>
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">Payment Methods</h2>
        </div>
        <button 
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </nav>

      <div className="px-6 py-8">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-entrance">
            <div className="retail-card space-y-4">
              <h3 className="text-sm font-bold mb-4">Add Payment Method</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Select Method Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {supportedMethods.map((m: PaymentMethod) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method_id: m.id, brand: m.name })}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${form.payment_method_id === m.id ? 'border-primary bg-primary/5' : 'border-stone-50 bg-stone-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.payment_method_id === m.id ? 'bg-primary text-white' : 'bg-stone-200 text-stone-400'}`}>
                        <CreditCard size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-stone-900">{m.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">{m.expiry_minutes} Min Expiry</p>
                      </div>
                      {form.payment_method_id === m.id && <CheckCircle2 size={18} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock Details */}
              <div className="space-y-1 pt-2">
                 <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Card / Account Last 4 Digits</label>
                 <input 
                    value={form.last4}
                    onChange={e => setForm({ ...form, last4: e.target.value.slice(0, 4) })}
                    placeholder="1234"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                    maxLength={4}
                    required
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Exp. Month</label>
                  <select 
                    value={form.exp_month}
                    onChange={e => setForm({ ...form, exp_month: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Exp. Year</label>
                  <select 
                    value={form.exp_year}
                    onChange={e => setForm({ ...form, exp_year: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 p-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm({ ...form, is_default: e.target.checked })}
                  className="w-5 h-5 rounded-lg accent-primary"
                />
                <span className="text-sm font-bold text-stone-600">Set as primary payment</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 text-sm font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={createMutation.isPending || !form.payment_method_id}
                className="flex-2 py-5 rounded-[2rem] bg-primary text-white text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? "Connecting..." : "Add Method"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-entrance">
            <div className="px-2 mb-6">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} /> SSL Encrypted
              </div>
            </div>

            {savedMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                <CreditCard size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">No saved methods</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Ready for faster checkout</p>
              </div>
            ) : (
              savedMethods.map((m: CustomerPaymentMethod) => (
                <div key={m.id} className={`retail-card group transition-all ${m.is_default ? 'border-primary ring-1 ring-primary/10' : ''}`}>
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${m.is_default ? 'bg-primary text-white shadow-lg' : 'bg-stone-50 text-stone-400'}`}>
                           <CreditCard size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{m.brand} •••• {m.last4}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Exp {String(m.exp_month).padStart(2, '0')}/{m.exp_year}</span>
                            {m.is_default && <span className="text-[9px] font-black uppercase text-primary tracking-tighter">Primary</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                         <button 
                          onClick={() => deleteMutation.mutate(m.id)}
                          className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-red-500 active:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        {!m.is_default && (
                          <button 
                            onClick={() => setDefaultMutation.mutate(m.id)}
                            className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-primary active:bg-primary/5 rounded-xl transition-all"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                      </div>
                   </div>
                </div>
              ))
            )}

            <div className="retail-card bg-stone-50 border-dashed border-stone-200 py-10 flex flex-col items-center justify-center gap-4 mt-10">
               <div className="w-16 h-1 bg-stone-200 rounded-full" />
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-center px-10">
                 Your data is stored securely using industry standard encryption. We never store CVV codes.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

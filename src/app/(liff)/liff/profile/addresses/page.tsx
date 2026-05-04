"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi, CustomerAddress } from "@/lib/api";
import { 
  ArrowLeft,
  Plus,
  MapPin,
  Trash2,
  ChevronRight,
  Home,
  Briefcase,
  Globe
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import "../../../liff.css";

export default function LiffAddressesPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    name: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    zip_code: "",
    is_default: false
  });

  const { data: resp } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.list(),
  });
  const addresses = resp?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<CustomerAddress>) => addressesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsAdding(false);
      resetForm();
      toast.success("Address added");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<CustomerAddress> }) => addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingId(null);
      resetForm();
      toast.success("Address updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    }
  });

  const resetForm = () => {
    setForm({
      label: "",
      name: "",
      phone: "",
      address: "",
      district: "",
      province: "",
      zip_code: "",
      is_default: false
    });
  };

  const handleEdit = (addr: CustomerAddress) => {
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      district: addr.district,
      province: addr.province,
      zip_code: addr.zip_code,
      is_default: addr.is_default
    });
    setEditingId(addr.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="liff-app pb-24">
      <nav className="sticky top-0 z-50 px-6 py-5 flex justify-between items-center glass-nav border-b border-stone-100">
        <Link href="/liff/profile" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-900 border border-stone-100 shadow-sm active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Profile</span>
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">My Addresses</h2>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
          className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </nav>

      <div className="px-6 py-8">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-entrance">
            <div className="retail-card space-y-4">
              <h3 className="text-sm font-bold mb-4">{editingId ? 'Edit Address' : 'New Address'}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {['Home', 'Office', 'Other'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm({ ...form, label: l })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${form.label === l ? 'border-primary bg-primary/5 text-primary' : 'border-stone-50 bg-stone-50 text-stone-400'}`}
                  >
                    {l === 'Home' && <Home size={14} />}
                    {l === 'Office' && <Briefcase size={14} />}
                    {l === 'Other' && <Globe size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{l}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Recipient Name"
                  className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Address Detail</label>
                <textarea 
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, Building, House No."
                  className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">District</label>
                  <input 
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Province</label>
                  <input 
                    value={form.province}
                    onChange={e => setForm({ ...form, province: e.target.value })}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Zip Code</label>
                <input 
                  value={form.zip_code}
                  onChange={e => setForm({ ...form, zip_code: e.target.value })}
                  className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  required
                />
              </div>

              <label className="flex items-center gap-3 p-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm({ ...form, is_default: e.target.checked })}
                  className="w-5 h-5 rounded-lg accent-primary"
                />
                <span className="text-sm font-bold text-stone-600">Set as default address</span>
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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-2 py-5 rounded-[2rem] bg-primary text-white text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-entrance">
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                <MapPin size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">No saved addresses</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Add your first one!</p>
              </div>
            ) : (
              addresses.map((addr: CustomerAddress) => (
                <div key={addr.id} className="retail-card group">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400">
                          {addr.label === 'Home' && <Home size={18} />}
                          {addr.label === 'Office' && <Briefcase size={18} />}
                          {addr.label === 'Other' && <Globe size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{addr.label}</h4>
                          {addr.is_default && <span className="text-[9px] font-black uppercase text-primary tracking-tighter">Default Address</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                         onClick={() => deleteMutation.mutate(addr.id)}
                         className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-red-500 active:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(addr)}
                          className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-primary active:bg-primary/5 rounded-xl transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                   </div>
                   
                   <div className="pl-13 space-y-1">
                      <p className="text-sm font-bold text-stone-900">{addr.name}</p>
                      <p className="text-xs text-stone-400">{addr.phone}</p>
                      <p className="text-xs text-stone-500 leading-relaxed mt-2">{addr.address}, {addr.district}, {addr.province} {addr.zip_code}</p>
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

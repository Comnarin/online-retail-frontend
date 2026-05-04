"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { liffApi } from "@/lib/api";
import { 
  ArrowLeft,
  MapPin, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Zap,
  Star,
  Gift,
  Settings,
  ShieldCheck,
  User,
  Heart,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import "../../liff.css";

export default function LiffProfilePage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["liff-profile"],
    queryFn: async () => {
      const resp = await liffApi.profile();
      return resp.data;
    },
  });

  const handleLogout = () => {
    document.cookie = "auth_token=; max-age=0; path=/";
    document.cookie = "user_role=; max-age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <div className="liff-app pb-24">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 px-6 py-5 flex justify-between items-center glass-nav border-b border-stone-100">
        <Link href="/liff/shop" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-900 border border-stone-100 shadow-sm active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Account</span>
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">My Profile</h2>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-stone-400">
          <Settings size={20} />
        </button>
      </nav>

      <div className="animate-entrance px-6 pt-10">
        {/* Error State */}
        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 flex items-center gap-2">
            <AlertCircle size={16} />
            Failed to load profile. Please try again.
          </div>
        )}

        {/* Profile Header */}
        <section className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-[2.5rem] p-1 bg-gradient-to-tr from-primary to-orange-200 border border-white shadow-2xl">
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-stone-100 border border-white shadow-inner flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-stone-300" strokeWidth={1} />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-stone-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
              <ShieldCheck size={16} />
            </div>
          </div>
          
          <h1 className="text-3xl font-display font-black text-stone-900 italic leading-none mb-2">{profile?.name || "Guest"}</h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Verified</span>
          </div>
        </section>

        {/* Membership Card */}
        <section className="mb-12">
          <div className="bg-stone-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-stone-900/30 group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Membership</span>
                  <h2 className="text-4xl font-display font-black italic leading-[0.8] tracking-tight">
                    {profile?.membership_tier || "Member"} <br/>
                    <span className="text-stone-500">Tier.</span>
                  </h2>
                </div>
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                  <Zap size={14} className="text-primary fill-primary" />
                  <span className="text-sm font-bold uppercase">{(profile?.points_balance || 0).toLocaleString()} <span className="text-xs text-white/40">pts</span></span>
                </div>
              </div>

              <div className="mb-2 flex justify-between items-end">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Progress</span>
                <span className="text-xs text-white/50 italic">Keep collecting!</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-[2s]" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                <span>Current</span>
                <span>Next Tier</span>
              </div>
            </div>

            {/* Decorative */}
            <Star className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-45 transition-transform duration-[3s]" size={200} strokeWidth={1} />
          </div>
        </section>

        {/* Quick Links */}
        <section className="space-y-4 mb-14">
          <div className="flex items-baseline justify-between mb-4 px-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Quick Links</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <PerkCard icon={<Gift size={20} />} label="My Coupons" count={profile?.voucher_count || 0} color="blue" />
            <PerkCard icon={<Heart size={20} />} label="Favorites" count={profile?.favorites_count || 0} color="red" />
          </div>
        </section>

        {/* Settings Menu */}
        <section className="mb-14">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm divide-y divide-stone-50">
            <SettingsRow icon={<MapPin size={18} />} label="My Addresses" href="/liff/profile/addresses" />
            <SettingsRow icon={<CreditCard size={18} />} label="Payment Methods" href="/liff/profile/payments" />
            <SettingsRow icon={<Bell size={18} />} label="Notifications" badge="3" />
            <SettingsRow icon={<HelpCircle size={18} />} label="Help & Support" />
          </div>
        </section>

        <button 
          onClick={handleLogout}
          className="w-full py-8 flex items-center justify-center gap-4 text-stone-300 hover:text-red-400 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-100 transition-all">
            <LogOut size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, badge, href }: any) {
  const content = (
    <div className="flex items-center gap-5 p-6 active:bg-stone-50 transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:text-stone-900 group-hover:bg-white group-hover:shadow-sm transition-all border border-stone-50">
        {icon}
      </div>
      <span className="text-sm font-bold text-stone-900 flex-1">{label}</span>
      {badge && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">{badge}</span>}
      <ChevronRight size={16} className="text-stone-200 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function PerkCard({ icon, label, count, color }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm flex flex-col items-center group active:scale-95 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${
        color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
      } group-hover:scale-110`}>
        {icon}
      </div>
      <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xs text-stone-400">{count} items</div>
    </div>
  )
}

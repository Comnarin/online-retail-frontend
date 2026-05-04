"use client";
import { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      document.cookie = `user_role=${user.role}; path=/; max-age=86400`;
      if (user.tenant_id) document.cookie = `tenant_id=${user.tenant_id}; path=/; max-age=86400`;

      if (user.role === "superadmin") window.location.href = "/superadmin/tenants";
      else if (user.role === "tenant_admin") window.location.href = "/admin/dashboard";
      else window.location.href = "/liff/shop";
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="w-12 h-12 bg-primary flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(232,87,42,0.30)] rounded-xl">
          <Zap size={22} className="text-white fill-white" />
        </div>
        <h1 className="font-display text-[26px] font-extrabold text-main-text text-center mb-1 tracking-[-0.5px] leading-tight">Retail Platform</h1>
        <p className="text-[13px] text-text-faint text-center mb-8">Sign in to manage your store</p>

        {/* Card */}
        <div className="bg-surface border border-surface-border rounded-xl p-8 shadow-xs">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@retail.local"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pr-11 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint flex transition-colors hover:text-main-text focus:outline-none"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium animate-in slide-in-from-top-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button
                id="login-btn"
                className="inline-flex items-center gap-[6px] w-full justify-center px-4 py-2 mt-1 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)] h-11 text-[14px]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        {/* Test hint */}
        <div className="mt-5 text-center px-5 py-3.5 bg-surface border border-surface-border rounded-xl shadow-xs">
          <p className="text-[11px] text-text-faint mb-1 font-bold uppercase tracking-[0.5px]">
            Test Credentials
          </p>
          <p className="text-[13px] text-main-text font-bold">admin@retail.local / Admin@1234</p>
        </div>

        <p className="text-center mt-4 text-[12px] text-text-faint font-medium">
          สำหรับลูกค้า — เข้าผ่าน LINE LIFF
        </p>
      </div>
    </div>
  );
}

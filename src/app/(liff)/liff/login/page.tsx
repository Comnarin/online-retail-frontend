"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function LiffDevLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tenantId) {
      setStatus("error");
      setError("Missing tenantId query parameter.");
      return;
    }

    const performLogin = async () => {
      try {
        // This calls the backend which now handles transactional onboarding
        const resp = await api.auth.devLiffLogin(tenantId);
        const { token, customer } = resp.data;

        // Persist auth state
        Cookies.set("liff_auth_token", token, { expires: 30, path: "/", secure: true, sameSite: "lax" });
        Cookies.set("liff_user_role", "customer", { expires: 30, path: "/", secure: true, sameSite: "lax" });

        setStatus("success");
        
        // Success redirect: use 'redirect' param if available, fallback to shop
        const targetPath = searchParams.get("redirect") || "/liff/shop";
        
        setTimeout(() => {
          router.push(targetPath);
        }, 1500);
      } catch (err: any) {
        setStatus("error");
        setError(err.message);
      }
    };

    performLogin();
  }, [tenantId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-50">
      <div className="w-full max-w-sm bg-white p-10 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
            <h1 className="text-xl font-black text-stone-900 mb-2">Platform Bridge</h1>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Generating Customer Session...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="text-green-500" size={32} />
            </div>
            <h1 className="text-xl font-black text-stone-900 mb-2">Gate Approved</h1>
            <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Redirecting to Shop...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-black text-stone-900 mb-2">Gate Refused</h1>
            <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
            <button 
              onClick={() => router.push("/superadmin/tenants")}
              className="mt-8 px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Return to Control Panel
            </button>
          </>
        )}
      </div>
      
      <div className="mt-8 flex items-center gap-2 opacity-30 select-none">
        <div className="w-10 h-[1px] bg-stone-400" />
        <span className="text-[10px] font-black tracking-[0.2em] text-stone-400 uppercase">Dev Environment</span>
        <div className="w-10 h-[1px] bg-stone-400" />
      </div>
    </div>
  );
}

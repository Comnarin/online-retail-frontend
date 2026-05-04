"use client";

import React, { useEffect, useState, Suspense } from "react";
import liff from "@line/liff";
import { authApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { memoryBridge } from "@/lib/memory-bridge";

function AuthHandshakeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Initializing secure handshake...");

  useEffect(() => {
    const runHandshake = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
        // Robust TenantID resolution
        // LIFF redirects (liff.state) often double-encode params or nest them deeply.
        const resolveTenantId = (): string | null => {
          const rawSearch = typeof window !== "undefined" ? window.location.search : "";
          
          // Iterative decoding to handle double/triple encoding
          let currentStr = rawSearch;
          let prevStr = "";
          let depth = 0;
          while (currentStr.includes("%") && currentStr !== prevStr && depth < 3) {
            prevStr = currentStr;
            currentStr = decodeURIComponent(currentStr);
            depth++;
          }

          // Search for tenantId followed by a UUID, allowing for encoded or literal delimiters
          // Matches tenantId=..., tenantId%3D..., etc.
          const globalMatch = currentStr.match(/tenantId(?:=|%3D)([a-f0-9-]{36})/i);
          if (globalMatch) return globalMatch[1];

          // Fallback to Next.js searchParams if global search fails
          return searchParams.get("tenantId");
        };

        const tenantId = resolveTenantId();
        const redirect = searchParams.get("redirect") || "/liff/shop";

        if (!tenantId) {
          console.error("❌ [AuthBridge] Failed to resolve tenant context after deep decode:", {
            raw: typeof window !== "undefined" ? window.location.search : "",
            params: Object.fromEntries(searchParams.entries())
          });
          throw new Error("Missing tenant context. Please re-open the app from LINE.");
        }

        console.log("🧬 [AuthBridge] Initiating LIFF session bridge for Tenant:", tenantId);
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          setStatus("Redirecting to LINE Login...");
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const idToken = liff.getIDToken();
        const profile = await liff.getProfile();
        if (!idToken) throw new Error("Missing ID Token from LINE");

        setStatus("Authenticating session...");

        // POST to backend — Go handler sets HttpOnly cookie via Set-Cookie header
        // The httpClient should include credentials: 'include'
        const { data: result } = await authApi.loginWithLine({
          tenant_id: tenantId,
          line_user_id: profile.userId,
          id_token: idToken,
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
        });

        // Verify the cookie arrived by probing a lightweight endpoint
        // This ensures the browser has committed the HttpOnly cookie
        const cookieVerifyResp = await fetch("/api/auth/verify", { 
          credentials: "include" 
        });
        const cookieVerify = await cookieVerifyResp.json();

        if (!cookieVerify.verified) {
          // Cookie didn't arrive (restrictive webview) — use in-memory bridge only
          // This token lives in JS memory, no storage, no URL, no persistence
          memoryBridge.set(result.token);
          console.warn("🛡️ [AuthBridge] Cookie rejected by webview, enabling in-memory fallback");
        } else {
          console.log("🛡️ [AuthBridge] Session committed to secure cookie store");
        }

        setStatus("Complete. Entering shop...");

        // Clean redirect — no token in URL, ever
        const destination = redirect + (tenantId ? (redirect.includes('?') ? `&tenantId=${tenantId}` : `?tenantId=${tenantId}`) : "");
        window.location.replace(destination);

      } catch (err: any) {
        console.error("❌ [AuthBridge] Handshake failed:", err.message || err);
        setStatus("Authentication failed. Please check your connection.");
      }
    };

    runHandshake();
  }, []); // Only run once on mount

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f9f8f6]">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 animate-ping rounded-full bg-stone-200/50 duration-[3000ms]" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-stone-200 border-t-black" />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-medium">
          Secure Identity
        </h2>
        <p className="mt-4 text-sm font-light italic text-stone-800 tracking-wide">
          {status}
        </p>
      </div>
    </div>
  );
}

export default function AuthHandshakePage() {
  return (
    <Suspense fallback={null}>
      <AuthHandshakeContent />
    </Suspense>
  );
}

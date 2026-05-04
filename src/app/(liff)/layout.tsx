import { liffApi, StoreAppearance } from "@/lib/api";
import { NavIsland } from "@/components/shared/NavIsland";
import { cache } from "react";
import "./liff.css";

// React.cache deduplicates this call within the same server render pass.
// Both layout.tsx and shop/page.tsx can call this without triggering 2 API requests.
export const getCachedAppearance = cache(async (): Promise<StoreAppearance | null> => {
  try {
    const resp = await liffApi.appearance();
    return resp.data;
  } catch {
    return null;
  }
});

export default async function LiffLayout({ children }: { children: React.ReactNode }) {
  // LiffLayout only renders if middleware.ts has validated the session
  // or allowed the route (like /liff/auth)

  const storeAppearance = await getCachedAppearance();
  const primaryColor = storeAppearance?.appearance?.primary_color || "#09090b";

  return (
    <div 
      className="liff-app relative min-h-[100dvh] bg-stone-50"
      style={{
        "--primary": primaryColor,
        "--primary-light": `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
      } as React.CSSProperties}
    >
      <main className="min-h-[100dvh] pb-32 selection:bg-[var(--primary)] selection:text-white">
        {children}
      </main>
      
      {/* Client-side Navigation Component */}
      <NavIsland />
    </div>
  );
}

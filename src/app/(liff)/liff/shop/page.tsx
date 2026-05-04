import { liffApi } from "@/lib/api";
import { getCachedAppearance } from "../../layout";
import { ProductList } from "@/components/shared/ProductList";
import "../../liff.css";
import { LiffHeader } from "@/components/liff/LiffHeader";
import { ShopHero } from "@/components/liff/ShopHero";
import { cookies } from "next/headers";

export default async function LiffShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ category?: string; tenantId?: string }> 
}) {
  const { category } = await searchParams;

  const cookieStore = await cookies();
  const hasToken = cookieStore.get("liff_auth_token") || cookieStore.get("auth_token");

  // If no token, the Layout will show the Loading Screen.
  // We return early here to avoid unauthenticated API calls on the server.
  if (!hasToken) {
    return null;
  }

  let products: any[] = [];
  let categories: any[] = [];
  let shopName = "Elite Shop";
  let appearance: any = {};

  try {
    // Products & categories are page-specific; appearance is shared with layout via React.cache
    const [productsResp, categoriesResp, appearanceData] = await Promise.all([
      liffApi.products({ limit: 100, category }),
      liffApi.categories(),
      getCachedAppearance()
    ]);

    products = productsResp.data;
    categories = categoriesResp.data;
    shopName = appearanceData?.name || "Elite Shop";
    appearance = appearanceData?.appearance || {};
  } catch (err: any) {
    console.error("❌ [LiffShopPage] Storefront Fetch Error:", err.message || err);
  }

  // Shop configurations with high-fidelity fallbacks
  const shopTitle = appearance?.shop_title || "Elite Collection";
  const shopDescription = appearance?.shop_description || "Experience luxury through our meticulously selected pieces, designed for the modern connoisseur.";
  const shopHeroURL = appearance?.shop_hero_url || "/images/shop-hero.png";

  return (
    <div className="pb-40 bg-[#f9f8f6] min-h-[100dvh]">
      <LiffHeader shopName={shopName} categories={categories} />

      <main className="px-6">
        <ShopHero 
          shopTitle={shopTitle}
          shopDescription={shopDescription}
          shopHeroURL={shopHeroURL}
        />

        {/* Discovery Section (Search, Tabs, Grid) */}
        <ProductList initialProducts={products} categories={categories} />
      </main>
    </div>
  );
}

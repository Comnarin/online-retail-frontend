import { redirect } from "next/navigation";

/**
 * LIFF Landing Page (Entry Gate).
 * This page exists to provide a valid route for the base /liff path
 * as configured in the LINE Developers Console.
 * 
 * The proxy.ts middleware will intercept unauthenticated requests to this path
 * and redirect to /liff/auth. If a user is already logged in, they will be
 * redirected to the shop.
 */
export default function LiffLandingPage() {
  // Satisfy the Next.js router. Middleware performs the actual gating.
  redirect("/liff/shop");
}
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Suspense } from "react";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Retail Platform",
    template: "%s | Retail Platform",
  },
  description: "Multi-tenant retail management system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallel fetch locale and messages to reduce blocking time
  const [locale, messages] = await Promise.all([
    getLocale(),
    getMessages()
  ]);

  return (
    <html lang={locale} className={`${plusJakartaSans.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-body bg-main-bg text-main-text leading-relaxed antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Suspense fallback={<div className="min-h-screen bg-main-bg" />}>
              {children}
            </Suspense>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

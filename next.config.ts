import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  allowedDevOrigins: ["*.trycloudflare.com"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://backend:4001/api/v1/:path*",
      },
      {
        source: "/products/:path*",
        destination: "http://backend:4001/products/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);

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
    // Inside the Docker network, use the service name 'backend'
    // In the browser, use the public IP
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://backend:4001";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/products/:path*",
        destination: `${backendUrl}/products/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

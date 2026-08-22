import type { NextConfig } from "next";
import { CATALOG_REDIRECTS } from "./src/content/catalog";
import {
  IMMUTABLE_UPLOAD_CACHE_CONTROL,
  PRIVATE_CACHE_CONTROL,
  PUBLIC_ASSET_CACHE_CONTROL,
} from "./src/lib/cache";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["exceljs"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE_CONTROL }],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_UPLOAD_CACHE_CONTROL }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/cart",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/cart/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/checkout",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/checkout/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/order/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/shop",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/shop/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/p/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/c/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/search",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/login",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/login/:path*",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
      {
        source: "/register",
        headers: [{ key: "Cache-Control", value: PRIVATE_CACHE_CONTROL }],
      },
    ];
  },
  async redirects() {
    return CATALOG_REDIRECTS.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: true,
    }));
  },
};

export default nextConfig;

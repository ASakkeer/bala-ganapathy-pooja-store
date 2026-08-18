import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/cart", "/checkout", "/account", "/api/", "/login", "/order"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}

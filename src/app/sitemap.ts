import type { MetadataRoute } from "next";
import { POLICY_LINKS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site";
import { listCatalog, listCategories } from "@/server/queries/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, catalog] = await Promise.all([
    listCategories(),
    listCatalog({ page: 1, pageSize: 500 }),
  ]);

  const staticPages = [
    "/",
    "/shop",
    "/about",
    "/contact",
    ...POLICY_LINKS.map((link) => link.href),
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));

  const categoryPages = categories.map((category) => ({
    url: absoluteUrl(`/c/${category.slug}`),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productPages = catalog.items.map((product) => ({
    url: absoluteUrl(`/p/${product.slug}`),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

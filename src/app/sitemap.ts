import type { MetadataRoute } from "next";
import { POLICY_LINKS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site";
import { listCatalog, listCategories } from "@/server/queries/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, catalog] = await Promise.all([
    listCategories(),
    listCatalog({ page: 1, pageSize: 500 }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/shop",
    "/about",
    "/contact",
    ...POLICY_LINKS.map((link) => link.href),
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/c/${category.slug}`),
    lastModified: category.createdAt ?? new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = catalog.items.map((product) => {
    const image = product.images[0] ? absoluteUrl(product.images[0]) : undefined;
    return {
      url: absoluteUrl(`/p/${product.slug}`),
      lastModified: product.updatedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
      ...(image ? { images: [image] } : {}),
    };
  });

  return [...staticPages, ...categoryPages, ...productPages];
}

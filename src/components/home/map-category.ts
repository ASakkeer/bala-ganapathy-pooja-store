import { CATEGORIES } from "@/content/catalog";
import type { ListedProduct } from "@/server/queries/products";

export type CategoryDiscovery = {
  name: string;
  nameTa?: string;
  shortName: string;
  slug: string;
  href: string;
  imageSrc?: string;
  imageAlt: string;
  blurb?: string;
};

export function toCategoryDiscoveries(
  categories: Array<{ name: string; slug: string; image?: string | null }>,
  products: ListedProduct[],
): CategoryDiscovery[] {
  return categories.map((category) => {
    const meta = CATEGORIES.find((item) => item.slug === category.slug);
    const product = products.find((item) => item.category?.slug === category.slug && item.images[0]);

    return {
      name: category.name,
      nameTa: meta?.nameTa,
      shortName: meta?.shortName ?? category.name,
      slug: category.slug,
      href: `/c/${category.slug}`,
      imageSrc: category.image || product?.images[0] || undefined,
      imageAlt: category.name,
      blurb: meta?.blurb,
    };
  });
}

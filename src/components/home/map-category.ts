import { CATEGORIES } from "@/content/catalog";

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
): CategoryDiscovery[] {
  return categories.map((category) => {
    const meta = CATEGORIES.find((item) => item.slug === category.slug);

    return {
      name: category.name,
      nameTa: meta?.nameTa,
      shortName: meta?.shortName ?? category.name,
      slug: category.slug,
      href: `/c/${category.slug}`,
      imageSrc: category.image || undefined,
      imageAlt: category.name,
      blurb: meta?.blurb,
    };
  });
}

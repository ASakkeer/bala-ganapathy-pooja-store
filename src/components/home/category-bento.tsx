import Image from "next/image";
import Link from "next/link";
import type { CategoryDiscovery } from "@/components/home/map-category";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { copy } from "@/content/copy";

const FEATURED_SLUG = "ganapathy-homam";
const TILE_ORDER = [
  "ganapathy-homam",
  "navagraha-homam",
  "kumbabishekam",
  "pooja-essentials",
  "naattu-marundhu",
] as const;

function tileFor(
  categories: CategoryDiscovery[],
  slug: string,
): CategoryDiscovery | undefined {
  return categories.find((category) => category.slug === slug);
}

export function CategoryBento({ categories }: { categories: CategoryDiscovery[] }) {
  const featured =
    tileFor(categories, FEATURED_SLUG) ??
    tileFor(categories, TILE_ORDER[0]) ??
    categories[0];
  const rest = TILE_ORDER.map((slug) => tileFor(categories, slug)).filter(
    (category): category is CategoryDiscovery =>
      category !== undefined && category.slug !== featured?.slug,
  );

  if (!featured) {
    return null;
  }

  return (
    <nav aria-label="Shop by ritual">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="font-label-caps mb-2 block tracking-wider text-on-surface-variant">
            {copy.shopByRitualEyebrow}
          </span>
          <h2 className="relative inline-block font-serif text-headline-lg text-on-surface">
            {copy.shopByRitual}
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex"
        >
          {copy.exploreCategories}
          <Icon name="chevron-right" className="text-[0.85rem]" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-grid-gutter md:h-[600px] md:grid-cols-4 md:grid-rows-2">
        <BentoTile category={featured} featured />
        {rest.map((category) => (
          <BentoTile key={category.slug} category={category} />
        ))}
      </div>
    </nav>
  );
}

function BentoTile({
  category,
  featured = false,
}: {
  category: CategoryDiscovery;
  featured?: boolean;
}) {
  return (
    <Link
      href={category.href}
      className={cn(
        "group relative min-h-[16rem] overflow-hidden rounded-home shadow-sm transition-all duration-300 hover:shadow-lg",
        featured && "md:col-span-2 md:row-span-2 md:min-h-0",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 transition-colors",
          featured ? "bg-black/20 group-hover:bg-black/10" : "bg-black/10 group-hover:bg-black/0",
        )}
      />
      {category.imageSrc ? (
        <Image
          src={category.imageSrc}
          alt={category.imageAlt}
          fill
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="size-full bg-primary-container" />
      )}
      <div
        className={cn(
          "absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black/80 to-transparent",
          featured ? "p-8" : "p-6",
        )}
      >
        <h3
          className={cn(
            "mb-1 font-semibold text-white",
            featured ? "font-serif text-headline-sm" : "text-lg",
          )}
        >
          {category.slug === "pooja-essentials" ? "Daily Pooja" : category.name}
        </h3>
        <p className="text-sm text-white/80">
          {featured && category.slug === "ganapathy-homam"
            ? `${category.nameTa ?? "கணபதி ஹோமம்"} • Everything you need for an auspicious beginning`
            : category.nameTa}
        </p>
      </div>
    </Link>
  );
}

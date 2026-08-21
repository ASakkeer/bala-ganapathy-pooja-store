import Image from "next/image";
import Link from "next/link";
import type { CategoryDiscovery } from "@/components/home/map-category";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeContent } from "@/content/home-content";
import {
  HOME_RITUAL_FEATURED_SLUG,
  HOME_RITUAL_SLUGS,
  type HomeRitualSlug,
} from "@/content/home-rituals";
import { cn } from "@/lib/cn";

function BentoHeading({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta: string;
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <span className="font-label-caps mb-2 block tracking-wider text-on-surface-variant">
            {eyebrow}
          </span>
        ) : null}
        {title ? (
          <h2 className="relative inline-block font-serif text-headline-lg text-on-surface">{title}</h2>
        ) : null}
      </div>
      {cta ? (
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex"
        >
          {cta}
          <Icon name="chevron-right" className="text-[0.85rem]" />
        </Link>
      ) : null}
    </div>
  );
}

function tileFor(
  categories: CategoryDiscovery[],
  slug: string,
): CategoryDiscovery | undefined {
  return categories.find((category) => category.slug === slug);
}

export function CategoryBento({
  categories,
  content,
}: {
  categories: CategoryDiscovery[];
  content: Pick<HomeContent, "ritualEyebrow" | "ritualTitle" | "ritualCta" | "ritualTiles">;
}) {
  const featured = tileFor(categories, HOME_RITUAL_FEATURED_SLUG);
  const restSlugs = HOME_RITUAL_SLUGS.filter((slug) => slug !== HOME_RITUAL_FEATURED_SLUG);

  return (
    <nav aria-label="Shop by ritual">
      <BentoHeading eyebrow={content.ritualEyebrow} title={content.ritualTitle} cta={content.ritualCta} />
      <div className="grid grid-cols-1 gap-grid-gutter md:h-[600px] md:grid-cols-4 md:grid-rows-2">
        {featured ? (
          <BentoTile
            category={featured}
            featured
            overlay={content.ritualTiles[HOME_RITUAL_FEATURED_SLUG]}
          />
        ) : (
          <BentoTileSkeleton featured />
        )}
        {restSlugs.map((slug) => {
          const category = tileFor(categories, slug);
          return category ? (
            <BentoTile key={slug} category={category} overlay={content.ritualTiles[slug]} />
          ) : (
            <BentoTileSkeleton key={slug} />
          );
        })}
      </div>
    </nav>
  );
}

function BentoTile({
  category,
  featured = false,
  overlay,
}: {
  category: CategoryDiscovery;
  featured?: boolean;
  overlay: HomeContent["ritualTiles"][HomeRitualSlug];
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
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      <div
        className={cn(
          "absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black/80 to-transparent",
          featured ? "p-8" : "p-6",
        )}
      >
        {overlay.title ? (
          <h3
            className={cn(
              "mb-1 font-semibold text-white",
              featured ? "font-serif text-headline-sm" : "text-lg",
            )}
          >
            {overlay.title}
          </h3>
        ) : null}
        {overlay.subtitle ? <p className="text-sm text-white/80">{overlay.subtitle}</p> : null}
      </div>
    </Link>
  );
}

function BentoTileSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "relative min-h-[16rem] overflow-hidden rounded-home",
        featured && "md:col-span-2 md:row-span-2 md:min-h-0",
      )}
    >
      <Skeleton className="absolute inset-0 rounded-home" />
    </div>
  );
}

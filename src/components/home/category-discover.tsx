import Image from "next/image";
import Link from "next/link";
import type { CategoryDiscovery } from "@/components/home/map-category";

export function CategoryDiscover({ categories }: { categories: CategoryDiscovery[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Shop by category">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
            Start here
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight md:text-4xl">
            Shop by need
          </h2>
        </div>
        <Link
          href="/shop"
          className="mb-1 inline-flex min-h-11 shrink-0 items-center text-sm text-brand hover:underline"
        >
          All products
        </Link>
      </div>

      <ul className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((category) => (
          <li key={category.slug} className="w-[7.5rem] shrink-0 snap-start sm:w-auto">
            <Link
              href={category.href}
              className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <div className="relative aspect-square overflow-hidden bg-[#efe4d4]">
                {category.imageSrc ? (
                  <Image
                    src={category.imageSrc}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 12vw, (min-width: 640px) 22vw, 120px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div className="flex size-full items-end bg-[linear-gradient(160deg,#efe4d4,#e4d0b8)] p-3">
                    <span className="font-serif text-brand/35">{category.shortName}</span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium leading-snug text-text group-hover:text-brand">
                {category.shortName}
              </span>
              {category.nameTa ? (
                <span className="font-tamil line-clamp-1 text-xs text-muted">{category.nameTa}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

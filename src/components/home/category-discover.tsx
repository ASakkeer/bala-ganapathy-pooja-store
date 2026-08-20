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
            Browse
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight md:text-4xl">
            Shop by category
          </h2>
        </div>
        <Link
          href="/shop"
          className="mb-1 inline-flex min-h-11 shrink-0 items-center text-sm text-brand hover:underline"
        >
          All products
        </Link>
      </div>

      <ul className="mt-8 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <li key={category.slug} className="w-[10.5rem] shrink-0 snap-start sm:w-auto">
            <Link
              href={category.href}
              className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <div className="overflow-hidden bg-[#efe4d4]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {category.imageSrc ? (
                    <Image
                      src={category.imageSrc}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 168px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <div className="flex size-full items-end bg-[linear-gradient(160deg,#efe4d4,#e4d0b8)] p-3">
                      <span className="font-serif text-brand/35">{category.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="mt-3 text-sm font-medium leading-snug text-text group-hover:text-brand">
                {category.name}
              </span>
              {category.nameTa ? (
                <span className="font-tamil mt-0.5 line-clamp-1 text-xs text-muted">
                  {category.nameTa}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

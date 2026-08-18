import Image from "next/image";
import Link from "next/link";
import type { CategoryDiscovery } from "@/components/home/map-category";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { buttonClassName } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";

export function CategoryGrid({ categories }: { categories: CategoryDiscovery[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <FullBleed className="bg-surface">
      <Container>
        <section className="py-14 md:py-20">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
            {copy.featuredAisles}
          </p>
          <h2 className="mt-2 max-w-xl font-serif text-3xl font-medium tracking-tight md:text-4xl">
            {copy.featuredAislesTitle}
          </h2>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <article className="flex h-full flex-col">
                  <Link
                    href={category.href}
                    className="group relative block min-h-52 overflow-hidden sm:min-h-64"
                  >
                    {category.imageSrc ? (
                      <Image
                        src={category.imageSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(160deg,#efe4d4,#d9c4a8)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241c18]/75 via-[#241c18]/15 to-transparent" />
                  </Link>
                  <div className={cn("flex flex-1 flex-col pt-4", category.slug === "naattu-marundhu" && "border-l-2 border-[#2f5d3a]/30 pl-4")}>
                    <h3 className="font-serif text-2xl font-medium tracking-tight">{category.name}</h3>
                    {category.nameTa ? (
                      <p className="font-tamil mt-1 text-sm text-muted">{category.nameTa}</p>
                    ) : null}
                    {category.blurb ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{category.blurb}</p>
                    ) : null}
                    <Link
                      href={category.href}
                      className={`${buttonClassName("secondary")} mt-4 w-fit px-4`}
                    >
                      {copy.explore}
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </FullBleed>
  );
}

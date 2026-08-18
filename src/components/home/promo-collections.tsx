import Image from "next/image";
import Link from "next/link";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { buttonClassName } from "@/components/ui/button";

export type PromoPanel = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  imageSrc?: string;
  imageAlt: string;
};

export function PromoCollections({ panels }: { panels: PromoPanel[] }) {
  const visible = panels.filter((panel) => panel.href);

  if (visible.length === 0) {
    return null;
  }

  return (
    <FullBleed>
      <Container>
        <section className="py-14 md:py-20">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
            Homam collections
          </p>
          <h2 className="mt-2 max-w-xl font-serif text-3xl font-medium tracking-tight md:text-4xl">
            Ganapathy Homam and Navagraha Homam
          </h2>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted">
            Shop-packed kits and samagri commonly sold for these homams. Confirm contents at the
            counter — this is not a priest’s required list.
          </p>

          <ul
            className={
              visible.length === 1
                ? "mt-10"
                : "mt-10 grid gap-4 lg:grid-cols-2 lg:gap-5"
            }
          >
            {visible.map((panel) => (
              <li key={panel.href} className="relative min-h-72 overflow-hidden sm:min-h-80">
                {panel.imageSrc ? (
                  <Image
                    src={panel.imageSrc}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#3d1016]" />
                )}
                <div className="absolute inset-0 bg-[#241c18]/55" />
                <div className="relative flex h-full min-h-72 flex-col justify-end p-6 text-on-brand sm:min-h-80 sm:p-8">
                  <p className="font-tamil text-sm text-accent">
                    {panel.eyebrow}
                  </p>
                  <h3 className="mt-3 font-serif text-3xl font-medium tracking-tight">
                    {panel.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-on-brand/80">
                    {panel.body}
                  </p>
                  <Link href={panel.href} className={`${buttonClassName("inverse")} mt-6 w-fit`}>
                    {panel.cta}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </FullBleed>
  );
}

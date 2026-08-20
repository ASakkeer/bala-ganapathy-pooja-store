import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CATEGORIES } from "@/lib/constants";
import { whatsappHref as toWhatsappHref } from "@/lib/contact";

export function SearchEmpty({
  title,
  description,
  whatsapp,
}: {
  title: string;
  description: string;
  whatsapp?: string | null;
}) {
  const whatsappHref = toWhatsappHref(whatsapp);

  return (
    <div className="py-12 text-center md:py-16">
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"
      >
        <Icon name="magnifying-glass" className="text-xl" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/c/${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full bg-brand/[0.07] px-4 text-sm text-text transition-colors hover:bg-brand hover:text-on-brand"
            >
              {category.shortName}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className={buttonClassName("primary")}>
          All products
        </Link>
        {whatsappHref ? (
          <a href={whatsappHref} className={buttonClassName("secondary")}>
            <Icon name="whatsapp" kit="brands" className="text-sm" />
            WhatsApp the shop
          </a>
        ) : (
          <Link href="/c/pooja-essentials" className={buttonClassName("secondary")}>
            Shop pooja essentials
          </Link>
        )}
      </div>
    </div>
  );
}

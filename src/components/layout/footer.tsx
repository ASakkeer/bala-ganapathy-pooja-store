import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { Icon } from "@/components/ui/icon";
import { formatListedPhone, listedPhones, telHref } from "@/lib/contact";
import { mapsDirectionsHref, SHOP_ADDRESS, SHOP_ADDRESS_LINES } from "@/lib/maps";
import {
  CATEGORIES,
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_SUPPORT_LINKS,
  STORE_NAME,
} from "@/lib/constants";

const shopLinks = [
  { name: "All Products", href: "/shop" },
  ...CATEGORIES.map((category) => ({
    name: category.name,
    href: `/c/${category.slug}`,
  })),
];

type FooterProps = {
  address?: string | null;
  hours?: string | null;
  phones?: string[] | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
};

function addressLines(value?: string | null) {
  const text = value?.trim();
  if (!text) {
    return [...SHOP_ADDRESS_LINES];
  }

  const compact = text.replace(/\s+/g, " ").replace(/[.,]/g, "").toLowerCase();
  const shop = SHOP_ADDRESS.replace(/\s+/g, " ").replace(/[.,]/g, "").toLowerCase();
  if (compact.includes("641001") && (compact === shop || compact.includes("thiyagaraya"))) {
    return [...SHOP_ADDRESS_LINES];
  }

  if (text.includes("\n")) {
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [text];
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ name: string; href: string }>;
}) {
  return (
    <nav aria-label={title} className="min-w-0">
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] uppercase text-on-primary">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={`${link.href}-${link.name}`}>
            <Link
              href={link.href}
              className="inline-flex min-h-8 items-center text-sm leading-5 break-words text-on-primary/80 transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-fixed"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ address, phones, mapUrl }: FooterProps) {
  const numbers = listedPhones(phones);
  const lines = addressLines(address);
  const directionsHref = mapsDirectionsHref(mapUrl, address);
  const year = new Date().getFullYear();

  const addressBlock = lines.length ? (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-2.5">
      <Icon name="location-dot" className="mt-0.5 text-[0.8rem] text-tertiary-fixed" />
      {directionsHref ? (
        <a
          href={directionsHref}
          className="min-w-0 text-sm leading-5 break-words text-on-primary/80 transition-colors hover:text-on-primary"
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </a>
      ) : (
        <p className="min-w-0 text-sm leading-5 break-words text-on-primary/80">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      )}
    </div>
  ) : null;

  return (
    <footer className="mt-auto overflow-x-clip bg-primary text-on-primary">
      <div className="px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(16rem,20rem)_repeat(4,minmax(0,1fr))] lg:gap-x-12 lg:px-8">
        <div className="flex min-w-0 flex-col gap-3 lg:pr-8">
          <Link
            href="/"
            aria-label={STORE_NAME}
            className="inline-flex w-fit max-w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-fixed"
          >
            <StoreLogo size="footer" decorative className="max-w-full" />
          </Link>
          {addressBlock}
          {numbers.length ? (
            <div className="flex flex-col gap-1.5">
              {numbers.map((phone) => (
                <a
                  key={phone}
                  href={telHref(phone)}
                  className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-x-2.5 text-sm leading-5 text-on-primary/80 transition-colors hover:text-on-primary"
                >
                  <Icon name="phone" className="text-[0.8rem] text-tertiary-fixed" />
                  <span className="min-w-0 break-words">{formatListedPhone(phone)}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:mt-0 lg:contents">
          <FooterNav title="Shop" links={shopLinks} />
          <FooterNav title="Help" links={FOOTER_SUPPORT_LINKS} />
          <FooterNav title="Company" links={FOOTER_COMPANY_LINKS} />
          <FooterNav title="Policies" links={FOOTER_LEGAL_LINKS} />
        </div>
      </div>

      <div className="border-t border-on-primary/20 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-center text-xs leading-5 text-on-primary/55">
          © {year} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { formatListedPhone, listedPhones, telHref, whatsappHref } from "@/lib/contact";
import { mapsDirectionsHref } from "@/lib/maps";
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

const headingClassName = "text-sm font-semibold leading-6 text-on-brand";

const linkClassName =
  "inline-flex items-center text-sm leading-6 text-on-brand/70 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type FooterProps = {
  address?: string | null;
  hours?: string | null;
  phones?: string[] | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
};

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ name: string; href: string }>;
}) {
  return (
    <nav aria-label={title}>
      <p className={headingClassName}>{title}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.name}`}>
            <Link href={link.href} className={linkClassName}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function addressLines(value?: string | null) {
  const text = value?.trim();
  if (!text) {
    return [];
  }

  if (text.includes("\n")) {
    return text
      .split(/\n+/)
      .map((line) => line.replace(/,$/, "").trim())
      .filter(Boolean);
  }

  return text
    .split(",")
    .map((line) => line.trim())
    .filter(Boolean);
}

function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3">
      <span
        aria-hidden
        className="flex h-6 w-5 items-center justify-center text-[0.8125rem] text-accent"
      >
        {icon}
      </span>
      <div className="min-w-0 text-sm leading-6 text-on-brand/75">{children}</div>
    </div>
  );
}

export function Footer({ address, hours, phones, whatsapp, mapUrl }: FooterProps) {
  const numbers = listedPhones(phones);
  const lines = addressLines(address);
  const hourLines = addressLines(hours);
  const chatHref = whatsappHref(whatsapp);
  const directionsHref = mapsDirectionsHref(mapUrl, address);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#2a1c18] text-on-brand">
      <Container className="py-16 lg:py-[4.5rem]">
        <div className="grid grid-cols-2 items-start gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-[minmax(16rem,1.35fr)_repeat(4,minmax(0,1fr))] lg:gap-x-10 lg:gap-y-0">
          <div className="col-span-2 sm:col-span-3 lg:col-auto">
            <Link
              href="/"
              aria-label={STORE_NAME}
              className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <StoreLogo size="footer" className="h-14 max-w-[16rem]" decorative />
            </Link>

            <div className="mt-8 flex max-w-xs flex-col gap-4">
              {lines.length ? (
                <ContactRow icon={<Icon name="location-dot" />}>
                  {directionsHref ? (
                    <a
                      href={directionsHref}
                      className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </a>
                  ) : (
                    lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))
                  )}
                </ContactRow>
              ) : null}

              {numbers.map((phone) => (
                <ContactRow key={phone} icon={<Icon name="phone" />}>
                  <a
                    href={telHref(phone)}
                    className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {formatListedPhone(phone)}
                  </a>
                </ContactRow>
              ))}

              {hourLines.length ? (
                <ContactRow icon={<Icon name="clock" kit="regular" />}>
                  {hourLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </ContactRow>
              ) : null}

              {chatHref ? (
                <ContactRow icon={<Icon name="whatsapp" kit="brands" />}>
                  <a
                    href={chatHref}
                    className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    WhatsApp
                  </a>
                </ContactRow>
              ) : null}
            </div>
          </div>

          <FooterLinkGroup title="Shop" links={shopLinks} />
          <FooterLinkGroup title="Customer Support" links={FOOTER_SUPPORT_LINKS} />
          <FooterLinkGroup title="Information" links={FOOTER_COMPANY_LINKS} />
          <FooterLinkGroup title="Policies" links={FOOTER_LEGAL_LINKS} />
        </div>

        <div className="mt-14 border-t border-on-brand/15 pt-6 lg:mt-16">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs leading-5 text-on-brand/45">
              © {year} {STORE_NAME}. All rights reserved.
            </p>
            <a
              href="#top"
              aria-label="Back to top"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-on-brand/10 text-on-brand/80 transition-colors hover:bg-on-brand/16 hover:text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Icon name="chevron-up" className="text-xs" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { Container } from "@/components/ui/container";
import { listedPhones, whatsappHref } from "@/lib/contact";
import {
  CATEGORIES,
  HELP_LINKS,
  POLICY_LINKS,
  STORE_NAME,
} from "@/lib/constants";

const footerLinkClassName =
  "inline-flex min-h-10 items-center text-sm text-on-brand/70 transition-colors hover:text-on-brand";

type FooterProps = {
  address?: string | null;
  hours?: string | null;
  phones?: string[] | null;
  whatsapp?: string | null;
};

export function Footer({ address, hours, phones, whatsapp }: FooterProps) {
  const numbers = listedPhones(phones);
  const chatHref = whatsappHref(whatsapp);
  const hasVisitLine = Boolean(address?.trim() || hours?.trim() || numbers.length || chatHref);

  return (
    <footer className="mt-auto bg-[#2a1c18] text-on-brand">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <StoreLogo size="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-brand/70">
              A neighbourhood pooja shop in R.S. Puram — samagri, homam materials, and naattu
              marundhu.
            </p>
            <div className="mt-6 max-w-xs space-y-2 text-sm leading-relaxed text-on-brand/70">
              {hasVisitLine ? (
                <>
                  {address?.trim() ? <p>{address}</p> : null}
                  {hours?.trim() ? <p>{hours}</p> : null}
                  {numbers.map((phone) => (
                    <p key={phone}>
                      <a href={`tel:${phone}`} className="text-on-brand hover:underline">
                        {phone}
                      </a>
                    </p>
                  ))}
                  {chatHref ? (
                    <p>
                      <a href={chatHref} className="text-on-brand hover:underline">
                        WhatsApp
                      </a>
                    </p>
                  ) : null}
                </>
              ) : (
                <p>Address and phone will appear here once added in store settings.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.16em] uppercase text-accent">Shop</p>
            <ul className="mt-4 flex flex-col">
              <li>
                <Link href="/shop" className={footerLinkClassName}>
                  All products
                </Link>
              </li>
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link href={`/c/${category.slug}`} className={footerLinkClassName}>
                    {category.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.16em] uppercase text-accent">
              Customer support
            </p>
            <ul className="mt-4 flex flex-col">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClassName}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.16em] uppercase text-accent">
              Policies
            </p>
            <ul className="mt-4 flex flex-col">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClassName}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-on-brand/10 pt-6 text-xs text-on-brand/50">
          {STORE_NAME}
        </p>
      </Container>
    </footer>
  );
}

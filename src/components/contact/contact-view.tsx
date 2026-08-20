import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { STORE_NAME } from "@/lib/constants";
import {
  firstPhone,
  formatListedPhone,
  listedPhones,
  telHref,
  whatsappHref,
} from "@/lib/contact";
import { copy } from "@/content/copy";
import {
  isGoogleMapsEmbedUrl,
  mapsDirectionsHref,
  mapsEmbedUrlFromAddress,
} from "@/lib/maps";
import { absoluteUrl } from "@/lib/site";

type ContactViewProps = {
  address?: string | null;
  hours?: string | null;
  phones?: string[] | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
};

function IconFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ContactJsonLd({
  address,
  phones,
  whatsapp,
}: {
  address?: string | null;
  phones: string[];
  whatsapp?: string | null;
}) {
  const chatHref = whatsappHref(whatsapp);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: `Contact | ${STORE_NAME}`,
        url: absoluteUrl("/contact"),
        mainEntity: {
          "@type": "LocalBusiness",
          name: STORE_NAME,
          url: absoluteUrl("/"),
          telephone: phones.map((phone) => telHref(phone).replace("tel:", "")),
          ...(address?.trim() ? { address: address.trim() } : {}),
          ...(chatHref ? { sameAs: [chatHref] } : {}),
        },
      }}
    />
  );
}

export function ContactView({
  address,
  hours,
  phones,
  whatsapp,
  mapUrl,
}: ContactViewProps) {
  const numbers = listedPhones(phones);
  const primaryPhone = firstPhone(phones);
  const chatHref = whatsappHref(whatsapp);
  const embedUrl = isGoogleMapsEmbedUrl(mapUrl) ? mapUrl : mapsEmbedUrlFromAddress(address);
  const directionsHref = mapsDirectionsHref(mapUrl, address);
  const hasDetails = Boolean(address?.trim() || hours?.trim() || numbers.length || chatHref);

  return (
    <div className="flex flex-col gap-8 py-8 md:gap-10 md:py-12">
      <ContactJsonLd address={address} phones={numbers} whatsapp={whatsapp} />

      <header className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-2xl">
            <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
              {copy.physicalShop}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight md:text-5xl">Contact</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {chatHref
                ? "Call, WhatsApp, or walk in. Use the numbers on this page for homam and kumbabishekam quantities before you visit."
                : "Call or walk in. Use the numbers on this page for homam and kumbabishekam quantities before you visit."}
            </p>
          </div>
          <p className="shrink-0 text-sm text-muted sm:pb-1 sm:text-right">{copy.storeLocationLine}</p>
        </div>
      </header>

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)] lg:gap-6">
        <section className="flex flex-col overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
          <header className="border-b border-border/80 px-5 py-4 sm:px-6">
            <h2 className="font-medium tracking-tight text-text">The shop</h2>
            <p className="mt-1 text-sm text-muted">{STORE_NAME}</p>
          </header>

          {hasDetails ? (
            <dl className="flex-1 divide-y divide-border/80">
              {address?.trim() ? (
                <div className="flex gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <IconFrame>
                    <Icon name="location-dot" />
                  </IconFrame>
                  <div className="min-w-0">
                    <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-text sm:text-[0.95rem]">
                      {address.trim()}
                    </dd>
                  </div>
                </div>
              ) : null}

              {hours?.trim() ? (
                <div className="flex gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <IconFrame>
                    <Icon name="clock" kit="regular" />
                  </IconFrame>
                  <div className="min-w-0">
                    <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                      Hours
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-text sm:text-[0.95rem]">
                      {hours.trim()}
                    </dd>
                  </div>
                </div>
              ) : null}

              {numbers.length > 0 ? (
                <div className="flex gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <IconFrame>
                    <Icon name="phone" />
                  </IconFrame>
                  <div className="min-w-0">
                    <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                      Phone
                    </dt>
                    <dd>
                      <ul className="mt-1 flex flex-col">
                        {numbers.map((phone) => (
                          <li key={phone}>
                            <a
                              href={telHref(phone)}
                              className="inline-flex min-h-11 items-center text-sm font-medium text-brand hover:underline sm:text-[0.95rem]"
                            >
                              {formatListedPhone(phone)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </div>
              ) : null}

              {chatHref ? (
                <div className="flex gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <IconFrame className="bg-[#128C7E]/12 text-[#128C7E]">
                    <Icon name="whatsapp" kit="brands" />
                  </IconFrame>
                  <div className="min-w-0">
                    <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                      WhatsApp
                    </dt>
                    <dd>
                      <a
                        href={chatHref}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-[#128C7E] hover:underline sm:text-[0.95rem]"
                      >
                        Message on WhatsApp
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="flex-1 px-5 py-6 text-sm leading-relaxed text-muted sm:px-6">
              Address, hours, phone, and WhatsApp will appear here once added in store settings.
            </p>
          )}

          {primaryPhone || chatHref || directionsHref ? (
            <div className="mt-auto flex flex-col gap-2 border-t border-border/80 p-4 sm:p-5">
              {primaryPhone ? (
                <a href={telHref(primaryPhone)} className={buttonClassName("primary", "w-full")}>
                  <Icon name="phone" className="text-sm" />
                  {copy.callShop}
                </a>
              ) : null}
              {chatHref ? (
                <a href={chatHref} className={buttonClassName("whatsapp", "w-full")}>
                  <Icon name="whatsapp" kit="brands" className="text-sm" />
                  WhatsApp
                </a>
              ) : null}
              {directionsHref ? (
                <a
                  href={directionsHref}
                  className={buttonClassName("secondary", "w-full")}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon name="diamond-turn-right" className="text-sm" />
                  Directions
                </a>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="relative min-h-72 overflow-hidden rounded-[1.25rem] bg-[#efe4d4] ring-1 ring-border/80 sm:min-h-96 lg:min-h-[36rem]">
          {embedUrl ? (
            <iframe
              title="Store map"
              src={embedUrl}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex size-full min-h-72 flex-col items-start justify-end bg-[linear-gradient(160deg,#ead9c4,#d9c4a8)] p-6 sm:min-h-96 sm:p-8">
              <IconFrame>
                <Icon name="location-dot" />
              </IconFrame>
              <p className="mt-4 max-w-xs font-serif text-2xl text-brand/50">
                Map when an address is saved
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

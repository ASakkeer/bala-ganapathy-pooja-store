import Image from "next/image";
import { listedPhones, whatsappHref } from "@/lib/contact";
import {
  isGoogleMapsEmbedUrl,
  mapsDirectionsHref,
  mapsEmbedUrlFromAddress,
} from "@/lib/maps";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { buttonClassName } from "@/components/ui/button";
import { copy } from "@/content/copy";

type VisitStoreProps = {
  title?: string;
  description?: string;
  address?: string | null;
  hours?: string | null;
  phones?: string[] | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  imageSrc?: string;
  bleed?: boolean;
};

export function VisitStore({
  title = copy.visitTitle,
  description = copy.visitBody,
  address,
  hours,
  phones,
  whatsapp,
  mapUrl,
  imageSrc,
  bleed = false,
}: VisitStoreProps) {
  const numbers = listedPhones(phones);
  const chatHref = whatsappHref(whatsapp);
  const embedUrl = isGoogleMapsEmbedUrl(mapUrl)
    ? mapUrl
    : mapsEmbedUrlFromAddress(address);
  const directionsHref = mapsDirectionsHref(mapUrl, address);
  const hasDetails = Boolean(
    address?.trim() || hours?.trim() || numbers.length || chatHref || directionsHref,
  );

  const body = (
    <section className={bleed ? "py-14 md:py-20" : undefined}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
        <div className="relative min-h-64 overflow-hidden bg-[#efe4d4] sm:min-h-80">
          {embedUrl ? (
            <iframe
              title="Store map"
              src={embedUrl}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : imageSrc ? (
            <Image src={imageSrc} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex size-full min-h-64 items-end bg-[linear-gradient(160deg,#ead9c4,#d9c4a8)] p-6 sm:min-h-80">
              <p className="max-w-xs font-serif text-2xl text-brand/45">Map when an address is saved</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
            {copy.physicalShop}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{description}</p>

          <dl className="mt-8 space-y-5 text-sm">
            {hasDetails ? (
              <>
                {address?.trim() ? (
                  <div>
                    <dt className="text-[0.65rem] tracking-[0.16em] uppercase text-muted">Address</dt>
                    <dd className="mt-1 text-base leading-relaxed text-text">{address}</dd>
                  </div>
                ) : null}
                {hours?.trim() ? (
                  <div>
                    <dt className="text-[0.65rem] tracking-[0.16em] uppercase text-muted">Hours</dt>
                    <dd className="mt-1 text-base text-text">{hours}</dd>
                  </div>
                ) : null}
                {numbers.length > 0 ? (
                  <div>
                    <dt className="text-[0.65rem] tracking-[0.16em] uppercase text-muted">Phone</dt>
                    <dd className="mt-1 flex flex-col gap-1 text-base">
                      {numbers.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="inline-flex min-h-11 items-center text-brand hover:underline"
                        >
                          {phone}
                        </a>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {chatHref ? (
                  <div>
                    <dt className="text-[0.65rem] tracking-[0.16em] uppercase text-muted">WhatsApp</dt>
                    <dd className="mt-1 text-base">
                      <a href={chatHref} className="inline-flex min-h-11 items-center text-brand hover:underline">
                        Message on WhatsApp
                      </a>
                    </dd>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-base text-muted">
                Address, hours, phone, and WhatsApp will appear here once added in store settings.
              </p>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {directionsHref ? (
              <a
                href={directionsHref}
                className={buttonClassName("primary")}
                rel="noreferrer"
                target="_blank"
              >
                {copy.openMap}
              </a>
            ) : null}
            {numbers[0] ? (
              <a
                href={`tel:${numbers[0]}`}
                className={buttonClassName(directionsHref ? "secondary" : "primary")}
              >
                {copy.callShop}
              </a>
            ) : null}
            {chatHref ? (
              <a href={chatHref} className={buttonClassName("secondary")}>
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );

  if (!bleed) {
    return body;
  }

  return (
    <FullBleed className="bg-surface">
      <Container>{body}</Container>
    </FullBleed>
  );
}

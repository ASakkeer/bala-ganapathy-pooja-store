import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { VisitStore } from "@/components/home/visit-store";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: `Contact | ${STORE_NAME}`,
  description: `Address, hours, and phone for ${STORE_NAME}, R.S. Puram, Coimbatore.`,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-10 py-10 md:py-14">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <p className="mt-8 text-xs tracking-[0.18em] uppercase text-muted">Visit or call</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">Contact</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Phone and map come from the shop’s published address. Hours appear when the owner adds
          them in settings.
        </p>
      </div>

      <VisitStore
        title="The shop"
        description="Call or WhatsApp when a number is saved. The map embeds only when a map URL is saved."
        address={settings?.address}
        hours={settings?.hours}
        phones={settings?.phones}
        whatsapp={settings?.whatsapp}
        mapUrl={settings?.mapUrl}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/track" className={buttonClassName("secondary")}>
          Track an order
        </Link>
        <Link href="/shop" className={buttonClassName("primary")}>
          Shop the catalog
        </Link>
      </div>
    </div>
  );
}

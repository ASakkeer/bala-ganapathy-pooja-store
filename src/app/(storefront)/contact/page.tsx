import { ContactView } from "@/components/contact/contact-view";
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
    <ContactView
      address={settings?.address}
      hours={settings?.hours}
      phones={settings?.phones}
      whatsapp={settings?.whatsapp}
      mapUrl={settings?.mapUrl}
    />
  );
}

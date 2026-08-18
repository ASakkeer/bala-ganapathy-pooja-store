import type { Metadata } from "next";
import { TrackForm } from "@/components/order/track-form";
import { listedPhones, whatsappHref } from "@/lib/contact";
import { STORE_NAME } from "@/lib/constants";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Track order | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const [{ order: orderParam }, settings] = await Promise.all([searchParams, getStoreSettings()]);
  const initialNumber = orderParam?.trim() ?? "";

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-1 flex-col py-6 md:py-8">
      <TrackForm
        initialNumber={initialNumber}
        phones={listedPhones(settings?.phones)}
        whatsappUrl={whatsappHref(settings?.whatsapp)}
      />
    </div>
  );
}

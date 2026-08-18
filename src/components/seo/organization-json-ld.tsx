import { JsonLd } from "@/components/seo/json-ld";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { SHOP_ADDRESS, SHOP_MAPS_SHARE_URL, SHOP_PHONES } from "@/lib/maps";
import { absoluteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: STORE_NAME,
        url: absoluteUrl("/"),
        logo: absoluteUrl(STORE_LOGO_SRC),
        image: absoluteUrl(STORE_LOGO_SRC),
        telephone: SHOP_PHONES.map((phone) => `+91${phone}`),
        address: {
          "@type": "PostalAddress",
          streetAddress: "193, Thiyagaraya New Street 3, Sukrawar Pettai",
          addressLocality: "Coimbatore",
          addressRegion: "Tamil Nadu",
          postalCode: "641001",
          addressCountry: "IN",
        },
        hasMap: SHOP_MAPS_SHARE_URL,
        description: SHOP_ADDRESS,
      }}
    />
  );
}

import { JsonLd } from "@/components/seo/json-ld";
import { STORE_LOGO_SRC, STORE_NAME, STORE_SEO_DESCRIPTION } from "@/lib/constants";
import { SHOP_ADDRESS, SHOP_MAPS_SHARE_URL, SHOP_PHONES } from "@/lib/maps";
import { absoluteUrl, storeEntityId, websiteEntityId } from "@/lib/site";

export function OrganizationJsonLd() {
  const origin = absoluteUrl("/");
  const searchUrl = `${absoluteUrl("/search")}?q={search_term_string}`;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": websiteEntityId(),
            url: origin,
            name: STORE_NAME,
            description: STORE_SEO_DESCRIPTION,
            inLanguage: "en-IN",
            publisher: { "@id": storeEntityId() },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: searchUrl,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Store",
            "@id": storeEntityId(),
            name: STORE_NAME,
            url: origin,
            logo: absoluteUrl(STORE_LOGO_SRC),
            image: absoluteUrl(STORE_LOGO_SRC),
            description: STORE_SEO_DESCRIPTION,
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
            areaServed: SHOP_ADDRESS,
          },
        ],
      }}
    />
  );
}

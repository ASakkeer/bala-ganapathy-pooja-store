import { JsonLd } from "@/components/seo/json-ld";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { absoluteUrl, storeEntityId } from "@/lib/site";

export function ProductJsonLd({
  name,
  description,
  images,
  sku,
  pricePaise,
  inStock,
  url,
  category,
}: {
  name: string;
  description?: string | null;
  images: string[];
  sku: string;
  pricePaise: number;
  inStock: boolean;
  url: string;
  category?: string | null;
}) {
  const absoluteImages = (images.length > 0 ? images : [STORE_LOGO_SRC]).map((image) =>
    absoluteUrl(image),
  );

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: description ?? undefined,
        image: absoluteImages,
        sku,
        url,
        category: category ?? undefined,
        itemCondition: "https://schema.org/NewCondition",
        brand: {
          "@type": "Brand",
          name: STORE_NAME,
          logo: absoluteUrl(STORE_LOGO_SRC),
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: (pricePaise / 100).toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url,
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": storeEntityId() },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            merchantReturnLink: absoluteUrl("/policies/returns"),
          },
        },
      }}
    />
  );
}

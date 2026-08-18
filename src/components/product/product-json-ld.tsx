import { JsonLd } from "@/components/seo/json-ld";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site";

export function ProductJsonLd({
  name,
  description,
  images,
  sku,
  pricePaise,
  inStock,
  url,
}: {
  name: string;
  description?: string | null;
  images: string[];
  sku: string;
  pricePaise: number;
  inStock: boolean;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: description ?? undefined,
        image: images,
        sku,
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
        },
      }}
    />
  );
}

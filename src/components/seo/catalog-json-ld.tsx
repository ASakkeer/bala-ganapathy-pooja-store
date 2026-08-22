import { JsonLd } from "@/components/seo/json-ld";
import { STORE_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site";

type CatalogJsonLdItem = {
  name: string;
  url: string;
  image?: string;
};

export function CatalogJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description?: string;
  path: string;
  items: CatalogJsonLdItem[];
}) {
  const pageUrl = absoluteUrl(path);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        description,
        url: pageUrl,
        isPartOf: {
          "@type": "WebSite",
          name: STORE_NAME,
          url: absoluteUrl("/"),
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: item.url,
            name: item.name,
            ...(item.image ? { image: item.image } : {}),
          })),
        },
      }}
    />
  );
}

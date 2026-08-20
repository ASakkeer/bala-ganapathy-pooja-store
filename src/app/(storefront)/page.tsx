import { CategoryDiscover } from "@/components/home/category-discover";
import { CollectionEditorial } from "@/components/home/collection-editorial";
import { HeroBanner } from "@/components/home/hero-banner";
import { toCategoryDiscoveries } from "@/components/home/map-category";
import { toProductCardProps } from "@/components/home/map-product";
import { ProductRail } from "@/components/home/product-rail";
import { PromoCollections } from "@/components/home/promo-collections";
import { VisitStore } from "@/components/home/visit-store";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { photos } from "@/content/catalog";
import { copy } from "@/content/copy";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { listCategories, listProducts } from "@/server/queries/products";
import { getStoreSettings } from "@/server/queries/store";

export const metadata = pageMetadata({
  title: STORE_NAME,
  description:
    "Traditional pooja essentials, Ganapathy and Navagraha Homam materials, kumbabishekam requirements, and naattu marundhu from Bala Ganapathy Pooja Store, R.S. Puram, Coimbatore.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, poojaRows, catalogRows, settings] = await Promise.all([
    listCategories(),
    listProducts({ categorySlug: "pooja-essentials", featured: true, inStockOnly: true, pageSize: 8 }),
    listProducts({ inStockOnly: true, pageSize: 24 }),
    getStoreSettings(),
  ]);

  const categoriesWithProducts = new Set(
    catalogRows
      .map((product) => product.category?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const visibleCategories = categories.filter((category) =>
    categoriesWithProducts.has(category.slug),
  );
  const discoveries = toCategoryDiscoveries(visibleCategories, catalogRows);
  const poojaProducts = poojaRows
    .map(toProductCardProps)
    .filter((card) => card !== null)
    .slice(0, 8)
    .map((card, index) => ({ ...card, priority: index < 4 }));

  const ganapathy = discoveries.find((category) => category.slug === "ganapathy-homam");
  const navagraha = discoveries.find((category) => category.slug === "navagraha-homam");
  const kumbha = discoveries.find((category) => category.slug === "kumbabishekam");
  const herbal = discoveries.find((category) => category.slug === "naattu-marundhu");

  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />
      <HeroBanner imageSrc={photos.temple} imageAlt={STORE_NAME} />

      <div className="flex flex-col gap-16 py-14 md:gap-20 md:py-16">
        <CategoryDiscover categories={discoveries} />
        <ProductRail
          title={copy.popularPooja}
          description={copy.popularPoojaBody}
          href="/shop"
          cta={copy.viewAllProducts}
          layout="showcase"
          products={poojaProducts}
        />
      </div>

      <PromoCollections
        panels={[
          ganapathy
            ? {
                eyebrow: ganapathy.nameTa ?? "கணபதி ஹோமம்",
                title: ganapathy.name,
                body: "Everything you need for Ganapathy Homam, packed at the shop.",
                href: ganapathy.href,
                cta: "Explore collection",
                imageSrc: ganapathy.imageSrc,
                imageAlt: ganapathy.name,
              }
            : null,
          navagraha
            ? {
                eyebrow: navagraha.nameTa ?? "நவக்கிரக ஹோமம்",
                title: navagraha.name,
                body: "Traditional essentials for Navagraha pooja and homam.",
                href: navagraha.href,
                cta: "Explore collection",
                imageSrc: navagraha.imageSrc,
                imageAlt: navagraha.name,
              }
            : null,
          kumbha
            ? {
                eyebrow: kumbha.nameTa ?? "கும்பாபிஷேகம்",
                title: kumbha.name,
                body: "Materials often bought for temple work and kumbabishekam.",
                href: kumbha.href,
                cta: "Explore collection",
                imageSrc: kumbha.imageSrc,
                imageAlt: kumbha.name,
              }
            : null,
        ].filter((panel): panel is NonNullable<typeof panel> => panel !== null)}
      />

      {herbal ? (
        <div className="py-14 md:py-16">
          <CollectionEditorial
            eyebrow={herbal.nameTa ?? "நாட்டு மருந்துகள்"}
            title="Traditional naattu marundhu"
            body="Traditional herbal products from the shop. Not medicines."
            href={herbal.href}
            cta="Explore products"
            imageSrc={herbal.imageSrc}
            imageAlt={herbal.name}
          />
        </div>
      ) : null}

      <VisitStore
        bleed
        address={settings?.address}
        hours={settings?.hours}
        phones={settings?.phones}
        whatsapp={settings?.whatsapp}
        mapUrl={settings?.mapUrl}
      />
    </div>
  );
}

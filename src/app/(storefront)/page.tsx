import { CategoryDiscover } from "@/components/home/category-discover";
import { CategoryGrid } from "@/components/home/category-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { HomeStories } from "@/components/home/home-stories";
import { HomeUpdates } from "@/components/home/home-updates";
import { toCategoryDiscoveries } from "@/components/home/map-category";
import { toProductCardProps } from "@/components/home/map-product";
import { ProductRail } from "@/components/home/product-rail";
import { PromoCollections } from "@/components/home/promo-collections";
import { TrustStrip } from "@/components/home/trust-strip";
import { VisitStore } from "@/components/home/visit-store";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { photos } from "@/content/catalog";
import { copy } from "@/content/copy";
import { STORE_NAME } from "@/lib/constants";
import { whatsappHref } from "@/lib/contact";
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
  const [categories, poojaRows, ganapathyRows, navagrahaRows, kumbhaRows, herbalRows, allInStock, settings] =
    await Promise.all([
      listCategories(),
      listProducts({ categorySlug: "pooja-essentials", featured: true, inStockOnly: true, pageSize: 8 }),
      listProducts({ categorySlug: "ganapathy-homam", inStockOnly: true, pageSize: 8 }),
      listProducts({ categorySlug: "navagraha-homam", inStockOnly: true, pageSize: 8 }),
      listProducts({ categorySlug: "kumbabishekam", inStockOnly: true, pageSize: 8 }),
      listProducts({ categorySlug: "naattu-marundhu", inStockOnly: true, pageSize: 8 }),
      listProducts({ inStockOnly: true, pageSize: 100 }),
      getStoreSettings(),
    ]);

  const categoriesWithProducts = new Set(
    allInStock
      .map((product) => product.category?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const visibleCategories = categories.filter((category) =>
    categoriesWithProducts.has(category.slug),
  );
  const discoveries = toCategoryDiscoveries(visibleCategories, allInStock);
  const poojaProducts = poojaRows.map(toProductCardProps).filter((card) => card !== null);
  const ganapathyProducts = ganapathyRows.map(toProductCardProps).filter((card) => card !== null);
  const navagrahaProducts = navagrahaRows.map(toProductCardProps).filter((card) => card !== null);
  const kumbhaProducts = kumbhaRows.map(toProductCardProps).filter((card) => card !== null);
  const herbalProducts = herbalRows.map(toProductCardProps).filter((card) => card !== null);

  const ganapathy = discoveries.find((category) => category.slug === "ganapathy-homam");
  const navagraha = discoveries.find((category) => category.slug === "navagraha-homam");

  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />
      <HeroBanner imageSrc={photos.temple} imageAlt={STORE_NAME} />

      <div className="flex flex-col gap-16 py-14 md:gap-20 md:py-20">
        <CategoryDiscover categories={discoveries} />
        <ProductRail
          title={copy.popularPooja}
          description={copy.popularPoojaBody}
          href="/c/pooja-essentials"
          layout="showcase"
          products={poojaProducts}
        />
      </div>

      <CategoryGrid categories={discoveries} />

      <PromoCollections
        panels={[
          ganapathy
            ? {
                eyebrow: ganapathy.nameTa ?? "கணபதி ஹோமம்",
                title: ganapathy.name,
                body: ganapathy.blurb ?? copy.ganapathyRailBody,
                href: ganapathy.href,
                cta: copy.explore,
                imageSrc: ganapathy.imageSrc,
                imageAlt: ganapathy.name,
              }
            : null,
          navagraha
            ? {
                eyebrow: navagraha.nameTa ?? "நவக்கிரக ஹோமம்",
                title: navagraha.name,
                body: navagraha.blurb ?? copy.navagrahaRailBody,
                href: navagraha.href,
                cta: copy.explore,
                imageSrc: navagraha.imageSrc,
                imageAlt: navagraha.name,
              }
            : null,
        ].filter((panel): panel is NonNullable<typeof panel> => panel !== null)}
      />

      {ganapathyProducts.length > 0 ? (
        <div className="py-14 md:py-20">
          <ProductRail
            title={copy.ganapathyRail}
            description={copy.ganapathyRailBody}
            href="/c/ganapathy-homam"
            layout="showcase"
            products={ganapathyProducts}
          />
        </div>
      ) : null}

      {navagrahaProducts.length > 0 ? (
        <div className="pb-14 md:pb-20">
          <ProductRail
            title={copy.navagrahaRail}
            description={copy.navagrahaRailBody}
            href="/c/navagraha-homam"
            layout="showcase"
            products={navagrahaProducts}
          />
        </div>
      ) : null}

      {kumbhaProducts.length > 0 ? (
        <div className="pb-14 md:pb-20">
          <ProductRail
            title={copy.kumbhaRail}
            description={copy.kumbhaRailBody}
            href="/c/kumbabishekam"
            layout="showcase"
            products={kumbhaProducts}
          />
        </div>
      ) : null}

      {herbalProducts.length > 0 ? (
        <div className="pb-14 md:pb-20">
          <ProductRail
            title={copy.herbalRail}
            description={copy.herbalRailBody}
            href="/c/naattu-marundhu"
            layout="showcase"
            products={herbalProducts}
          />
        </div>
      ) : null}

      <TrustStrip />

      <div className="py-14 md:py-20">
        <HomeStories />
      </div>

      <VisitStore
        bleed
        address={settings?.address}
        hours={settings?.hours}
        phones={settings?.phones}
        whatsapp={settings?.whatsapp}
        mapUrl={settings?.mapUrl}
      />

      <HomeUpdates whatsappHref={whatsappHref(settings?.whatsapp)} />
    </div>
  );
}

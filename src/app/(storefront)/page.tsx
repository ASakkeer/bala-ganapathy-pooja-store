import { Suspense } from "react";
import { CategoryBento } from "@/components/home/category-bento";
import {
  CategoryBentoSkeleton,
  ProductRailSkeleton,
} from "@/components/home/home-skeletons";
import { toCategoryDiscoveries } from "@/components/home/map-category";
import { toProductCardProps } from "@/components/home/map-product";
import { ProductRail } from "@/components/home/product-rail";
import { HeroBanner } from "@/components/home/hero-banner";
import { TrustStrip } from "@/components/home/trust-strip";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { resolveHomeContent } from "@/content/home-content";
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

async function HomeHero() {
  const settings = await getStoreSettings();
  const content = resolveHomeContent(settings?.homeContent);
  return <HeroBanner imageSrc={settings?.heroImage ?? undefined} content={content} />;
}

async function HomeRituals() {
  const [categories, settings] = await Promise.all([listCategories(), getStoreSettings()]);
  const discoveries = toCategoryDiscoveries(categories);
  const content = resolveHomeContent(settings?.homeContent);

  return <CategoryBento categories={discoveries} content={content} />;
}

async function HomePopular() {
  const [poojaRows, catalogRows, settings] = await Promise.all([
    listProducts({
      categorySlug: "pooja-essentials",
      inStockOnly: true,
      pageSize: 8,
    }),
    listProducts({ inStockOnly: true, pageSize: 8 }),
    getStoreSettings(),
  ]);
  const content = resolveHomeContent(settings?.homeContent);
  const poojaProducts = (poojaRows.length > 0 ? poojaRows : catalogRows)
    .map(toProductCardProps)
    .filter((card) => card !== null)
    .slice(0, 4)
    .map((card, index) => ({ ...card, priority: index < 4 }));

  return (
    <ProductRail
      eyebrow={content.popularEyebrow}
      title={content.popularTitle}
      description={content.popularBody}
      href="/shop"
      cta={content.popularCta}
      layout="home"
      products={poojaProducts}
    />
  );
}

async function HomeTrust() {
  const settings = await getStoreSettings();
  const content = resolveHomeContent(settings?.homeContent);
  return <TrustStrip items={content.trust} />;
}

export default function Home() {
  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />
      <Suspense fallback={<HeroBanner content={resolveHomeContent()} />}>
        <HomeHero />
      </Suspense>

      <div className="py-8 md:py-[3.75rem]">
        <Suspense fallback={<CategoryBentoSkeleton />}>
          <HomeRituals />
        </Suspense>
      </div>

      <Suspense fallback={<ProductRailSkeleton />}>
        <HomePopular />
      </Suspense>

      <Suspense fallback={<TrustStrip items={resolveHomeContent().trust} />}>
        <HomeTrust />
      </Suspense>
    </div>
  );
}

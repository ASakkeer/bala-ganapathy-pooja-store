import { CategoryBento } from "@/components/home/category-bento";
import { HeroBanner } from "@/components/home/hero-banner";
import { toCategoryDiscoveries } from "@/components/home/map-category";
import { toProductCardProps } from "@/components/home/map-product";
import { ProductRail } from "@/components/home/product-rail";
import { TrustStrip } from "@/components/home/trust-strip";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { photos } from "@/content/catalog";
import { copy } from "@/content/copy";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { listCategories, listProducts } from "@/server/queries/products";

export const metadata = pageMetadata({
  title: STORE_NAME,
  description:
    "Traditional pooja essentials, Ganapathy and Navagraha Homam materials, kumbabishekam requirements, and naattu marundhu from Bala Ganapathy Pooja Store, R.S. Puram, Coimbatore.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, poojaRows, catalogRows] = await Promise.all([
    listCategories(),
    listProducts({ categorySlug: "pooja-essentials", featured: true, inStockOnly: true, pageSize: 8 }),
    listProducts({ inStockOnly: true, pageSize: 24 }),
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
    .slice(0, 4)
    .map((card, index) => ({ ...card, priority: index < 4 }));

  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />
      <HeroBanner imageSrc={photos.temple} imageAlt={STORE_NAME} />

      <div className="py-8 md:py-[3.75rem]">
        <CategoryBento categories={discoveries} />
      </div>

      <ProductRail
        eyebrow={copy.popularPoojaEyebrow}
        title={copy.popularPooja}
        description={copy.popularPoojaBody}
        href="/c/pooja-essentials"
        cta={copy.popularPoojaCta}
        layout="home"
        products={poojaProducts}
      />

      <TrustStrip />
    </div>
  );
}

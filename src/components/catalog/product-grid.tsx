import { CatalogGridEmpty } from "@/components/catalog/catalog-page-skeleton";
import { ProductCard, type ProductCardProps } from "@/components/product/product-card";

export function ProductGrid({
  products,
  emptyTitle = "No records",
  emptyDescription = "No products to show in this list yet.",
}: {
  products: ProductCardProps[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return <CatalogGridEmpty title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {products.map((product, index) => (
        <ProductCard key={product.href} {...product} priority={index < 4} />
      ))}
    </div>
  );
}

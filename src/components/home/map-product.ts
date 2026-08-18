import type { ProductCardProps } from "@/components/product/product-card";
import { getCatalogProduct } from "@/content/catalog";
import type { ListedProduct } from "@/server/queries/products";

export function toProductCardProps(
  product: ListedProduct,
): ProductCardProps | null {
  const variant =
    product.variants.find((item) => item.stockQty > 0) ?? product.variants[0];

  if (!variant) {
    return null;
  }

  const content = getCatalogProduct(product.slug);

  return {
    href: `/p/${product.slug}`,
    title: product.name,
    tamilName: content?.nameTa,
    imageAlt: product.name,
    imageSrc: product.images[0] || undefined,
    pricePaise: variant.pricePaise,
    mrpPaise: variant.mrpPaise,
    inStock: product.variants.some((item) => item.stockQty > 0),
    variantId: variant.id,
    stockQty: variant.stockQty,
  };
}

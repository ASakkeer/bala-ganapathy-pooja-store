import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct, listAdminCategories } from "@/server/admin/catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Catalog</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Edit product</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}

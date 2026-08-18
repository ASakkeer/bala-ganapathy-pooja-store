import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/server/admin/catalog";

export default async function NewProductPage() {
  const categories = await listAdminCategories();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Catalog</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">New product</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}

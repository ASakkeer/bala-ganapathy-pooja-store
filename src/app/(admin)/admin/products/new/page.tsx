import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/server/admin/catalog";

export default async function NewProductPage() {
  const categories = await listAdminCategories();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="text-center">
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Catalog</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">New product</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Hover the i next to a field if you are unsure what to type. Saving still works the same
          way.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}

import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { formatPaise } from "@/lib/money";
import { listAdminProducts } from "@/server/admin/catalog";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-muted">Catalog</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Products</h1>
        </div>
        <Link href="/admin/products/new" className={buttonClassName("primary")}>
          New product
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-border/80">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border/80 text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyNotice
                    title="No records"
                    description="No products in the catalog yet. Add the first listing."
                    className="min-h-[12rem] py-10"
                  />
                </td>
              </tr>
            ) : (
              products.map((product) => {
              const stock = product.variants.reduce((sum, variant) => sum + variant.stockQty, 0);
              const price = product.variants[0]?.pricePaise;
              return (
                <tr key={product.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-4">
                    <p className="font-medium text-text">{product.name}</p>
                    <p className="text-muted">
                      {product.categoryName}
                      {typeof price === "number" ? ` · ${formatPaise(price)}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-4 capitalize text-muted">{product.status}</td>
                  <td className="px-4 py-4 tabular-nums">{stock}</td>
                  <td className="px-4 py-4 text-muted">{product.slug}</td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/admin/products/${product.id}`} className="text-brand hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

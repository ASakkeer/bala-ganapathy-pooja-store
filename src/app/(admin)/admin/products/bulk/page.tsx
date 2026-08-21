import Link from "next/link";
import { ProductBulkForm } from "@/components/admin/product-bulk-form";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function BulkProductsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/products" className={buttonClassName("ghost", "mb-4 w-fit px-3")}>
          <Icon name="arrow-left" className="text-xs" />
          Back to products
        </Link>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Catalog</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Bulk upload</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Add many products from one Excel sheet. The shop checks every row first. Nothing is saved
          until the sheet is clean and you import.
        </p>
      </div>
      <ProductBulkForm />
    </div>
  );
}

import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { listAdminProducts } from "@/server/admin/catalog";
import { listAdminOrders } from "@/server/admin/orders";
import { env, isDatabaseConfigured } from "@/server/env";

export default async function AdminHomePage() {
  const [products, orders] = await Promise.all([listAdminProducts(), listAdminOrders()]);
  const active = products.filter((product) => product.status === "active").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Admin</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Overview</h1>
        <p className="mt-3 max-w-xl text-muted">
          Replace the demo catalog, update stock, move orders, and save contact details. This is
          not a second app — it uses the same store.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        <li className="rounded-2xl bg-surface p-5 ring-1 ring-border/80">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Active products</p>
          <p className="mt-2 font-serif text-3xl">{active}</p>
        </li>
        <li className="rounded-2xl bg-surface p-5 ring-1 ring-border/80">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Orders in view</p>
          <p className="mt-2 font-serif text-3xl">{orders.length}</p>
        </li>
        <li className="rounded-2xl bg-surface p-5 ring-1 ring-border/80">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Catalog source</p>
          <p className="mt-2 text-base text-text">
            {isDatabaseConfigured() ? "Database" : "Demo catalog (no DATABASE_URL)"}
          </p>
        </li>
      </ul>
      {!env.ADMIN_PHONE ? (
        <p className="rounded-2xl bg-brand/[0.06] px-4 py-3 text-sm text-text">
          Set <code>ADMIN_PHONE</code> in <code>.env.local</code> to the 10-digit number that should
          open this admin after OTP login.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className={buttonClassName("primary")}>
          Products
        </Link>
        <Link href="/admin/orders" className={buttonClassName("secondary")}>
          Orders
        </Link>
        <Link href="/admin/settings" className={buttonClassName("secondary")}>
          Settings
        </Link>
      </div>
    </div>
  );
}

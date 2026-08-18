import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { AddressDisplay } from "@/components/account/address-display";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { listAddresses } from "@/server/addresses";
import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Account | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect(loginHref("/account"));
  }

  const addresses = await listAddresses();
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0];

  return (
    <div className="flex flex-col gap-10 py-10 md:py-14">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Account</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">
          Signed in
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          You are signed in with {session.phone}.
        </p>
        {session.role === "admin" ? (
          <p className="mt-4">
            <Link href="/admin" className="text-sm text-brand hover:underline">
              Open admin
            </Link>
          </p>
        ) : null}
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">Orders</h2>
            <Link href="/account/orders" className="text-sm text-brand hover:underline">
              View orders
            </Link>
          </div>
          <p className="text-sm text-muted">Track packing and delivery from your order list.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/orders" className={buttonClassName("secondary", "w-fit")}>
              Your orders
            </Link>
            <Link href="/track" className={buttonClassName("ghost", "w-fit")}>
              Track an order
            </Link>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">Addresses</h2>
            <Link href="/account/addresses" className="text-sm text-brand hover:underline">
              Manage addresses
            </Link>
          </div>
          {defaultAddress ? (
            <AddressDisplay address={defaultAddress} selected={defaultAddress.isDefault} />
          ) : (
            <p className="text-sm text-muted">No saved address yet. You can add one at checkout.</p>
          )}
          <Link href="/account/addresses" className={buttonClassName("secondary", "w-fit")}>
            {addresses.length > 0 ? "Add another address" : "Add an address"}
          </Link>
        </section>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className={buttonClassName("primary")}>
          Continue shopping
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

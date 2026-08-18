import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/account/address-form";
import { SavedAddressList } from "@/components/account/saved-address-list";
import { STORE_NAME } from "@/lib/constants";
import { loginHref, safeNextPath } from "@/lib/login-next";
import { listAddresses } from "@/server/addresses";
import { getSession } from "@/server/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Addresses | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/addresses"));
  }

  const nextPath = safeNextPath((await searchParams).next);
  const addresses = await listAddresses();

  return (
    <div className="flex flex-col gap-10 py-10 md:py-14">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Account</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">
          Delivery addresses
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Saved addresses can also be added at checkout. The address you select becomes the default next
          time.
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl">Saved</h2>
          <SavedAddressList addresses={addresses} />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl">Add an address</h2>
          <AddressForm
            initialPhone={session.phone}
            nextPath={nextPath === "/account" ? undefined : nextPath}
          />
        </section>
      </div>
      <Link href="/account" className="text-sm text-muted hover:text-brand">
        Back to account
      </Link>
    </div>
  );
}

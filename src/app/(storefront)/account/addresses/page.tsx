import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/account/address-form";
import { AccountPanel } from "@/components/account/account-panel";
import { AccountShell } from "@/components/account/account-shell";
import { SavedAddressList } from "@/components/account/saved-address-list";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { MAX_SAVED_ADDRESSES } from "@/lib/addresses";
import { STORE_NAME } from "@/lib/constants";
import { loginHref, safeNextPath } from "@/lib/login-next";
import { listAddresses } from "@/server/addresses";
import { getSession } from "@/server/auth";
import { getAccountProfile } from "@/server/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Addresses | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

function addressesPath(query: { next?: string; add?: boolean; edit?: string }) {
  const params = new URLSearchParams();
  if (query.add) {
    params.set("add", "1");
  }
  if (query.edit) {
    params.set("edit", query.edit);
  }
  if (query.next) {
    params.set("next", query.next);
  }
  const qs = params.toString();
  return qs ? `/account/addresses?${qs}` : "/account/addresses";
}

export default async function AccountAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; add?: string; edit?: string; saved?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/addresses"));
  }

  const query = await searchParams;
  const nextCandidate = safeNextPath(query.next);
  const nextPath = nextCandidate === "/account" ? undefined : nextCandidate;
  const [profile, addresses] = await Promise.all([getAccountProfile(), listAddresses()]);
  const editing = addresses.find((item) => item.id === query.edit);
  const adding = query.add === "1";
  const atLimit = addresses.length >= MAX_SAVED_ADDRESSES;
  const listHref = addressesPath({ next: nextPath });

  if (query.edit && !editing) {
    redirect(listHref);
  }

  if (adding && (editing || atLimit)) {
    redirect(listHref);
  }

  const showForm = Boolean(editing) || adding;

  return (
    <AccountShell profile={profile} current="addresses" isAdmin={session.role === "admin"}>
      {query.saved === "1" && !showForm ? (
        <p className="rounded-full bg-success/10 px-4 py-2 text-sm text-success" role="status">
          Address saved.
        </p>
      ) : null}

      {nextPath?.startsWith("/checkout") ? (
        <Link href={nextPath} className="text-sm text-muted hover:text-brand">
          Back to checkout
        </Link>
      ) : null}

      {showForm ? (
        <AccountPanel
          title={editing ? "Edit address" : "Add an address"}
          action={
            <Link href={listHref} className="text-sm text-muted hover:text-brand">
              Cancel
            </Link>
          }
        >
          <div className="px-5 py-5 sm:px-6">
            <AddressForm
              initialPhone={session.phone}
              nextPath={nextPath}
              addressId={editing?.id}
              initialValues={
                editing
                  ? {
                      name: editing.name,
                      phone: editing.phone,
                      line1: editing.line1,
                      line2: editing.line2 ?? "",
                      city: editing.city,
                      state: editing.state,
                      pincode: editing.pincode,
                    }
                  : undefined
              }
              submitLabel={editing ? "Save changes" : "Save address"}
            />
          </div>
        </AccountPanel>
      ) : (
        <AccountPanel
          title="Saved addresses"
          action={
            atLimit ? (
              <span className="text-sm text-muted">Maximum {MAX_SAVED_ADDRESSES}</span>
            ) : (
              <Link href={addressesPath({ next: nextPath, add: true })} className="text-sm text-brand hover:underline">
                Add
              </Link>
            )
          }
        >
          {addresses.length === 0 ? (
            <EmptyNotice
              title="No records"
              description="No saved addresses yet. Add one here or at checkout."
              className="min-h-[12rem] px-5 py-10 sm:px-6"
            />
          ) : (
            <SavedAddressList addresses={addresses} nextPath={nextPath} />
          )}
        </AccountPanel>
      )}
    </AccountShell>
  );
}

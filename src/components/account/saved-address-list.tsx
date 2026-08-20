"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAddressLines } from "@/components/account/address-display";
import { formatAccountPhone } from "@/components/account/account-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Address } from "@/types";

export function SavedAddressList({
  addresses,
  nextPath,
}: {
  addresses: Address[];
  nextPath?: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState("");
  const removing = addresses.find((item) => item.id === removeId);

  function editHref(id: string) {
    const params = new URLSearchParams({ edit: id });
    if (nextPath) {
      params.set("next", nextPath);
    }
    return `/account/addresses?${params.toString()}`;
  }

  async function setDefault(id: string) {
    setPendingId(id);
    setError("");
    const response = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
    });
    if (!response.ok) {
      setError("Could not set the default address.");
    }
    setPendingId("");
    router.refresh();
  }

  async function remove(id: string) {
    setPendingId(id);
    setError("");
    const response = await fetch(`/api/addresses/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!response.ok) {
      setError("Could not remove the address.");
      setPendingId("");
      return;
    }
    setPendingId("");
    setRemoveId("");
    router.refresh();
  }

  return (
    <>
      <ul>
        {addresses.map((address) => (
          <li key={address.id} className="border-b border-border/70 last:border-b-0">
            <article className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-sm font-medium text-text">{address.name}</h3>
                  {address.isDefault ? <Badge>Default</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {formatAddressLines(address).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="mt-1 block">{formatAccountPhone(address.phone)}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link href={editHref(address.id)} className={buttonClassName("secondary", "px-4")}>
                  Edit
                </Link>
                {address.isDefault ? null : (
                  <button
                    type="button"
                    className={buttonClassName("ghost", "px-4")}
                    disabled={Boolean(pendingId)}
                    onClick={() => void setDefault(address.id)}
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm text-muted hover:text-danger disabled:opacity-50"
                  disabled={Boolean(pendingId)}
                  onClick={() => setRemoveId(address.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          </li>
        ))}
        {error ? (
          <li className="px-5 py-3 text-sm text-danger sm:px-6" role="alert">
            {error}
          </li>
        ) : null}
      </ul>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this address?"
        description={
          removing
            ? `${removing.name}, ${removing.city} ${removing.pincode} will be deleted from your account.`
            : "This address will be deleted from your account."
        }
        confirmLabel="Remove"
        pending={Boolean(pendingId)}
        onCancel={() => {
          if (!pendingId) {
            setRemoveId("");
          }
        }}
        onConfirm={() => {
          if (removeId) {
            void remove(removeId);
          }
        }}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressDisplay } from "@/components/account/address-display";
import type { Address } from "@/types";

export function SavedAddressList({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

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
    }
    setPendingId("");
    router.refresh();
  }

  if (addresses.length === 0) {
    return <p className="text-muted">No saved addresses yet. Add one below before checkout.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {addresses.map((address) => (
        <li key={address.id} className="flex flex-col gap-3">
          <AddressDisplay address={address} selected={address.isDefault} />
          <div className="flex flex-wrap gap-3 px-1">
            {address.isDefault ? null : (
              <button
                type="button"
                className="text-sm text-brand hover:underline disabled:opacity-50"
                disabled={Boolean(pendingId)}
                onClick={() => void setDefault(address.id)}
              >
                Set as default
              </button>
            )}
            <button
              type="button"
              className="text-sm text-muted hover:text-danger disabled:opacity-50"
              disabled={Boolean(pendingId)}
              onClick={() => void remove(address.id)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
      {error ? <li className="text-sm text-danger">{error}</li> : null}
    </ul>
  );
}

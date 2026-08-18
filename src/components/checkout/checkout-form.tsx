"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddressDisplay } from "@/components/account/address-display";
import { AddressForm } from "@/components/account/address-form";
import { useCartUi } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { loginHref } from "@/lib/login-next";
import { formatPaise } from "@/lib/money";
import type { Address } from "@/types";

export function CheckoutForm({
  addresses,
  items,
  subtotalPaise,
  shippingPaise,
  shippingLabel,
  grandTotalPaise,
  initialPhone,
}: {
  addresses: Address[];
  items: Array<{
    variantId: string;
    productName: string;
    variantName: string;
    qty: number;
    linePaise: number;
  }>;
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
  initialPhone?: string;
}) {
  const router = useRouter();
  const { applyCount } = useCartUi();
  const defaultId = addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(addresses.length === 0);

  const selected = useMemo(
    () => addresses.find((item) => item.id === selectedId) ?? null,
    [addresses, selectedId],
  );
  const canSubmit = Boolean(selected) && !pending;

  async function selectAddress(id: string) {
    setSelectedId(id);
    setError("");
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
    });
  }

  async function submit() {
    if (!selected) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ addressId: selected.id }),
      });
      const payload = (await response.json()) as { error?: string; publicNumber?: string };

      if (response.status === 401) {
        router.push(loginHref("/checkout"));
        return;
      }

      if (!response.ok || !payload.publicNumber) {
        setError(payload.error ?? "Could not place the order.");
        return;
      }

      applyCount(0);
      window.location.assign(`/order/confirmation/${encodeURIComponent(payload.publicNumber)}`);
      return;
    } catch {
      setError("Could not place the order.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Delivery address</h2>
          {addresses.length > 0 ? (
            <button
              type="button"
              className="text-sm text-brand hover:underline"
              onClick={() => setAdding((current) => !current)}
            >
              {adding ? "Cancel" : "Add another"}
            </button>
          ) : null}
        </div>
        {addresses.length > 0 ? (
          <div
            role="radiogroup"
            aria-label="Saved delivery addresses"
            className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"
          >
            {addresses.map((address) => {
              const checked = address.id === selectedId;
              return (
                <button
                  key={address.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => void selectAddress(address.id)}
                  className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <AddressDisplay address={{ ...address, isDefault: address.id === selectedId }} selected={checked} />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            Enter where this order should go. We only deliver to serviceable pincodes.
          </p>
        )}
        {adding ? (
          <div className="rounded-[1.5rem] bg-brand/[0.04] px-5 py-6">
            <h3 className="font-serif text-xl">{addresses.length === 0 ? "Add an address" : "New address"}</h3>
            <div className="mt-4">
              <AddressForm initialPhone={initialPhone} nextPath="/checkout" />
            </div>
          </div>
        ) : null}
        {error ? (
          <p id="checkout-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </section>
      <aside className="rounded-[1.75rem] bg-brand/[0.05] p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between gap-4">
              <span>
                {item.productName} · {item.variantName} × {item.qty}
              </span>
              <span className="tabular-nums">{formatPaise(item.linePaise)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatPaise(subtotalPaise)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums">{formatPaise(shippingPaise)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">{shippingLabel}</p>
        <dl className="mt-3">
          <div className="flex justify-between gap-4 border-t border-border/70 pt-3">
            <dt>Total</dt>
            <dd className="font-serif text-2xl tabular-nums">{formatPaise(grandTotalPaise)}</dd>
          </div>
        </dl>
        <Button
          type="button"
          disabled={!canSubmit}
          className="mt-6 w-full"
          aria-describedby={error ? "checkout-error" : undefined}
          onClick={() => void submit()}
        >
          {pending ? "Placing order…" : "Continue to payment"}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {selected
            ? "Payment opens on the next screen. No charge is taken here."
            : "Save a delivery address to continue."}
        </p>
        {addresses.length > 0 ? (
          <Link
            href="/account/addresses?next=/checkout"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-muted hover:text-brand"
          >
            Manage saved addresses
          </Link>
        ) : null}
      </aside>
    </div>
  );
}

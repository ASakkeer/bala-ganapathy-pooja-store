"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  snapshotFromPayload,
  useCartUi,
  type CartMutationPayload,
} from "@/components/cart/cart-provider";
import { cn } from "@/lib/cn";
import { loginHref } from "@/lib/login-next";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";

export function CartLineControls({
  variantId,
  qty,
  stockQty,
  productName,
  compact = false,
}: {
  variantId: string;
  qty: number;
  stockQty: number;
  productName: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { applySnapshot } = useCartUi();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function update(nextQty: number) {
    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const method = nextQty === 0 ? "DELETE" : "PATCH";
      const response = await fetch("/api/cart/items", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(nextQty === 0 ? { variantId } : { variantId, qty: nextQty }),
      });
      const payload = (await response.json()) as CartMutationPayload;

      if (response.status === 401) {
        router.push(loginHref("/cart"));
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not update cart.");
        return;
      }

      applySnapshot(snapshotFromPayload(payload));
      setConfirmRemove(false);
      router.refresh();
    } catch {
      setError("Could not update cart.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={cn("flex w-full items-center gap-2 sm:w-auto", compact && "w-full")}>
        <div
          className={cn(
            "inline-flex items-center rounded-full bg-brand/[0.05]",
            compact && "w-full justify-between",
          )}
        >
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center"
            aria-label={`Decrease quantity of ${productName}`}
            disabled={pending || (!compact && qty <= 1)}
            onClick={() => update(qty <= 1 ? 0 : qty - 1)}
          >
            <Icon name="minus" className="text-xs" />
          </button>
          <span
            className="min-w-8 text-center tabular-nums"
            aria-label={`Quantity of ${productName}`}
          >
            {qty}
          </span>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center"
            aria-label={`Increase quantity of ${productName}`}
            disabled={pending || qty >= stockQty}
            onClick={() => update(qty + 1)}
          >
            <Icon name="plus" className="text-xs" />
          </button>
        </div>
        {compact ? null : (
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-muted hover:text-danger"
            disabled={pending}
            onClick={() => setConfirmRemove(true)}
          >
            <Icon name="trash-can" kit="regular" className="text-xs" />
            Remove
          </button>
        )}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <ConfirmDialog
        open={confirmRemove}
        title="Remove from cart?"
        description={`${productName} will be taken out of your cart. You can add it again from the shop.`}
        confirmLabel="Remove"
        pending={pending}
        onCancel={() => {
          if (!pending) {
            setConfirmRemove(false);
          }
        }}
        onConfirm={() => void update(0)}
      />
    </div>
  );
}

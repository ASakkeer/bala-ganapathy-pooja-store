"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartUi, snapshotFromPayload, type CartMutationPayload } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { loginHref } from "@/lib/login-next";
import { savePendingCartAction } from "@/lib/pending-cart";

export function AddToCartButton({
  variantId,
  qty,
  disabled,
  label = "Add to cart",
  variant = "primary",
  redirectTo,
  className,
}: {
  variantId: string;
  qty: number;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { applySnapshot, signedIn } = useCartUi();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function goToLogin() {
    savePendingCartAction({ variantId, qty, redirectTo });
    window.location.assign(loginHref(pathname));
  }

  async function onAdd() {
    if (disabled || pending) {
      return;
    }

    if (!signedIn) {
      goToLogin();
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ variantId, qty }),
      });
      const payload = (await response.json()) as CartMutationPayload;

      if (response.status === 401) {
        goToLogin();
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not add to cart.");
        return;
      }

      applySnapshot(snapshotFromPayload(payload, qty), "Added to cart");
      router.refresh();

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch {
      setError("Could not add to cart.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button type="button" variant={variant} disabled={disabled || pending} onClick={onAdd} className={className ?? "w-full"}>
        {pending ? "Adding…" : label}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

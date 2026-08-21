"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCartUi, snapshotFromPayload, type CartMutationPayload } from "@/components/cart/cart-provider";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
  variant?: "primary" | "secondary" | "surface";
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { applySnapshot, signedIn } = useCartUi();
  const progress = useActionProgress();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function goToLogin() {
    savePendingCartAction({ variantId, qty, redirectTo });
    window.location.assign(loginHref(pathname));
  }

  async function onAdd() {
    if (disabled || pending || progress.pending) {
      return;
    }

    if (!signedIn) {
      progress.begin();
      goToLogin();
      return;
    }

    setPending(true);
    progress.begin();
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
        const message = payload.error ?? "Could not add to cart. Please try again.";
        setError(message);
        progress.fail(message);
        return;
      }

      applySnapshot(snapshotFromPayload(payload, qty), "Added to cart");
      progress.succeed();
      router.refresh();

      if (redirectTo) {
        progress.begin();
        router.push(redirectTo);
        return;
      }
    } catch {
      const message = "Could not add to cart. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button type="button" variant={variant} disabled={disabled || pending || progress.pending} onClick={onAdd} className={className ?? "w-full"}>
        {pending ? "Adding…" : (
          <>
            <Icon name="bag-shopping" className="text-sm" />
            {label}
          </>
        )}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

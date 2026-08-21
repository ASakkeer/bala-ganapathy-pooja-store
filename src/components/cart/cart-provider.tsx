"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTopLoader } from "nextjs-toploader";
import { useToast } from "@/components/ui/toast";
import {
  clearPendingCartAction,
  readPendingCartAction,
  savePendingCartAction,
} from "@/lib/pending-cart";

export type CartUiLine = {
  variantId: string;
  qty: number;
  stockQty: number;
};

export type CartMutationPayload = {
  error?: string;
  itemCount?: number;
  items?: Array<{ variantId?: string; qty?: number; stockQty?: number }>;
};

function linesFromItems(items: CartUiLine[]) {
  const next: Record<string, CartUiLine> = {};
  for (const item of items) {
    next[item.variantId] = item;
  }
  return next;
}

export function snapshotFromPayload(payload: CartMutationPayload, fallbackCount = 0) {
  const items = (payload.items ?? [])
    .filter(
      (item): item is { variantId: string; qty: number; stockQty: number } =>
        Boolean(item.variantId) &&
        typeof item.qty === "number" &&
        item.qty > 0 &&
        typeof item.stockQty === "number",
    )
    .map((item) => ({
      variantId: item.variantId,
      qty: item.qty,
      stockQty: item.stockQty,
    }));

  return {
    itemCount: payload.itemCount ?? items.reduce((sum, item) => sum + item.qty, 0) ?? fallbackCount,
    items: payload.items ? items : undefined,
  };
}

type CartUiContextValue = {
  itemCount: number;
  toast: string | null;
  signedIn: boolean;
  qtyFor: (variantId: string) => number;
  applySnapshot: (
    snapshot: { itemCount: number; items?: CartUiLine[] },
    toast?: string,
  ) => void;
  applyCount: (count: number, toast?: string) => void;
};

const CartUiContext = createContext<CartUiContextValue | null>(null);

export function CartProvider({
  initialCount,
  initialLines,
  signedIn,
  children,
}: {
  initialCount: number;
  initialLines: CartUiLine[];
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const [itemCount, setItemCount] = useState(initialCount);
  const [lines, setLines] = useState(() => linesFromItems(initialLines));
  const [toast, setToast] = useState<string | null>(null);
  const localUpdatedAt = useRef(0);
  const toastTimer = useRef(0);
  const completingIntent = useRef(false);
  const initialKey = initialLines.map((item) => `${item.variantId}:${item.qty}`).join("|");
  const loader = useTopLoader();
  const toastNotify = useToast();
  const loaderRef = useRef(loader);
  const toastRef = useRef(toastNotify);

  useEffect(() => {
    loaderRef.current = loader;
    toastRef.current = toastNotify;
  }, [loader, toastNotify]);

  useEffect(() => {
    document.documentElement.dataset.cartReady = "true";
    return () => {
      delete document.documentElement.dataset.cartReady;
    };
  }, []);

  useEffect(() => {
    if (Date.now() - localUpdatedAt.current < 2500) {
      return;
    }

    setItemCount(initialCount);
    setLines(linesFromItems(initialLines));
  }, [initialCount, initialKey, initialLines]);

  useEffect(() => {
    if (!signedIn || completingIntent.current) {
      return;
    }

    const pending = readPendingCartAction();
    if (!pending) {
      return;
    }

    completingIntent.current = true;
    clearPendingCartAction();
    loaderRef.current.start();

    void (async () => {
      try {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({ variantId: pending.variantId, qty: pending.qty }),
        });
        const payload = (await response.json()) as CartMutationPayload;

        if (!response.ok) {
          completingIntent.current = false;
          loaderRef.current.done(true);
          toastRef.current.error(payload.error ?? "Could not add to cart. Please try again.");
          return;
        }

        const snapshot = snapshotFromPayload(payload, pending.qty);
        localUpdatedAt.current = Date.now();
        setItemCount(snapshot.itemCount);
        if (snapshot.items) {
          setLines(linesFromItems(snapshot.items));
        }
        setToast("Added to cart");
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 2800);

        if (pending.redirectTo?.startsWith("/") && !pending.redirectTo.startsWith("//")) {
          window.location.replace(pending.redirectTo);
          return;
        }

        loaderRef.current.done(true);
      } catch {
        savePendingCartAction(pending);
        completingIntent.current = false;
        loaderRef.current.done(true);
        toastRef.current.error("Could not add to cart. Please try again.");
      }
    })();
  }, [signedIn]);

  const applySnapshot = useCallback(
    (snapshot: { itemCount: number; items?: CartUiLine[] }, message?: string) => {
      localUpdatedAt.current = Date.now();
      setItemCount(snapshot.itemCount);
      if (snapshot.items) {
        setLines(linesFromItems(snapshot.items));
      }

      if (!message) {
        return;
      }

      setToast(message);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2800);
    },
    [],
  );

  const applyCount = useCallback(
    (count: number, message?: string) => {
      applySnapshot({ itemCount: count, items: count === 0 ? [] : undefined }, message);
    },
    [applySnapshot],
  );

  const qtyFor = useCallback((variantId: string) => lines[variantId]?.qty ?? 0, [lines]);

  const value = useMemo(
    () => ({ itemCount, toast, signedIn, qtyFor, applySnapshot, applyCount }),
    [itemCount, toast, signedIn, qtyFor, applySnapshot, applyCount],
  );

  return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi() {
  const value = useContext(CartUiContext);

  if (!value) {
    throw new Error("useCartUi must be used inside CartProvider.");
  }

  return value;
}

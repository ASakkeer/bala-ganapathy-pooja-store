"use client";

import { useEffect, useRef } from "react";
import { useTopLoader } from "nextjs-toploader";
import type { OrderStatus, PaymentStatus } from "@/types";

export function PaymentReturnSync({
  publicNumber,
  status,
  paymentStatus,
  payable,
  active,
}: {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payable: boolean;
  active: boolean;
}) {
  const started = useRef(false);
  const loader = useTopLoader();
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    if (!active || !payable) {
      return;
    }

    loaderRef.current.start();
    let cancelled = false;

    async function syncOnce() {
      const response = await fetch("/api/payments/razorpay/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ publicNumber }),
      });
      if (!response.ok || cancelled) {
        return false;
      }

      const data = (await response.json()) as {
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
        payable?: boolean;
      };

      if (data.status === status && data.paymentStatus === paymentStatus) {
        return false;
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("pay_error");
      url.searchParams.delete("synced");
      if (data.paymentStatus === "captured" || data.payable === false) {
        url.searchParams.delete("pay_failed");
        url.searchParams.set("paid", "1");
      } else if (data.status === "payment_failed" || data.paymentStatus === "failed") {
        url.searchParams.delete("paid");
        url.searchParams.set("pay_failed", "1");
      }
      window.location.replace(url.pathname + url.search);
      return true;
    }

    async function poll() {
      if (started.current) {
        return;
      }
      started.current = true;
      for (let attempt = 0; attempt < 6 && !cancelled; attempt += 1) {
        const done = await syncOnce().catch(() => false);
        if (done) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
      }
      if (!cancelled) {
        loaderRef.current.done(true);
      }
    }

    void poll();

    function onVisible() {
      if (document.visibilityState === "visible") {
        void syncOnce();
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      loaderRef.current.done(true);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, payable, paymentStatus, publicNumber, status]);

  return null;
}

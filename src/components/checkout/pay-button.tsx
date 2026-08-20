"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";

type CheckoutPayload = {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  publicNumber: string;
  name: string;
  phone: string;
  description: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: {
    description?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

let checkoutScript: Promise<void> | null = null;

function loadCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        checkoutScript = null;
        reject(new Error("Could not load Razorpay Checkout."));
      };
      document.body.appendChild(script);
    });
  }

  return checkoutScript;
}

function currentOrderPath(publicNumber: string) {
  const path = window.location.pathname;
  if (path.startsWith("/order/confirmation/") || path.startsWith("/account/orders/")) {
    return path;
  }

  return `/order/confirmation/${encodeURIComponent(publicNumber)}`;
}

function returnHref(publicNumber: string, flag: "paid" | "pay_failed") {
  const url = new URL(currentOrderPath(publicNumber), window.location.origin);
  url.searchParams.set(flag, "1");
  return url.pathname + url.search;
}

function completeHref(publicNumber: string, payment?: RazorpaySuccess) {
  const url = new URL("/api/payments/razorpay/complete", window.location.origin);
  url.searchParams.set("publicNumber", publicNumber);
  url.searchParams.set("next", `${currentOrderPath(publicNumber)}?paid=1`);
  if (payment) {
    url.searchParams.set("razorpay_order_id", payment.razorpay_order_id);
    url.searchParams.set("razorpay_payment_id", payment.razorpay_payment_id);
    url.searchParams.set("razorpay_signature", payment.razorpay_signature);
  }
  return url.pathname + url.search;
}

export function PayButton({
  publicNumber,
  configured,
}: {
  publicNumber: string;
  configured: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const completedRef = useRef(false);
  const pollTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current != null) {
        window.clearInterval(pollTimer.current);
      }
    };
  }, []);

  function stopPolling() {
    if (pollTimer.current != null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function goTo(flag: "paid" | "pay_failed") {
    stopPolling();
    window.location.replace(returnHref(publicNumber, flag));
  }

  async function refreshStatus() {
    const response = await fetch("/api/payments/razorpay/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify({ publicNumber }),
    });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as {
      payable?: boolean;
      status?: string;
      paymentStatus?: string;
    };
  }

  function startPolling() {
    stopPolling();
    pollTimer.current = window.setInterval(() => {
      void refreshStatus().then((data) => {
        if (!data || completedRef.current) {
          return;
        }

        if (data.paymentStatus === "captured" || data.payable === false) {
          completedRef.current = true;
          goTo("paid");
          return;
        }

        if (data.status === "payment_failed" || data.paymentStatus === "failed") {
          completedRef.current = true;
          goTo("pay_failed");
        }
      });
    }, 1500);
  }

  async function startPayment() {
    if (!configured || pending) {
      return;
    }

    setPending(true);
    setError("");
    completedRef.current = false;

    try {
      const createResponse = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ publicNumber }),
      });
      const createPayload = (await createResponse.json()) as CheckoutPayload & { error?: string };

      if (!createResponse.ok) {
        setError(createPayload.error ?? "Could not start payment.");
        setPending(false);
        return;
      }

      await loadCheckoutScript();
      if (!window.Razorpay) {
        setError("Could not load Razorpay Checkout.");
        setPending(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: createPayload.keyId,
        amount: createPayload.amountPaise,
        currency: createPayload.currency,
        name: STORE_NAME,
        image: `${window.location.origin}${STORE_LOGO_SRC}`,
        description: createPayload.publicNumber,
        order_id: createPayload.razorpayOrderId,
        prefill: {
          name: createPayload.name,
          contact: createPayload.phone,
        },
        theme: { color: "#7a1f2b" },
        handler: (response: RazorpaySuccess) => {
          completedRef.current = true;
          stopPolling();
          void fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            cache: "no-store",
            body: JSON.stringify({
              publicNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
            .then((verifyResponse) => {
              if (verifyResponse.ok) {
                goTo("paid");
                return;
              }
              window.location.replace(completeHref(publicNumber, response));
            })
            .catch(() => {
              window.location.replace(completeHref(publicNumber, response));
            });
        },
        modal: {
          ondismiss: () => {
            if (completedRef.current) {
              return;
            }
            stopPolling();
            setPending(false);
            setError("Payment was cancelled. You can try again.");
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        completedRef.current = true;
        stopPolling();
        void fetch("/api/payments/razorpay/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            publicNumber,
            razorpayOrderId: response.error?.metadata?.order_id,
            razorpayPaymentId: response.error?.metadata?.payment_id,
            reason: response.error?.description,
          }),
        }).finally(() => {
          goTo("pay_failed");
        });
      });

      startPolling();
      checkout.open();
    } catch {
      stopPolling();
      setError("Could not start payment.");
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <p className="max-w-md text-sm leading-relaxed text-muted">
        Razorpay test keys are not set yet. Add <code>RAZORPAY_KEY_ID</code>,{" "}
        <code>RAZORPAY_KEY_SECRET</code>, and <code>NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to{" "}
        <code>.env.local</code> to take payment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" disabled={pending} onClick={() => void startPayment()}>
        {pending ? "Opening payment…" : (
          <>
            <Icon name="lock" className="text-sm" />
            Pay now
          </>
        )}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrackResult, type TrackedOrder } from "@/components/order/track-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrackForm({
  initialNumber = "",
  phones = [],
  whatsappUrl = null,
}: {
  initialNumber?: string;
  phones?: string[];
  whatsappUrl?: string | null;
}) {
  const [publicNumber, setPublicNumber] = useState(initialNumber);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (order) {
      resultRef.current?.querySelector("h2")?.focus();
      const scrolling = document.scrollingElement ?? document.documentElement;
      scrolling.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [order]);

  async function submit() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ publicNumber, phone }),
      });
      const payload = (await response.json()) as TrackedOrder & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We couldn’t find an order with those details.");
        return;
      }

      setOrder(payload);
    } catch {
      setError("Could not look up the order.");
    } finally {
      setPending(false);
    }
  }

  if (order) {
    return (
      <section ref={resultRef} className="w-full" aria-live="polite">
        <TrackResult
          order={order}
          phones={phones}
          whatsappUrl={whatsappUrl}
          onTrackAgain={() => {
            setOrder(null);
            setError("");
          }}
        />
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col">
      <h1 className="font-serif text-2xl font-medium tracking-tight md:text-3xl">Track order</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Enter your order number and the mobile number used during checkout.
      </p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div>
          <Label htmlFor="track-number">Order number</Label>
          <Input
            id="track-number"
            value={publicNumber}
            onChange={(event) => setPublicNumber(event.target.value.toUpperCase())}
            placeholder="BG-260819-1234"
            autoComplete="off"
            required
          />
        </div>
        <div>
          <Label htmlFor="track-phone">Mobile number used on the order</Label>
          <Input
            id="track-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile"
            autoFocus={Boolean(initialNumber)}
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:self-start sm:px-8">
          {pending ? "Looking up…" : "Track order"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Use the same mobile number you provided when placing the order.
      </p>

      {error ? (
        <div className="mt-6 border-t border-border/80 pt-5" role="alert">
          <p className="font-medium text-text">We couldn’t find an order with those details.</p>
          {error !== "We couldn’t find an order with those details." ? (
            <p className="mt-1 text-sm text-danger">{error}</p>
          ) : (
            <p className="mt-1 text-sm text-muted">Check the order number and try again.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setError("");
                document.getElementById("track-number")?.focus();
              }}
            >
              Try again
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => document.getElementById("track-number")?.focus()}
            >
              Check order number
            </Button>
            <Link href="/contact" className="inline-flex min-h-11 items-center px-4 text-sm text-brand hover:underline">
              Contact store
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { nextOrderStatuses } from "@/lib/order-transitions";
import { orderStatusLabel } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

export function OrderStatusForm({
  publicNumber,
  status,
}: {
  publicNumber: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const options = nextOrderStatuses(status);
  const [next, setNext] = useState(options[0] ?? status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (options.length === 0) {
    return <p className="text-sm text-muted">This order has no further status changes.</p>;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(publicNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: next }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update status.");
      }
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-3">
      <label className="text-sm font-medium" htmlFor="status">
        Next status
      </label>
      <select
        id="status"
        className="h-11 max-w-sm rounded-full bg-brand/[0.04] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        value={next}
        onChange={(event) => setNext(event.target.value as OrderStatus)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {orderStatusLabel(option)}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}

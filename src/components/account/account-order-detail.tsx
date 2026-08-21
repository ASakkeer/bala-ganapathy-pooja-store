"use client";

import { useState, type ReactNode } from "react";
import { OrderInvoice, type OrderInvoiceData } from "@/components/order/order-invoice";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { orderInvoiceAvailable, orderInvoiceFilename } from "@/lib/order-invoice";

export function AccountOrderDetail({
  initialOrder,
  initialPayable,
  razorpayConfigured,
  storeAddress,
  storePhones,
  helpHref,
  notices,
}: {
  initialOrder: OrderInvoiceData;
  initialPayable: boolean;
  razorpayConfigured: boolean;
  storeAddress?: string | null;
  storePhones?: string[];
  helpHref: string | null;
  notices?: ReactNode;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [payable, setPayable] = useState(initialPayable);
  const [action, setAction] = useState<"refresh" | "invoice" | null>(null);
  const progress = useActionProgress();

  async function refresh() {
    setAction("refresh");
    progress.begin();
    try {
      const response = await fetch(`/api/account/orders/${encodeURIComponent(order.publicNumber)}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        order?: OrderInvoiceData;
        payable?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Could not refresh this order.");
      }
      setOrder(payload.order);
      setPayable(Boolean(payload.payable));
      progress.succeed("Latest status loaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refresh this order.";
      progress.fail(message);
    } finally {
      setAction(null);
    }
  }

  async function downloadInvoice() {
    setAction("invoice");
    progress.begin();
    try {
      const response = await fetch(
        `/api/account/orders/${encodeURIComponent(order.publicNumber)}/invoice`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        },
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not download the invoice.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = orderInvoiceFilename(order.publicNumber);
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      progress.succeed("Invoice downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not download the invoice.";
      progress.fail(message);
    } finally {
      setAction(null);
    }
  }

  const refreshing = progress.pending && action === "refresh";
  const invoiceBusy = progress.pending && action === "invoice";
  const busy = progress.pending;

  function refreshButton() {
    return (
      <Button
        type="button"
        variant="secondary"
        className="shrink-0 px-4"
        disabled={busy}
        onClick={() => void refresh()}
      >
        <Icon name="arrows-rotate" className={cn("text-sm", refreshing && "animate-spin")} />
        {refreshing ? "Refreshing…" : "Refresh"}
      </Button>
    );
  }

  return (
    <OrderInvoice
      order={order}
      payable={payable}
      razorpayConfigured={razorpayConfigured}
      storeAddress={storeAddress}
      storePhones={storePhones}
      helpHref={helpHref}
      kicker="Order"
      headingAs="h2"
      compact
      showAllOrders
      notices={notices}
      headerAction={refreshButton()}
      historyAction={refreshButton()}
      invoiceAction={
        orderInvoiceAvailable(order.status) ? (
          <Button type="button" variant="primary" disabled={busy} onClick={() => void downloadInvoice()}>
            <Icon name="file-pdf" className={cn("text-sm", invoiceBusy && "animate-pulse")} />
            {invoiceBusy ? "Preparing…" : "Download invoice"}
          </Button>
        ) : null
      }
    />
  );
}

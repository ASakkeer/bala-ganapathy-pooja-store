"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FieldLabel } from "@/components/ui/field-tip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { nextOrderStatuses } from "@/lib/order-transitions";
import { orderNeedsRefundNotice, orderStatusLabel, parseCancelReason } from "@/lib/order-status";
import { calendarDateInKolkata, parseShippedDateInput, shippedDateInputValue } from "@/lib/shipped-date";
import {
  inferDeliveryMethod,
  isShopDelivery,
  parseCourierName,
  parseDeliveryMethod,
  parseTrackingId,
  parseTrackingLocation,
  parseTrackingUrl,
  type DeliveryMethod,
} from "@/lib/order-tracking";
import type { OrderStatus, PaymentStatus } from "@/types";

function confirmCopy(
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  deliveryMethod: DeliveryMethod | "",
) {
  switch (status) {
    case "cancelled":
      return orderNeedsRefundNotice(paymentStatus)
        ? "The customer will see this as cancelled. If payment was taken, refund the amount in Razorpay. They will be told it takes 3–5 working days."
        : "The customer will see this as cancelled. No payment was taken, so nothing will be refunded.";
    case "shipped":
      return deliveryMethod === "store"
        ? "The customer will see this as shipped. You are delivering it from the shop, so no tracking ID is needed."
        : "The customer will see this as shipped. Courier name and tracking ID are optional if you do not have them yet.";
    case "out_for_delivery":
      return deliveryMethod === "store"
        ? "The customer will see that the shop is on the way. Add a note if you want, such as the area you have reached."
        : "The customer will see this as out for delivery. Tracking ID is optional. Use the location field if the courier shared a hub or area.";
    case "delivered":
      return deliveryMethod === "store"
        ? "Mark delivered after you handed the order to the customer. This cannot be undone from here."
        : "Mark delivered only after the courier or the customer confirms it reached the address. This cannot be undone from here.";
    default:
      return `The customer will see this order as ${orderStatusLabel(status).toLowerCase()}.`;
  }
}

const DELIVERY_OPTIONS = [
  { value: "store", label: "Shop delivery (nearby / own staff)" },
  { value: "courier", label: "Courier" },
];

export function OrderStatusForm({
  publicNumber,
  status,
  paymentStatus,
  createdAt,
  courierName: initialCourierName = "",
  trackingId: initialTrackingId = "",
  trackingUrl: initialTrackingUrl = "",
  trackingLocation: initialTrackingLocation = "",
}: {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  courierName?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
  trackingLocation?: string | null;
}) {
  const router = useRouter();
  const options = nextOrderStatuses(status);
  const [next, setNext] = useState(options[0] ?? status);
  const [shippedAt, setShippedAt] = useState(shippedDateInputValue());
  const [cancelReason, setCancelReason] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | "">(
    inferDeliveryMethod(initialCourierName, initialTrackingId, initialTrackingUrl, status),
  );
  const [courierName, setCourierName] = useState(
    isShopDelivery(initialCourierName) ? "" : (initialCourierName ?? ""),
  );
  const [trackingId, setTrackingId] = useState(initialTrackingId ?? "");
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl ?? "");
  const [trackingLocation, setTrackingLocation] = useState(initialTrackingLocation ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"status" | "tracking">("status");
  const progress = useActionProgress();
  const showDelivery =
    next === "shipped" ||
    next === "out_for_delivery" ||
    next === "delivered" ||
    status === "shipped" ||
    status === "out_for_delivery" ||
    status === "delivered";
  const canSaveDelivery =
    status === "shipped" || status === "out_for_delivery" || status === "delivered";

  useEffect(() => {
    const allowed = nextOrderStatuses(status);
    setNext(allowed[0] ?? status);
    setConfirmOpen(false);
    setError("");
    setDeliveryMethod(inferDeliveryMethod(initialCourierName, initialTrackingId, initialTrackingUrl, status));
    setCourierName(isShopDelivery(initialCourierName) ? "" : (initialCourierName ?? ""));
    setTrackingId(initialTrackingId ?? "");
    setTrackingUrl(initialTrackingUrl ?? "");
    setTrackingLocation(initialTrackingLocation ?? "");
  }, [status, initialCourierName, initialTrackingId, initialTrackingUrl, initialTrackingLocation]);

  function deliveryPayload() {
    return {
      deliveryMethod: deliveryMethod || undefined,
      courierName: deliveryMethod === "store" ? "" : courierName,
      trackingId: deliveryMethod === "store" ? "" : trackingId,
      trackingUrl: deliveryMethod === "store" ? "" : trackingUrl,
      trackingLocation,
    };
  }

  function validateDelivery() {
    const method = parseDeliveryMethod(deliveryMethod);
    if (method.error) {
      return method.error;
    }
    if (method.value === "courier") {
      const courier = parseCourierName(courierName);
      if (courier.error) {
        return courier.error;
      }
      const id = parseTrackingId(trackingId, false);
      if (id.error) {
        return id.error;
      }
      const url = parseTrackingUrl(trackingUrl);
      if (url.error) {
        return url.error;
      }
    }
    const location = parseTrackingLocation(trackingLocation);
    if (location.error) {
      return location.error;
    }
    return "";
  }

  function validate(mode: "status" | "tracking") {
    const askingDelivery =
      mode === "tracking" || next === "shipped" || next === "out_for_delivery" || next === "delivered";
    if (askingDelivery) {
      const deliveryError = validateDelivery();
      if (deliveryError) {
        return deliveryError;
      }
    }
    if (mode === "status" && next === "shipped") {
      const parsed = parseShippedDateInput(shippedAt, createdAt);
      if (parsed.error) {
        return parsed.error;
      }
    }
    if (mode === "status" && next === "cancelled") {
      const parsed = parseCancelReason(cancelReason);
      if (parsed.error) {
        return parsed.error;
      }
    }
    return "";
  }

  function requestConfirm(event: React.FormEvent) {
    event.preventDefault();
    const message = validate("status");
    if (message) {
      setError(message);
      return;
    }
    setConfirmMode("status");
    setError("");
    setConfirmOpen(true);
  }

  function requestDeliveryConfirm() {
    const message = validate("tracking");
    if (message) {
      setError(message);
      return;
    }
    setConfirmMode("tracking");
    setError("");
    setConfirmOpen(true);
  }

  async function save(mode: "status" | "tracking") {
    setPending(true);
    progress.begin();
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(publicNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          status: mode === "tracking" ? status : next,
          shippedAt: mode === "status" && next === "shipped" ? shippedAt : undefined,
          cancelReason: mode === "status" && next === "cancelled" ? cancelReason : undefined,
          ...deliveryPayload(),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update status.");
      }
      setConfirmOpen(false);
      setCancelReason("");
      progress.succeed(mode === "tracking" ? "Delivery details saved." : "Order status updated.");
      router.refresh();
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "Could not update status. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  const deliveryFields = showDelivery ? (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel
          htmlFor="delivery-method"
          tip="Shop delivery is for nearby orders you take yourself — no tracking ID. Courier is for DTDC, Delhivery, and similar. Tracking ID stays optional if the AWB is not ready yet."
        >
          How will this go out?
        </FieldLabel>
        <Select
          id="delivery-method"
          value={deliveryMethod}
          onChange={(value) => {
            setDeliveryMethod(value as DeliveryMethod);
            setError("");
          }}
          disabled={pending || progress.pending}
          required
          placeholder="Choose shop delivery or courier"
          options={DELIVERY_OPTIONS}
        />
      </div>

      {deliveryMethod === "courier" ? (
        <>
          <div>
            <FieldLabel htmlFor="courier-name" tip="Optional. Example: DTDC, Delhivery, professional courier. Leave blank if you do not have a name yet.">
              Courier
            </FieldLabel>
            <Input
              id="courier-name"
              value={courierName}
              onChange={(event) => setCourierName(event.target.value.slice(0, 80))}
              disabled={pending || progress.pending}
              placeholder="DTDC"
            />
          </div>
          <div>
            <FieldLabel htmlFor="tracking-id" tip="Optional. The AWB / consignment number if the courier gave one. Not needed for shop delivery.">
              Tracking ID
            </FieldLabel>
            <Input
              id="tracking-id"
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value.toUpperCase().slice(0, 32))}
              disabled={pending || progress.pending}
              placeholder="AWB123456789"
            />
          </div>
          <div>
            <FieldLabel htmlFor="tracking-url" tip="Optional. Paste the courier’s public tracking link if they gave one.">
              Tracking link
            </FieldLabel>
            <Input
              id="tracking-url"
              type="url"
              value={trackingUrl}
              onChange={(event) => setTrackingUrl(event.target.value)}
              disabled={pending || progress.pending}
              placeholder="https://"
            />
          </div>
        </>
      ) : null}

      {deliveryMethod ? (
        <div>
          <FieldLabel
            htmlFor="tracking-location"
            tip={
              deliveryMethod === "store"
                ? "Optional. Area or note the customer can read, such as ‘Left with family’ or ‘On the way to Adyar’."
                : "Optional. Last place the courier reported — hub, city, or ‘out for delivery in Adyar’."
            }
          >
            {deliveryMethod === "store" ? "Delivery note" : "Last location"}
          </FieldLabel>
          <Input
            id="tracking-location"
            value={trackingLocation}
            onChange={(event) => setTrackingLocation(event.target.value.slice(0, 120))}
            disabled={pending || progress.pending}
            placeholder={deliveryMethod === "store" ? "On the way to Adyar" : "Reached Chennai hub"}
          />
        </div>
      ) : null}
    </div>
  ) : null;

  if (options.length === 0 && !canSaveDelivery) {
    return <p className="text-sm leading-relaxed text-muted">This order has no further status changes.</p>;
  }

  return (
    <form onSubmit={requestConfirm} className="flex flex-col gap-4">
      {options.length > 0 ? (
        <div>
          <FieldLabel
            htmlFor="next-status"
            tip="Only the next allowed steps are listed. Every change asks for confirmation. Cancelling needs a reason the customer will see."
          >
            Next status
          </FieldLabel>
          <Select
            id="next-status"
            value={next}
            onChange={(value) => {
              setNext(value as OrderStatus);
              setError("");
            }}
            disabled={pending || progress.pending}
            options={options.map((option) => ({
              value: option,
              label: orderStatusLabel(option),
            }))}
          />
        </div>
      ) : null}

      {next === "shipped" ? (
        <div>
          <FieldLabel
            htmlFor="shipped-at"
            tip="This date is stored on the order and shown on the customer track timeline."
          >
            Shipped date
          </FieldLabel>
          <Input
            id="shipped-at"
            type="date"
            value={shippedAt}
            min={calendarDateInKolkata(createdAt) || undefined}
            max={calendarDateInKolkata() || undefined}
            onChange={(event) => setShippedAt(event.target.value)}
            disabled={pending || progress.pending}
            required
          />
        </div>
      ) : null}

      {next === "cancelled" ? null : deliveryFields}

      {next === "cancelled" ? (
        <div>
          <FieldLabel
            htmlFor="cancel-reason"
            tip="The customer sees this reason on track and on their order page."
          >
            Cancellation reason
          </FieldLabel>
          <textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value.slice(0, 400))}
            disabled={pending || progress.pending}
            required
            rows={4}
            maxLength={400}
            placeholder="Stock not available, address could not be served, …"
            className="w-full rounded-[1rem] bg-brand/[0.04] px-4 py-3 text-sm text-text ring-1 ring-transparent placeholder:text-muted/40 focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1 px-1 text-xs text-muted">{cancelReason.trim().length}/400</p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.length > 0 ? (
          <Button type="submit" disabled={pending || progress.pending} className="w-fit">
            {pending || progress.pending ? "Saving…" : "Update status"}
          </Button>
        ) : null}
        {canSaveDelivery && next !== "cancelled" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending || progress.pending}
            className="w-fit"
            onClick={requestDeliveryConfirm}
          >
            Save delivery details
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmMode === "tracking"
            ? "Save delivery details?"
            : next === "cancelled"
              ? "Cancel this order?"
              : `Mark as ${orderStatusLabel(next)}?`
        }
        description={
          confirmMode === "tracking"
            ? deliveryMethod === "store"
              ? "The customer will see that the shop is delivering this order. No tracking ID is needed."
              : "The customer will see the courier details you entered. Tracking ID can be left blank."
            : `${publicNumber}: ${confirmCopy(next, paymentStatus, deliveryMethod)}`
        }
        confirmLabel={
          confirmMode === "tracking" ? "Save details" : next === "cancelled" ? "Cancel order" : "Confirm update"
        }
        cancelLabel="Go back"
        tone={confirmMode === "status" && (next === "cancelled" || next === "delivered") ? "danger" : "brand"}
        pending={pending || progress.pending}
        onCancel={() => {
          if (!pending && !progress.pending) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={() => void save(confirmMode)}
      />
    </form>
  );
}

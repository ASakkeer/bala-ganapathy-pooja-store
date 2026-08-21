import type { OrderStatus } from "@/types";

export const SHOP_DELIVERY_LABEL = "Shop delivery";

export type DeliveryMethod = "courier" | "store";

export function isShopDelivery(courierName?: string | null) {
  return courierName?.trim().toLowerCase() === SHOP_DELIVERY_LABEL.toLowerCase();
}

export function inferDeliveryMethod(
  courierName?: string | null,
  trackingId?: string | null,
  trackingUrl?: string | null,
  status?: OrderStatus,
): DeliveryMethod | "" {
  if (isShopDelivery(courierName)) {
    return "store";
  }
  if (courierName?.trim() || trackingId?.trim() || trackingUrl?.trim()) {
    return "courier";
  }
  if (status === "shipped" || status === "out_for_delivery" || status === "delivered") {
    return "courier";
  }
  return "";
}

export function parseDeliveryMethod(value: string) {
  if (value === "courier" || value === "store") {
    return { error: null, value };
  }
  if (!value.trim()) {
    return { error: "Choose how this order will be delivered.", value: null };
  }
  return { error: "Choose shop delivery or courier.", value: null };
}

export function parseCourierName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) {
    return { error: null, value: null };
  }
  if (name.length > 80) {
    return { error: "Keep the courier name under 80 characters.", value: null };
  }
  return { error: null, value: name };
}

export function parseTrackingId(value: string, required: boolean) {
  const id = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!id) {
    return required
      ? { error: "Enter the courier tracking ID.", value: null }
      : { error: null, value: null };
  }
  if (!/^[A-Z0-9][A-Z0-9-]{3,31}$/.test(id)) {
    return { error: "Enter a valid tracking ID (letters, numbers, 4–32 characters).", value: null };
  }
  return { error: null, value: id };
}

export function parseTrackingUrl(value: string) {
  const url = value.trim();
  if (!url) {
    return { error: null, value: null };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { error: "Tracking link must start with https://.", value: null };
    }
    return { error: null, value: parsed.toString() };
  } catch {
    return { error: "Enter a valid tracking link, or leave it blank.", value: null };
  }
}

export function parseTrackingLocation(value: string) {
  const location = value.trim().replace(/\s+/g, " ");
  if (!location) {
    return { error: null, value: null };
  }
  if (location.length > 120) {
    return { error: "Keep the location update under 120 characters.", value: null };
  }
  return { error: null, value: location };
}

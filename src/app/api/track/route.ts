import { NextResponse } from "next/server";
import { maskIndianPhone } from "@/lib/phone";
import { applyOrderCookie, orderIsPayable, upsertOrderCookie } from "@/server/checkout";
import { OrderLookupError, trackOrderByNumberAndPhone } from "@/server/orders";
import { reconcileCapturedPayment } from "@/server/payments";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 20;
const hits = new Map<string, number[]>();

function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "local";
  }

  return headers.get("x-real-ip")?.trim() || "local";
}

function allowTrack(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return false;
  }

  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function POST(request: Request) {
  try {
    if (!allowTrack(clientIp(request.headers))) {
      return NextResponse.json({ error: "Too many tracking attempts. Try later." }, { status: 429 });
    }

    const body = (await request.json()) as { publicNumber?: string; phone?: string };
    const found = await trackOrderByNumberAndPhone(body.publicNumber ?? "", body.phone ?? "");

    if (!found) {
      return NextResponse.json(
        { error: "We couldn’t find an order with that number and phone." },
        { status: 404 },
      );
    }

    const order = await reconcileCapturedPayment(found);
    const response = NextResponse.json({
      publicNumber: order.publicNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      payable: orderIsPayable(order),
      createdAt: order.createdAt,
      items: order.items,
      subtotalPaise: order.subtotalPaise,
      shippingPaise: order.shippingPaise,
      shippingLabel: order.shippingLabel,
      grandTotalPaise: order.grandTotalPaise,
      phoneMasked: maskIndianPhone(order.phone),
      events: order.events ?? [],
      cancelReason: order.cancelReason ?? null,
      shippedAt: order.shippedAt ?? null,
      courierName: order.courierName ?? null,
      trackingId: order.trackingId ?? null,
      trackingUrl: order.trackingUrl ?? null,
      trackingLocation: order.trackingLocation ?? null,
      address: {
        name: order.address.name,
        line1: order.address.line1,
        line2: order.address.line2,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      },
    });
    applyOrderCookie(response, await upsertOrderCookie(order));
    return response;
  } catch (error) {
    if (error instanceof OrderLookupError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not look up the order." }, { status: 500 });
  }
}

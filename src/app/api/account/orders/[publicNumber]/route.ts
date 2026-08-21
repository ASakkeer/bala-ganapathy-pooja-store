import { NextResponse } from "next/server";
import { PRIVATE_CACHE_CONTROL } from "@/lib/cache";
import { getSession } from "@/server/auth";
import { orderIsPayable, type PlacedOrder } from "@/server/checkout";
import { getOwnedOrder } from "@/server/orders";
import { reconcileCapturedPayment } from "@/server/payments";

export const runtime = "nodejs";

function toClientOrder(order: PlacedOrder) {
  return {
    publicNumber: order.publicNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: order.items,
    subtotalPaise: order.subtotalPaise,
    shippingPaise: order.shippingPaise,
    shippingLabel: order.shippingLabel,
    grandTotalPaise: order.grandTotalPaise,
    events: order.events ?? [],
    cancelReason: order.cancelReason ?? null,
    shippedAt: order.shippedAt ?? null,
    courierName: order.courierName ?? null,
    trackingId: order.trackingId ?? null,
    trackingUrl: order.trackingUrl ?? null,
    trackingLocation: order.trackingLocation ?? null,
    address: order.address,
  };
}

type RouteContext = { params: Promise<{ publicNumber: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in to view this order." }, { status: 401 });
    }

    const { publicNumber } = await context.params;
    const found = await getOwnedOrder(decodeURIComponent(publicNumber));
    if (!found) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = await reconcileCapturedPayment(found);
    return NextResponse.json(
      {
        order: toClientOrder(order),
        payable: orderIsPayable(order),
      },
      { headers: { "Cache-Control": PRIVATE_CACHE_CONTROL } },
    );
  } catch {
    return NextResponse.json({ error: "Could not load the order." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import { applyOrderCookie, orderIsPayable, upsertOrderCookie } from "@/server/checkout";
import { getOwnedOrder } from "@/server/orders";
import { PaymentError, reconcileCapturedPayment } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { publicNumber?: string };
    const publicNumber = body.publicNumber?.trim() ?? "";
    if (!publicNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    const order = await getOwnedOrder(publicNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updated = await reconcileCapturedPayment(order);
    const response = NextResponse.json({
      ok: true,
      publicNumber: updated.publicNumber,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      payable: orderIsPayable(updated),
    });
    applyOrderCookie(response, await upsertOrderCookie(updated));
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not refresh payment status." }, { status: 500 });
  }
}

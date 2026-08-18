import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import { applyOrderCookie, upsertOrderCookie } from "@/server/checkout";
import { PaymentError, verifyRazorpayCheckout } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicNumber?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const updated = await verifyRazorpayCheckout({
      publicNumber: body.publicNumber ?? "",
      razorpayOrderId: body.razorpay_order_id ?? "",
      razorpayPaymentId: body.razorpay_payment_id ?? "",
      razorpaySignature: body.razorpay_signature ?? "",
    });

    const response = NextResponse.json({
      ok: true,
      publicNumber: updated?.publicNumber,
      status: updated?.status,
    });
    if (updated) {
      applyOrderCookie(response, await upsertOrderCookie(updated));
    }
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 });
  }
}

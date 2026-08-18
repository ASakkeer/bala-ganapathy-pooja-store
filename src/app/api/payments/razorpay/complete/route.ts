import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import {
  applyOrderCookie,
  getOrderByPublicNumber,
  upsertOrderCookie,
} from "@/server/checkout";
import {
  PaymentError,
  reconcileCapturedPayment,
  verifyRazorpayCheckout,
} from "@/server/payments";

export const runtime = "nodejs";

function safeNext(raw: string | null, publicNumber: string) {
  const fallback = `/order/confirmation/${encodeURIComponent(publicNumber)}`;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }

  if (
    raw.startsWith("/order/confirmation/") ||
    raw.startsWith("/account/orders/") ||
    raw.startsWith("/track")
  ) {
    return raw;
  }

  return fallback;
}

function firstValue(value: string | File | null) {
  return typeof value === "string" ? value : "";
}

async function paymentParams(request: Request) {
  const url = new URL(request.url);
  const params = {
    publicNumber: url.searchParams.get("publicNumber") ?? "",
    razorpayOrderId: url.searchParams.get("razorpay_order_id") ?? "",
    razorpayPaymentId: url.searchParams.get("razorpay_payment_id") ?? "",
    razorpaySignature: url.searchParams.get("razorpay_signature") ?? "",
    sync: url.searchParams.get("sync") === "1",
    next: url.searchParams.get("next"),
  };

  if (request.method !== "POST") {
    return params;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string | undefined>;
    return {
      publicNumber: body.publicNumber ?? params.publicNumber,
      razorpayOrderId: body.razorpay_order_id ?? params.razorpayOrderId,
      razorpayPaymentId: body.razorpay_payment_id ?? params.razorpayPaymentId,
      razorpaySignature: body.razorpay_signature ?? params.razorpaySignature,
      sync: body.sync === "1" || params.sync,
      next: body.next ?? params.next,
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return {
      publicNumber: firstValue(form.get("publicNumber")) || params.publicNumber,
      razorpayOrderId: firstValue(form.get("razorpay_order_id")) || params.razorpayOrderId,
      razorpayPaymentId: firstValue(form.get("razorpay_payment_id")) || params.razorpayPaymentId,
      razorpaySignature: firstValue(form.get("razorpay_signature")) || params.razorpaySignature,
      sync: firstValue(form.get("sync")) === "1" || params.sync,
      next: firstValue(form.get("next")) || params.next,
    };
  }

  return params;
}

async function finishPayment(request: Request) {
  const params = await paymentParams(request);
  const publicNumber = params.publicNumber.trim();
  if (!publicNumber) {
    return NextResponse.redirect(new URL("/track", request.url));
  }

  const confirmation = new URL(safeNext(params.next, publicNumber), request.url);

  try {
    let updated = null as Awaited<ReturnType<typeof verifyRazorpayCheckout>>;

    if (params.razorpayOrderId && params.razorpayPaymentId && params.razorpaySignature && !params.sync) {
      try {
        updated = await verifyRazorpayCheckout({
          publicNumber,
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        });
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
      }
    }

    if (!updated) {
      const order = await getOrderByPublicNumber(publicNumber);
      updated = order ? await reconcileCapturedPayment(order) : null;
    }

    const response = NextResponse.redirect(confirmation);
    if (updated) {
      applyOrderCookie(response, await upsertOrderCookie(updated));
    }
    return response;
  } catch (error) {
    confirmation.searchParams.set("pay_error", "1");
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (error instanceof PaymentError && error.status === 401) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.redirect(confirmation);
  }
}

export async function GET(request: Request) {
  return finishPayment(request);
}

export async function POST(request: Request) {
  return finishPayment(request);
}

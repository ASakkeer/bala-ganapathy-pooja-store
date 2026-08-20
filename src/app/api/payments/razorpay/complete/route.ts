import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import {
  applyOrderCookie,
  getOrderByPublicNumber,
  orderIsPayable,
  upsertOrderCookie,
  type PlacedOrder,
} from "@/server/checkout";
import {
  PaymentError,
  reconcileCapturedPayment,
  recordPaymentFailureForOrder,
  verifyRazorpayCheckout,
} from "@/server/payments";

export const runtime = "nodejs";

function seeOther(url: URL) {
  return NextResponse.redirect(url, 303);
}

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
    errorCode:
      url.searchParams.get("error[code]") ?? url.searchParams.get("error_code") ?? "",
    errorDescription:
      url.searchParams.get("error[description]") ??
      url.searchParams.get("error_description") ??
      "",
    errorPaymentId: url.searchParams.get("error[metadata][payment_id]") ?? "",
    errorOrderId: url.searchParams.get("error[metadata][order_id]") ?? "",
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
      errorCode: body["error[code]"] ?? body.error_code ?? params.errorCode,
      errorDescription:
        body["error[description]"] ?? body.error_description ?? params.errorDescription,
      errorPaymentId: body["error[metadata][payment_id]"] ?? params.errorPaymentId,
      errorOrderId: body["error[metadata][order_id]"] ?? params.errorOrderId,
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
      errorCode:
        firstValue(form.get("error[code]")) ||
        firstValue(form.get("error_code")) ||
        params.errorCode,
      errorDescription:
        firstValue(form.get("error[description]")) ||
        firstValue(form.get("error_description")) ||
        params.errorDescription,
      errorPaymentId:
        firstValue(form.get("error[metadata][payment_id]")) || params.errorPaymentId,
      errorOrderId: firstValue(form.get("error[metadata][order_id]")) || params.errorOrderId,
      sync: firstValue(form.get("sync")) === "1" || params.sync,
      next: firstValue(form.get("next")) || params.next,
    };
  }

  return params;
}

function destination(request: Request, nextPath: string | null, publicNumber: string, flag: "paid" | "pay_failed" | "pay_error") {
  const confirmation = new URL(safeNext(nextPath, publicNumber), request.url);
  confirmation.searchParams.delete("paid");
  confirmation.searchParams.delete("pay_failed");
  confirmation.searchParams.delete("pay_error");
  confirmation.searchParams.delete("synced");
  confirmation.searchParams.set(flag, "1");
  return confirmation;
}

async function finishPayment(request: Request) {
  const params = await paymentParams(request);
  const publicNumber = params.publicNumber.trim();
  if (!publicNumber) {
    return seeOther(new URL("/track", request.url));
  }

  try {
    let updated: PlacedOrder | null = null;

    if (params.errorCode || params.errorPaymentId) {
      updated = await recordPaymentFailureForOrder({
        publicNumber,
        razorpayOrderId: params.errorOrderId || params.razorpayOrderId || null,
        razorpayPaymentId: params.errorPaymentId || params.razorpayPaymentId || null,
        reason: params.errorDescription || "Payment failed at Razorpay.",
      });
      const response = seeOther(destination(request, params.next, publicNumber, "pay_failed"));
      if (updated) {
        applyOrderCookie(response, await upsertOrderCookie(updated));
      }
      return response;
    }

    if (params.razorpayOrderId && params.razorpayPaymentId && params.razorpaySignature) {
      try {
        updated = await verifyRazorpayCheckout({
          publicNumber,
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        });
      } catch (error) {
        if (error instanceof AuthError || (error instanceof PaymentError && error.status === 401)) {
          throw error;
        }
      }
    }

    if (!updated || orderIsPayable(updated)) {
      const order = updated ?? (await getOrderByPublicNumber(publicNumber));
      updated = order ? await reconcileCapturedPayment(order) : null;
    }

    const paid = Boolean(updated && !orderIsPayable(updated) && updated.paymentStatus === "captured");
    const failed = updated?.status === "payment_failed" || updated?.paymentStatus === "failed";
    const flag = paid ? "paid" : failed ? "pay_failed" : "pay_error";
    const response = seeOther(destination(request, params.next, publicNumber, flag));
    if (updated) {
      applyOrderCookie(response, await upsertOrderCookie(updated));
    }
    return response;
  } catch (error) {
    const confirmation = destination(request, params.next, publicNumber, "pay_error");
    if (error instanceof AuthError || (error instanceof PaymentError && error.status === 401)) {
      return seeOther(new URL("/login", request.url));
    }

    return seeOther(confirmation);
  }
}

export async function GET(request: Request) {
  return finishPayment(request);
}

export async function POST(request: Request) {
  return finishPayment(request);
}

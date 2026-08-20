import "server-only";

import Razorpay from "razorpay";
import { STORE_NAME } from "@/lib/constants";
import { verifyCheckoutSignature, verifyWebhookBody } from "@/lib/razorpay-signature";
import { getSession } from "@/server/auth";
import {
  applyOrderPayment,
  getOrderByPublicNumber,
  getOrderByRazorpayOrderId,
  orderIsPayable,
  setOrderRazorpayOrderId,
  type PlacedOrder,
} from "@/server/checkout";
import { env, isRazorpayConfigured, requireRazorpayKeys } from "@/server/env";
import { getOwnedOrder } from "@/server/orders";

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

const processedPaymentIds = new Set<string>();

export { verifyCheckoutSignature, verifyWebhookBody };

function razorpayClient() {
  const keys = requireRazorpayKeys();
  return {
    keys,
    client: new Razorpay({ key_id: keys.keyId, key_secret: keys.keySecret }),
  };
}

function paiseAmount(value: number | string | undefined) {
  const amount = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(amount) ? amount : null;
}

async function requireOwnedOrder(publicNumber: string) {
  const order = await getOwnedOrder(publicNumber);
  if (order) {
    return order;
  }

  const exists = await getOrderByPublicNumber(publicNumber);
  if (exists && !(await getSession())) {
    throw new PaymentError("Sign in to pay for this order.", 401);
  }

  throw new PaymentError("Order not found.", 404);
}

export async function createRazorpayOrder(publicNumber: string) {
  if (!isRazorpayConfigured()) {
    throw new PaymentError(
      "Razorpay test keys are not set. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      503,
    );
  }

  const order = await requireOwnedOrder(publicNumber);

  if (!orderIsPayable(order)) {
    throw new PaymentError("This order is not waiting for payment.", 409);
  }

  const { keys, client } = razorpayClient();
  let rzpOrder: { id: string };
  try {
    rzpOrder = await client.orders.create({
      amount: order.grandTotalPaise,
      currency: "INR",
      receipt: `${order.publicNumber}-${Date.now()}`.slice(0, 40),
      notes: {
        publicNumber: order.publicNumber,
        orderId: order.id,
      },
    });
  } catch {
    throw new PaymentError("Could not create a Razorpay order. Check the test keys.", 502);
  }

  await setOrderRazorpayOrderId(order.publicNumber, rzpOrder.id);

  return {
    keyId: keys.publicKeyId,
    razorpayOrderId: rzpOrder.id,
    amountPaise: order.grandTotalPaise,
    currency: "INR" as const,
    publicNumber: order.publicNumber,
    name: order.address.name,
    phone: order.phone,
    description: `${STORE_NAME} ${order.publicNumber}`,
  };
}

async function markOrderPaid(input: {
  order: PlacedOrder;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  method?: string | null;
  rawPayload?: unknown;
  eventNote: string;
}) {
  const updated = await applyOrderPayment({
    publicNumber: input.order.publicNumber,
    status: "processing",
    paymentStatus: "captured",
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    method: input.method,
    eventNote: input.eventNote,
    rawPayload: input.rawPayload,
  });

  if (input.razorpayPaymentId) {
    processedPaymentIds.add(input.razorpayPaymentId);
  }

  return updated ?? input.order;
}

export async function recordPaymentFailureForOrder(input: {
  publicNumber: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  reason?: string | null;
}) {
  const order = await getOrderByPublicNumber(input.publicNumber);
  if (!order) {
    return null;
  }

  if (order.paymentStatus === "captured" || order.status === "processing") {
    return order;
  }

  return applyOrderPayment({
    publicNumber: order.publicNumber,
    status: "payment_failed",
    paymentStatus: "failed",
    razorpayOrderId: input.razorpayOrderId ?? order.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    eventNote: input.reason?.trim() || "Payment failed. The customer can retry.",
  });
}

export async function markRazorpayPaymentFailed(input: {
  publicNumber: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  reason?: string | null;
}) {
  await requireOwnedOrder(input.publicNumber);
  const updated = await recordPaymentFailureForOrder(input);
  if (!updated) {
    throw new PaymentError("Order not found.", 404);
  }
  return updated;
}

export async function verifyRazorpayCheckout(input: {
  publicNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keys, client } = razorpayClient();
  const order =
    (await getOwnedOrder(input.publicNumber)) ?? (await getOrderByPublicNumber(input.publicNumber));

  if (!order) {
    throw new PaymentError("Order not found.", 404);
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== input.razorpayOrderId) {
    throw new PaymentError("Payment does not match this order.", 400);
  }

  const valid = verifyCheckoutSignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
    keys.keySecret,
  );

  if (!valid) {
    throw new PaymentError("Payment signature is invalid.", 400);
  }

  let payment: {
    amount?: number | string;
    order_id?: string;
    method?: string;
    status?: string;
    notes?: { publicNumber?: string };
  } | null = null;

  try {
    payment = await client.payments.fetch(input.razorpayPaymentId);
  } catch {
    payment = null;
  }

  if (payment) {
    const paidAmount = paiseAmount(payment.amount);
    const notes = payment.notes;

    if (notes?.publicNumber && notes.publicNumber !== order.publicNumber) {
      throw new PaymentError("Payment does not match this order.", 400);
    }

    if (paidAmount !== order.grandTotalPaise) {
      throw new PaymentError("Paid amount does not match this order.", 400);
    }

    if (payment.order_id && payment.order_id !== input.razorpayOrderId) {
      throw new PaymentError("Payment does not match this order.", 400);
    }

    if (payment.status === "failed") {
      return (
        (await applyOrderPayment({
          publicNumber: order.publicNumber,
          status: "payment_failed",
          paymentStatus: "failed",
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          method: typeof payment.method === "string" ? payment.method : null,
          eventNote: "Payment failed at Razorpay.",
          rawPayload: payment,
        })) ?? order
      );
    }

    if (payment.status === "authorized") {
      try {
        payment = await client.payments.capture(
          input.razorpayPaymentId,
          order.grandTotalPaise,
          "INR",
        );
      } catch {
        // Authorized payments still belong to this order; capture can finish on Razorpay's side.
      }
    }
  }

  return markOrderPaid({
    order,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    method: typeof payment?.method === "string" ? payment.method : null,
    rawPayload: payment,
    eventNote: "Payment received. The shop is preparing the order.",
  });
}

type RazorpayListedPayment = {
  id?: string;
  amount?: number | string;
  status?: string;
  method?: string;
  order_id?: string;
};

function listedPayments(payload: unknown): RazorpayListedPayment[] {
  if (Array.isArray(payload)) {
    return payload as RazorpayListedPayment[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as { items?: unknown; payments?: unknown; collection?: { items?: unknown } };
  for (const value of [record.items, record.payments, record.collection?.items]) {
    if (Array.isArray(value)) {
      return value as RazorpayListedPayment[];
    }
  }

  return [];
}

function matchingPaidPayment(listed: RazorpayListedPayment[], order: PlacedOrder) {
  return listed.find((payment) => {
    const amount = paiseAmount(payment.amount);
    return (
      amount === order.grandTotalPaise &&
      (payment.status === "captured" || payment.status === "authorized")
    );
  });
}

export async function reconcileCapturedPayment(order: PlacedOrder): Promise<PlacedOrder> {
  if (!isRazorpayConfigured() || !order.razorpayOrderId) {
    return order;
  }

  if (order.paymentStatus === "captured" && (order.status === "payment_confirmed" || order.status === "processing")) {
    if (order.status === "processing") {
      return order;
    }

    return (
      (await applyOrderPayment({
        publicNumber: order.publicNumber,
        status: "processing",
        paymentStatus: "captured",
        razorpayOrderId: order.razorpayOrderId,
        eventNote: "Payment received. The shop is preparing the order.",
      })) ?? order
    );
  }

  if (!orderIsPayable(order) && order.status !== "payment_confirmed") {
    return order;
  }

  try {
    const { client } = razorpayClient();
    let rzpOrder: { status?: string; amount?: number | string } | null = null;
    try {
      rzpOrder = await client.orders.fetch(order.razorpayOrderId);
    } catch {
      rzpOrder = null;
    }

    const listed = listedPayments(await client.orders.fetchPayments(order.razorpayOrderId));
    const paid = matchingPaidPayment(listed, order);

    if (paid?.status === "authorized" && paid.id) {
      try {
        await client.payments.capture(paid.id, order.grandTotalPaise, "INR");
      } catch {
        // fetchPayments already showed a matching authorized amount; still mark paid below if the order is paid.
      }
    }

    if (paid?.id) {
      return markOrderPaid({
        order,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: paid.id,
        method: typeof paid.method === "string" ? paid.method : null,
        rawPayload: paid,
        eventNote: "Payment captured. The shop is preparing the order.",
      });
    }

    if (rzpOrder?.status === "paid" && paiseAmount(rzpOrder.amount) === order.grandTotalPaise) {
      return markOrderPaid({
        order,
        razorpayOrderId: order.razorpayOrderId,
        eventNote: "Payment captured. The shop is preparing the order.",
        rawPayload: rzpOrder,
      });
    }

    const failed = listed.find((payment) => payment.status === "failed");
    if (failed && listed.every((payment) => payment.status !== "captured" && payment.status !== "authorized")) {
      return (
        (await applyOrderPayment({
          publicNumber: order.publicNumber,
          status: "payment_failed",
          paymentStatus: "failed",
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: failed.id,
          method: typeof failed.method === "string" ? failed.method : null,
          eventNote: "Payment failed. The customer can retry.",
          rawPayload: failed,
        })) ?? order
      );
    }

    return order;
  } catch {
    return order;
  }
}

type WebhookPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number | string;
  status?: string;
  method?: string;
  notes?: { publicNumber?: string; orderId?: string };
};

type WebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: WebhookPaymentEntity };
  };
};

export async function applyRazorpayWebhook(rawBody: string, signature: string | null) {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new PaymentError("RAZORPAY_WEBHOOK_SECRET is not set.", 503);
  }
  if (!signature || !verifyWebhookBody(rawBody, signature, secret)) {
    throw new PaymentError("Invalid webhook signature.", 400);
  }

  const body = JSON.parse(rawBody) as WebhookBody;
  const entity = body.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id;
  const razorpayPaymentId = entity?.id;

  if (!razorpayOrderId || !razorpayPaymentId) {
    return { ok: true, ignored: true };
  }

  if (processedPaymentIds.has(`${body.event}:${razorpayPaymentId}`) && body.event === "payment.captured") {
    const existing = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (existing?.status === "processing") {
      return { ok: true, ignored: true };
    }
  }

  const order =
    (await getOrderByRazorpayOrderId(razorpayOrderId)) ??
    (entity.notes?.publicNumber ? await getOrderByPublicNumber(entity.notes.publicNumber) : null);

  if (!order) {
    throw new PaymentError("Order not found for webhook.", 404);
  }

  if (body.event === "payment.failed") {
    await applyOrderPayment({
      publicNumber: order.publicNumber,
      status: "payment_failed",
      paymentStatus: "failed",
      razorpayOrderId,
      razorpayPaymentId,
      method: entity.method ?? null,
      eventNote: "Payment failed. The customer can retry.",
      rawPayload: entity,
    });
    processedPaymentIds.add(`${body.event}:${razorpayPaymentId}`);
    return { ok: true };
  }

  if (body.event !== "payment.captured" && body.event !== "order.paid") {
    return { ok: true, ignored: true };
  }

  const paidAmount = paiseAmount(entity.amount);
  if (paidAmount !== order.grandTotalPaise) {
    throw new PaymentError("Webhook amount does not match this order.", 400);
  }

  await applyOrderPayment({
    publicNumber: order.publicNumber,
    status: "processing",
    paymentStatus: "captured",
    razorpayOrderId,
    razorpayPaymentId,
    method: entity.method ?? null,
    eventNote: "Payment captured. Order is being prepared.",
    rawPayload: entity,
  });
  processedPaymentIds.add(`${body.event}:${razorpayPaymentId}`);
  return { ok: true };
}

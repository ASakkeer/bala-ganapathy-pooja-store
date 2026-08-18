import "server-only";

import Razorpay from "razorpay";
import { STORE_NAME } from "@/lib/constants";
import { verifyCheckoutSignature, verifyWebhookBody } from "@/lib/razorpay-signature";
import { requireSession } from "@/server/auth";
import {
  applyOrderPayment,
  getOrderByPublicNumber,
  getOrderByRazorpayOrderId,
  orderIsPayable,
  setOrderRazorpayOrderId,
  type PlacedOrder,
} from "@/server/checkout";
import { env, isRazorpayConfigured, requireRazorpayKeys } from "@/server/env";

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

function assertOwnsOrder(order: PlacedOrder, session: { userId: string; phone: string }) {
  if (order.phone === session.phone || (order.userId && order.userId === session.userId)) {
    return;
  }

  throw new PaymentError("Order not found.", 404);
}

export async function createRazorpayOrder(publicNumber: string) {
  const session = await requireSession();
  if (!isRazorpayConfigured()) {
    throw new PaymentError(
      "Razorpay test keys are not set. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      503,
    );
  }

  const order = await getOrderByPublicNumber(publicNumber);
  if (!order) {
    throw new PaymentError("Order not found.", 404);
  }

  assertOwnsOrder(order, session);

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

export async function verifyRazorpayCheckout(input: {
  publicNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const session = await requireSession();
  const { keys, client } = razorpayClient();
  const order = await getOrderByPublicNumber(input.publicNumber);

  if (!order) {
    throw new PaymentError("Order not found.", 404);
  }

  assertOwnsOrder(order, session);

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

  let payment: { amount?: number | string; order_id?: string; method?: string };
  try {
    payment = await client.payments.fetch(input.razorpayPaymentId);
  } catch {
    throw new PaymentError("Could not confirm this payment with Razorpay.", 502);
  }
  const paidAmount = typeof payment.amount === "string" ? Number(payment.amount) : payment.amount;
  const notes = (payment as { notes?: { publicNumber?: string } }).notes;

  if (notes?.publicNumber && notes.publicNumber !== order.publicNumber) {
    throw new PaymentError("Payment does not match this order.", 400);
  }

  if (paidAmount !== order.grandTotalPaise || payment.order_id !== input.razorpayOrderId) {
    throw new PaymentError("Paid amount does not match this order.", 400);
  }

  const updated = await applyOrderPayment({
    publicNumber: order.publicNumber,
    status: "processing",
    paymentStatus: "captured",
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    method: typeof payment.method === "string" ? payment.method : null,
    eventNote: "Payment received. The shop is preparing the order.",
    rawPayload: payment,
  });

  processedPaymentIds.add(input.razorpayPaymentId);
  return updated;
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

  if (payload && typeof payload === "object" && "items" in payload) {
    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items as RazorpayListedPayment[];
    }
  }

  return [];
}

export async function reconcileCapturedPayment(order: PlacedOrder): Promise<PlacedOrder> {
  if (!isRazorpayConfigured() || !order.razorpayOrderId) {
    return order;
  }

  if (order.paymentStatus === "captured" && order.status === "payment_confirmed") {
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

  if (!orderIsPayable(order)) {
    return order;
  }

  try {
    const { client } = razorpayClient();
    const listed = listedPayments(await client.orders.fetchPayments(order.razorpayOrderId));
    const captured = listed.find((payment) => {
      const amount = typeof payment.amount === "string" ? Number(payment.amount) : payment.amount;
      return payment.status === "captured" && amount === order.grandTotalPaise;
    });

    if (!captured?.id) {
      return order;
    }

    return (
      (await applyOrderPayment({
        publicNumber: order.publicNumber,
        status: "processing",
        paymentStatus: "captured",
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: captured.id,
        method: typeof captured.method === "string" ? captured.method : null,
        eventNote: "Payment captured. The shop is preparing the order.",
        rawPayload: captured,
      })) ?? order
    );
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
      status: "pending_payment",
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

  const paidAmount = typeof entity.amount === "string" ? Number(entity.amount) : entity.amount;
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

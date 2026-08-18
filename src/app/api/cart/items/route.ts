import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/server/auth";
import {
  addCartItem,
  applyCartCookie,
  CartError,
  cartItemBodySchema,
  removeCartItem,
  setCartItemQty,
} from "@/server/cart";

function errorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof CartError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Could not update the cart." }, { status: 500 });
}

async function jsonCart(
  mutate: () => ReturnType<typeof addCartItem>,
) {
  try {
    const result = await mutate();
    const response = NextResponse.json(result.snapshot);
    if (result.cookie) {
      applyCartCookie(response, result.cookie);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

async function parseBody(request: Request) {
  try {
    return cartItemBodySchema.parse(await request.json());
  } catch {
    throw new CartError("Invalid cart item.", 400);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await parseBody(request);
    const qty = body.qty;
    if (qty === undefined || qty < 1) {
      throw new CartError("Quantity must be at least 1.", 400);
    }
    return jsonCart(() => addCartItem(body.variantId, qty));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession();
    const body = await parseBody(request);
    const qty = body.qty;
    if (qty === undefined) {
      throw new CartError("Quantity is required.", 400);
    }
    return jsonCart(() => setCartItemQty(body.variantId, qty));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSession();
    const body = await parseBody(request);
    return jsonCart(() => removeCartItem(body.variantId));
  } catch (error) {
    return errorResponse(error);
  }
}

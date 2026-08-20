import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import {
  AddressError,
  addressBodySchema,
  applyAddressCookie,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/server/addresses";

type AddressRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: AddressRouteProps) {
  try {
    const { id } = await params;
    const body = addressBodySchema.parse(await request.json());
    const result = await updateAddress(id, body);
    const response = NextResponse.json({ address: result.address, items: result.items });
    applyAddressCookie(response, result.book);
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof AddressError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Check the address details and try again." }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update the address." }, { status: 500 });
  }
}

export async function PATCH(_request: Request, { params }: AddressRouteProps) {
  try {
    const { id } = await params;
    const result = await setDefaultAddress(id);
    const response = NextResponse.json({ address: result.address, items: result.items });
    applyAddressCookie(response, result.book);
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof AddressError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not update the address." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: AddressRouteProps) {
  try {
    const { id } = await params;
    const result = await deleteAddress(id);
    const response = NextResponse.json({ items: result.items });
    applyAddressCookie(response, result.book);
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof AddressError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not remove the address." }, { status: 500 });
  }
}

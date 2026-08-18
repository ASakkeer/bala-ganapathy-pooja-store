import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import {
  AddressError,
  addressBodySchema,
  applyAddressCookie,
  createAddress,
  listAddresses,
} from "@/server/addresses";

export async function GET() {
  try {
    const items = await listAddresses();
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AddressError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not load addresses." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = addressBodySchema.parse(await request.json());
    const result = await createAddress(body);
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

    return NextResponse.json({ error: "Could not save the address." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/server/auth";
import { getServiceablePincode } from "@/server/queries/pincodes";

export async function GET(request: Request) {
  try {
    await requireSession();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not check pincode." }, { status: 500 });
  }

  const pincode = new URL(request.url).searchParams.get("pincode") ?? "";
  const row = await getServiceablePincode(pincode);

  if (!row) {
    return NextResponse.json({
      serviceable: false,
      message: "We don’t deliver to this pincode yet.",
    });
  }

  return NextResponse.json({
    serviceable: true,
    message: "This pincode is serviceable. Delivery timing is confirmed after payment.",
  });
}

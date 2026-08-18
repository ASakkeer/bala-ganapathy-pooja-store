import { NextResponse } from "next/server";
import { AdminError } from "@/server/admin/catalog";
import {
  addAdminPincode,
  listAdminPincodes,
  pincodeBodySchema,
  removeAdminPincode,
} from "@/server/admin/settings";
import { AuthError, requireAdmin } from "@/server/auth";

export async function GET() {
  try {
    await requireAdmin();
    const pincodes = await listAdminPincodes();
    return NextResponse.json({ pincodes });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load pincodes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = pincodeBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid pincode." }, { status: 400 });
    }
    await addAdminPincode(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not add the pincode." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    await removeAdminPincode(searchParams.get("pincode") ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not remove the pincode." }, { status: 500 });
  }
}

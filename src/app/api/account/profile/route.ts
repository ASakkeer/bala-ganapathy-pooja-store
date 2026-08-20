import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import {
  applyProfileCookie,
  ProfileError,
  profileBodySchema,
  updateAccountProfile,
} from "@/server/profile";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const body = profileBodySchema.parse(await request.json());
    const profile = await updateAccountProfile(body);
    const response = NextResponse.json({
      ok: true,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    applyProfileCookie(response, profile.stored);
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof ProfileError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Check your details and try again." }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not save your profile." }, { status: 500 });
  }
}

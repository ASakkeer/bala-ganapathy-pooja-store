import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminError } from "@/server/admin/catalog";
import { saveAdminHeroImage } from "@/server/admin/settings";
import { AuthError, requireAdmin } from "@/server/auth";

const heroBodySchema = z.object({
  heroImage: z
    .string()
    .trim()
    .nullable()
    .refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), {
      message: "Images must be a site path or an https URL.",
    }),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = heroBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid banner." }, { status: 400 });
    }
    const heroImage = await saveAdminHeroImage(parsed.data.heroImage);
    return NextResponse.json({ ok: true, heroImage });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the home banner." }, { status: 500 });
  }
}

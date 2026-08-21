import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminError } from "@/server/admin/catalog";
import { analyzeAdminProductSheet, importAdminProductSheet } from "@/server/admin/product-bulk";
import { AuthError, requireAdmin } from "@/server/auth";

export const runtime = "nodejs";

const imageNamesSchema = z.array(z.string().trim().min(1).max(180)).max(80);
const imageUrlsSchema = z
  .record(z.string().trim().min(1).max(180), z.string().trim().min(1).max(500))
  .refine((value) => Object.keys(value).length <= 80, "Too many photos.");

function asFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const sheet = asFile(form.get("sheet"));
    if (!sheet) {
      return NextResponse.json({ error: "Choose an Excel .xlsx or CSV file." }, { status: 400 });
    }

    const mode = String(form.get("mode") ?? "check");
    if (mode === "import") {
      const parsedUrls = imageUrlsSchema.safeParse(JSON.parse(String(form.get("imageUrls") || "{}")));
      if (!parsedUrls.success) {
        return NextResponse.json({ error: "Photo list is invalid." }, { status: 400 });
      }
      const imageUrls: Record<string, string> = {};
      for (const [name, url] of Object.entries(parsedUrls.data)) {
        if (!url.startsWith("/uploads/") && !url.startsWith("https://")) {
          return NextResponse.json({ error: `Photo “${name}” is not a saved upload.` }, { status: 400 });
        }
        imageUrls[name.toLowerCase()] = url;
      }
      const result = await importAdminProductSheet(sheet, imageUrls);
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    const parsedNames = imageNamesSchema.safeParse(JSON.parse(String(form.get("imageNames") || "[]")));
    if (!parsedNames.success) {
      return NextResponse.json({ error: "Photo list is invalid." }, { status: 400 });
    }
    const result = await analyzeAdminProductSheet(sheet, parsedNames.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Photo list is invalid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not read the sheet." }, { status: 500 });
  }
}

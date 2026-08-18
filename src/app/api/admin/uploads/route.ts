import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/server/auth";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Images must be 2 MB or smaller." }, { status: 400 });
    }

    const extension = TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), bytes);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not upload the image." }, { status: 500 });
  }
}

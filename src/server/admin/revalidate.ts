import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/p/${slug}`);
  }
}

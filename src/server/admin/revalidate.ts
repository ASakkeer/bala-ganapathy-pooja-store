import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

export function revalidateCatalog(slug?: string) {
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath("/c", "layout");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidateTag(CACHE_TAGS.product(slug), "max");
    revalidatePath(`/p/${slug}`);
  }
}

export function revalidateStore() {
  revalidateTag(CACHE_TAGS.store, "max");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/policies/shipping");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export function revalidatePincodes() {
  revalidateTag(CACHE_TAGS.pincodes, "max");
}

export function revalidateOrder(publicNumber: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${encodeURIComponent(publicNumber)}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${encodeURIComponent(publicNumber)}`);
  revalidatePath(`/order/confirmation/${encodeURIComponent(publicNumber)}`);
  revalidatePath("/track");
}

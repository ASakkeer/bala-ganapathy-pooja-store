import type { Metadata } from "next";
import { STORE_LOGO_SRC, STORE_NAME } from "@/lib/constants";

export function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const origin = siteOrigin();
  if (!path || path === "/") {
    return origin;
  }

  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  images,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const absoluteImages = (images?.length ? images : [STORE_LOGO_SRC]).map((image) =>
    absoluteUrl(image),
  );

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url,
      siteName: STORE_NAME,
      locale: "en_IN",
      type: "website",
      images: absoluteImages,
    },
    twitter: {
      card: images?.length ? "summary_large_image" : "summary",
      title,
      description,
      images: absoluteImages,
    },
  };
}

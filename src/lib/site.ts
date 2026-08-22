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

export function storeEntityId() {
  return `${siteOrigin()}/#store`;
}

export function websiteEntityId() {
  return `${siteOrigin()}/#website`;
}

export function pageMetadata({
  title,
  description,
  path,
  images,
  index = true,
  keywords,
  follow,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  index?: boolean;
  keywords?: string[];
  follow?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const shouldFollow = follow ?? index;
  const absoluteImages = (images?.length ? images : [STORE_LOGO_SRC]).map((image) =>
    absoluteUrl(image),
  );
  const ogImages = absoluteImages.map((image) => ({
    url: image,
    alt: title,
  }));

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
        "x-default": url,
      },
    },
    robots: {
      index,
      follow: shouldFollow,
      googleBot: {
        index,
        follow: shouldFollow,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: STORE_NAME,
      locale: "en_IN",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: images?.length ? "summary_large_image" : "summary",
      title,
      description,
      images: absoluteImages,
    },
  };
}

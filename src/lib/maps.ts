export const SHOP_ADDRESS =
  "193, Thiyagaraya New Street 3, Sukrawar Pettai, R.S. Puram, Coimbatore, Tamil Nadu 641001";

export const SHOP_MAPS_SHARE_URL = "https://maps.app.goo.gl/KM7VKLQ7jRa1RCHU8";

export const SHOP_PHONES = ["8903135125", "8870903941"] as const;

export function isHttpsUrl(raw?: string | null) {
  if (!raw?.trim()) {
    return false;
  }

  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

export function isGoogleMapsEmbedUrl(raw?: string | null) {
  if (!isHttpsUrl(raw) || !raw) {
    return false;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "");
    return (
      (host === "google.com" || host === "google.co.in" || host === "maps.google.com") &&
      (parsed.searchParams.get("output") === "embed" || parsed.pathname.includes("/maps/embed"))
    );
  } catch {
    return false;
  }
}

export function mapsEmbedUrlFromAddress(address?: string | null) {
  const value = address?.trim();
  if (!value) {
    return null;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
}

export function mapsDirectionsHref(mapUrl?: string | null, address?: string | null) {
  if (isHttpsUrl(mapUrl) && mapUrl) {
    return mapUrl;
  }

  const value = address?.trim();
  if (!value) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

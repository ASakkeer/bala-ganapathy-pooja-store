export { CATEGORIES } from "@/content/catalog";

export const STORE_NAME = "Bala Ganapathy Pooja Store";

/** Served from `public/assets/bgps-logo.png`. Query busts stale browser/optimizer cache. */
export const STORE_LOGO_SRC = "/assets/bgps-logo.png?v=3";

export const DEFAULT_CURRENCY = "INR" as const;

export const PAGE_SIZE = 24;

/** Hide the announcement bar when empty. Do not invent festival or delivery copy. */
export const ANNOUNCEMENT_MESSAGE = "";

export const HELP_LINKS = [
  { name: "Track order", href: "/track" },
  { name: "Contact", href: "/contact" },
  { name: "About", href: "/about" },
] as const;

export const POLICY_LINKS = [
  { name: "Shipping policy", href: "/policies/shipping" },
  { name: "Returns & refunds", href: "/policies/returns" },
  { name: "Privacy policy", href: "/policies/privacy" },
  { name: "Terms & conditions", href: "/policies/terms" },
] as const;

export { CATEGORIES } from "@/content/catalog";

export const STORE_NAME = "Bala Ganapathy Pooja Store";

/** Served from `public/assets/bgps-logo.png`. Query busts stale browser/optimizer cache. */
export const STORE_LOGO_SRC = "/assets/bgps-logo.png?v=3";

/** Light mark for the maroon footer only. */
export const STORE_FOOTER_LOGO_SRC = "/assets/bgps-footer-logo.png";

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

export const FOOTER_SUPPORT_LINKS = [
  { name: "Track Order", href: "/track" },
  { name: "Contact Us", href: "/contact" },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Store Location", href: "/contact" },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { name: "Privacy Policy", href: "/policies/privacy" },
  { name: "Terms & Conditions", href: "/policies/terms" },
  { name: "Shipping Policy", href: "/policies/shipping" },
  { name: "Returns & Refunds", href: "/policies/returns" },
] as const;

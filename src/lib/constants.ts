export { CATEGORIES } from "@/content/catalog";

export const STORE_NAME = "Bala Ganapathy Pooja Store";

/** Served from `public/assets/bgps-logo.png`. Query busts stale browser/optimizer cache. */
export const STORE_LOGO_SRC = "/assets/bgps-logo.png?v=3";

/** Tab icon and Apple touch icon. Served from `public/assets/bgps-favicon.png`. */
export const STORE_FAVICON_SRC = "/assets/bgps-favicon.png";

/** Light mark for the maroon footer only. */
export const STORE_FOOTER_LOGO_SRC = "/assets/bgps-footer-logo.png";

export const STORE_THEME_COLOR = "#5b0719";
export const STORE_BACKGROUND_COLOR = "#fcf9f8";

export const STORE_SEO_DESCRIPTION =
  "Traditional pooja essentials, Ganapathy and Navagraha Homam materials, kumbabishekam requirements, and naattu marundhu from Bala Ganapathy Pooja Store, R.S. Puram, Coimbatore.";

export const STORE_SEO_KEYWORDS = [
  "Bala Ganapathy Pooja Store",
  "pooja store Coimbatore",
  "pooja samagri R.S. Puram",
  "Ganapathy Homam materials",
  "Navagraha Homam",
  "kumbabishekam",
  "naattu marundhu",
] as const;

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

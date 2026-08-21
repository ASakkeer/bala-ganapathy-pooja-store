/**
 * Demo catalog adapter — not real Bala Ganapathy inventory until admin replaces it.
 * Product copy, prices, and photos live in src/content/catalog.ts.
 */
import { CATEGORIES, CATALOG_PRODUCTS } from "@/content/catalog";
import type { HomeContent } from "@/content/home-content";
import { SHOP_ADDRESS, SHOP_MAPS_SHARE_URL, SHOP_PHONES } from "@/lib/maps";

const createdAt = new Date("2026-08-01T06:00:00.000Z");

export const MOCK_CATEGORIES = CATEGORIES.map((category, index) => ({
  id: `cat-${category.slug}`,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: null as string | null,
  sortOrder: index,
  isActive: true,
  createdAt,
}));

const categoryBySlug = Object.fromEntries(
  MOCK_CATEGORIES.map((category) => [category.slug, category]),
);

export const MOCK_STORE_SETTINGS: {
  id: string;
  phones: string[];
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  mapUrl: string | null;
  announcement: string | null;
  heroImage: string | null;
  homeContent: HomeContent | null;
  shippingRules: {
    flatShippingPaise: number;
    label: string;
  } | null;
  updatedAt: Date;
} = {
  id: "00000000-0000-4000-8000-000000000001",
  phones: [...SHOP_PHONES],
  whatsapp: null,
  address: SHOP_ADDRESS,
  hours: null,
  mapUrl: SHOP_MAPS_SHARE_URL,
  announcement: null,
  heroImage: null,
  homeContent: null,
  shippingRules: {
    flatShippingPaise: 5000,
    label: "Shipping ₹50 — confirmed at checkout",
  },
  updatedAt: createdAt,
};

export const MOCK_PINCODES: Array<{
  pincode: string;
  codAllowed: boolean;
  estimatedDays: number | null;
}> = [
  { pincode: "641001", codAllowed: false, estimatedDays: 2 },
  { pincode: "110001", codAllowed: false, estimatedDays: 5 },
  { pincode: "400001", codAllowed: false, estimatedDays: 4 },
  { pincode: "560001", codAllowed: false, estimatedDays: 4 },
];

export type MockProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  howToUse: string | null;
  categoryId: string;
  status: "draft" | "active" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  searchKeywords: string[];
  images: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: (typeof MOCK_CATEGORIES)[number];
  variants: Array<{
    id: string;
    productId: string;
    sku: string;
    name: string;
    pricePaise: number;
    mrpPaise: number | null;
    weightGrams: number | null;
    stockQty: number;
    isActive: boolean;
  }>;
};

export const MOCK_PRODUCTS: MockProduct[] = CATALOG_PRODUCTS.map((item) => {
  const category = categoryBySlug[item.categorySlug];

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.shortDescription,
    howToUse: item.howToUse,
    categoryId: category.id,
    status: "active" as const,
    seoTitle: `${item.name} / ${item.nameTa}`,
    seoDescription: item.shortDescription,
    searchKeywords: item.aliases,
    images: item.images,
    isFeatured: item.isFeatured,
    createdAt,
    updatedAt: createdAt,
    category,
    variants: item.variants.map((variant) => ({
      ...variant,
      productId: item.id,
      isActive: true,
    })),
  };
});

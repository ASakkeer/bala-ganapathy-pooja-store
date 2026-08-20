export const CACHE_TAGS = {
  catalog: "catalog",
  categories: "catalog:categories",
  store: "store",
  pincodes: "pincodes",
  product: (slug: string) => `catalog:product:${slug}`,
} as const;

/** Cross-request TTLs in seconds. Private data must not use these. */
export const CACHE_TTL = {
  categories: 300,
  products: 60,
  search: 30,
  store: 600,
  pincodes: 600,
} as const;

export const PRIVATE_CACHE_CONTROL = "private, no-store";
export const PUBLIC_ASSET_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";
export const IMMUTABLE_UPLOAD_CACHE_CONTROL = "public, max-age=31536000, immutable";

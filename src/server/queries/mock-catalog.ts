import type { CatalogSort } from "@/lib/catalog";
import {
  MOCK_CATEGORIES,
  MOCK_PINCODES,
  MOCK_PRODUCTS,
  MOCK_STORE_SETTINGS,
  type MockProduct,
} from "@/lib/mock-data";
import { catalogProductMatchesQuery, getCatalogProduct } from "@/content/catalog";
import type { ProductStatus } from "@/types";

const catalog: MockProduct[] = MOCK_PRODUCTS;
const pincodes = MOCK_PINCODES.map((row) => ({ ...row }));
const settings = {
  ...MOCK_STORE_SETTINGS,
  phones: [...MOCK_STORE_SETTINGS.phones],
  shippingRules: MOCK_STORE_SETTINGS.shippingRules
    ? { ...MOCK_STORE_SETTINGS.shippingRules }
    : null,
};

function minPrice(product: MockProduct) {
  return Math.min(...product.variants.map((variant) => variant.pricePaise));
}

function isInStock(product: MockProduct) {
  return product.variants.some((variant) => variant.isActive && variant.stockQty > 0);
}

export function mockListCategories() {
  return [...MOCK_CATEGORIES].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export function mockGetCategoryBySlug(slug: string) {
  return MOCK_CATEGORIES.find((category) => category.slug === slug && category.isActive);
}

export function mockGetProductBySlug(slug: string) {
  const mapped = getCatalogProduct(slug);
  const resolved = mapped?.slug ?? slug;
  return MOCK_PRODUCTS.find((product) => product.slug === resolved && product.status === "active");
}

export function mockListProducts(options?: {
  categorySlug?: string;
  categorySlugs?: string[];
  featured?: boolean;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const pageSize = options?.pageSize ?? 24;
  const slugs = options?.categorySlugs ?? (options?.categorySlug ? [options.categorySlug] : []);

  let rows = MOCK_PRODUCTS.filter((product) => product.status === "active");

  if (options?.featured) {
    rows = rows.filter((product) => product.isFeatured);
  }

  if (slugs.length > 0) {
    rows = rows.filter((product) => slugs.includes(product.category.slug));
  }

  if (options?.inStockOnly) {
    rows = rows.filter(isInStock);
  }

  rows = [...rows].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return rows.slice((page - 1) * pageSize, page * pageSize);
}

export function mockListCatalog(options: {
  categorySlug?: string;
  sort?: CatalogSort;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize = options.pageSize ?? 24;
  const sort = options.sort ?? "featured";

  let rows = MOCK_PRODUCTS.filter((product) => product.status === "active");

  if (options.categorySlug) {
    const category = mockGetCategoryBySlug(options.categorySlug);
    if (!category) {
      return { items: [], total: 0, page, pageSize };
    }
    rows = rows.filter((product) => product.category.slug === options.categorySlug);
  }

  if (options.inStockOnly) {
    rows = rows.filter(isInStock);
  }

  rows = [...rows].sort((a, b) => {
    if (sort === "price-asc") {
      return minPrice(a) - minPrice(b);
    }
    if (sort === "price-desc") {
      return minPrice(b) - minPrice(a);
    }
    if (sort === "newest") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (a.isFeatured !== b.isFeatured) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = rows.length;
  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
  };
}

export function mockCountProducts() {
  return MOCK_PRODUCTS.filter((product) => product.status === "active").length;
}

export function mockSearchProducts(
  query: string,
  options?: { page?: number; pageSize?: number },
) {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const pageSize = options?.pageSize ?? 24;
  const needle = query.toLowerCase();

  const rows = MOCK_PRODUCTS.filter((product) => {
    if (product.status !== "active") {
      return false;
    }

    const content = getCatalogProduct(product.slug);
    if (content) {
      return catalogProductMatchesQuery(content, needle);
    }

    const keywords = product.searchKeywords.join(" ").toLowerCase();
    return (
      product.name.toLowerCase().includes(needle) ||
      product.slug.toLowerCase().includes(needle) ||
      (product.description ?? "").toLowerCase().includes(needle) ||
      (product.seoTitle ?? "").toLowerCase().includes(needle) ||
      (product.seoDescription ?? "").toLowerCase().includes(needle) ||
      keywords.includes(needle)
    );
  }).sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length,
    page,
    pageSize,
    query,
  };
}

export function mockGetVariantsByIds(ids: string[]) {
  const wanted = new Set(ids);
  const rows = [];

  for (const product of MOCK_PRODUCTS) {
    if (product.status !== "active") {
      continue;
    }

    for (const variant of product.variants) {
      if (variant.isActive && wanted.has(variant.id)) {
        rows.push({ ...variant, product });
      }
    }
  }

  return rows;
}

export function mockGetPincode(pincode: string) {
  return pincodes.find((row) => row.pincode === pincode);
}

export function mockListPincodes() {
  return [...pincodes].sort((a, b) => a.pincode.localeCompare(b.pincode));
}

export function mockUpsertPincode(input: {
  pincode: string;
  estimatedDays?: number | null;
}) {
  const existing = pincodes.find((row) => row.pincode === input.pincode);
  if (existing) {
    existing.estimatedDays = input.estimatedDays ?? existing.estimatedDays;
    return existing;
  }

  const row = {
    pincode: input.pincode,
    codAllowed: false,
    estimatedDays: input.estimatedDays ?? null,
  };
  pincodes.push(row);
  return row;
}

export function mockDeletePincode(pincode: string) {
  const index = pincodes.findIndex((row) => row.pincode === pincode);
  if (index < 0) {
    return false;
  }
  pincodes.splice(index, 1);
  return true;
}

export function mockGetSettings() {
  return settings;
}

export function mockSaveSettings(input: {
  phones: string[];
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  mapUrl: string | null;
  announcement: string | null;
  shippingRules: { flatShippingPaise: number; label: string } | null;
}) {
  settings.phones = input.phones;
  settings.whatsapp = input.whatsapp;
  settings.address = input.address;
  settings.hours = input.hours;
  settings.mapUrl = input.mapUrl;
  settings.announcement = input.announcement;
  settings.shippingRules = input.shippingRules;
  settings.updatedAt = new Date();
  return settings;
}

export function mockListAllProducts() {
  return [...catalog].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function mockGetProductById(id: string) {
  return catalog.find((product) => product.id === id) ?? null;
}

export type MockProductWrite = {
  name: string;
  slug: string;
  description: string | null;
  howToUse: string | null;
  categoryId: string;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  searchKeywords: string[];
  images: string[];
  isFeatured: boolean;
  variants: Array<{
    id?: string;
    sku: string;
    name: string;
    pricePaise: number;
    mrpPaise: number | null;
    weightGrams: number | null;
    stockQty: number;
    isActive: boolean;
  }>;
};

export function mockSaveProduct(input: MockProductWrite, id?: string) {
  const category = MOCK_CATEGORIES.find((item) => item.id === input.categoryId);
  if (!category) {
    throw new Error("Unknown category.");
  }

  if (catalog.some((product) => product.slug === input.slug && product.id !== id)) {
    throw new Error("That slug is already used.");
  }

  const skus = input.variants.map((variant) => variant.sku.toLowerCase());
  if (new Set(skus).size !== skus.length) {
    throw new Error("Each variant needs a unique SKU.");
  }

  for (const variant of input.variants) {
    const clash = catalog.some((product) => {
      if (product.id === id) {
        return false;
      }
      return product.variants.some((item) => item.sku.toLowerCase() === variant.sku.toLowerCase());
    });
    if (clash) {
      throw new Error(`SKU ${variant.sku} is already used.`);
    }
  }

  const productId = id ?? `prod-${crypto.randomUUID()}`;
  const now = new Date();
  const existing = catalog.find((product) => product.id === productId);
  const row = {
    id: productId,
    name: input.name,
    slug: input.slug,
    description: input.description,
    howToUse: input.howToUse,
    categoryId: input.categoryId,
    status: input.status,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    searchKeywords: input.searchKeywords,
    images: input.images,
    isFeatured: input.isFeatured,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    category,
    variants: input.variants.map((variant) => ({
      id: variant.id?.trim() || `var-${crypto.randomUUID()}`,
      productId,
      sku: variant.sku,
      name: variant.name,
      pricePaise: variant.pricePaise,
      mrpPaise: variant.mrpPaise,
      weightGrams: variant.weightGrams,
      stockQty: variant.stockQty,
      isActive: variant.isActive,
    })),
  } satisfies MockProduct;

  const index = catalog.findIndex((product) => product.id === productId);
  if (index >= 0) {
    catalog[index] = row;
  } else {
    catalog.unshift(row);
  }

  return row;
}

export function mockArchiveProduct(id: string) {
  const product = catalog.find((item) => item.id === id);
  if (!product) {
    return null;
  }
  product.status = "archived";
  product.updatedAt = new Date();
  return product;
}

export function mockReserveStock(variantId: string, qty: number) {
  for (const product of MOCK_PRODUCTS) {
    const variant = product.variants.find((item) => item.id === variantId && item.isActive);

    if (!variant) {
      continue;
    }

    if (variant.stockQty < qty) {
      return false;
    }

    variant.stockQty -= qty;
    return true;
  }

  return false;
}

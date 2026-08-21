import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidateCatalog } from "@/server/admin/revalidate";
import { getDb } from "@/server/db";
import { categories, products, variants } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { parseSearchKeywords } from "@/lib/search";
import { slugify } from "@/lib/slug";
import { CATEGORIES } from "@/content/catalog";
import { HOME_RITUAL_SLUGS, HOME_RITUAL_TILES, isHomeRitualSlug } from "@/content/home-rituals";
import {
  mockArchiveProduct,
  mockGetProductById,
  mockListAllProducts,
  mockListCategories,
  mockSaveProduct,
} from "@/server/queries/mock-catalog";
import type { AdminHomeCategory, AdminProduct } from "@/types/admin";

export type { AdminHomeCategory, AdminProduct };

export class AdminError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminError";
  }
}

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("/") || value.startsWith("https://"), {
    message: "Images must be a site path or an https URL.",
  });

const variantBodySchema = z.object({
  id: z.string().trim().optional(),
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(80),
  pricePaise: z.number().int().nonnegative(),
  mrpPaise: z.number().int().nonnegative().nullable(),
  weightGrams: z.number().int().positive().nullable(),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const productBodySchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(4000).nullable().optional(),
  howToUse: z.string().trim().max(4000).nullable().optional(),
  categoryId: z.string().trim().min(1),
  status: z.enum(["draft", "active", "archived"]),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(300).nullable().optional(),
  searchKeywords: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => parseSearchKeywords(value)),
  images: z.array(imageUrlSchema).max(8),
  imageAlts: z.array(z.string().trim().min(1, "Each image needs alt text.")).max(8),
  isFeatured: z.boolean(),
  variants: z.array(variantBodySchema).min(1),
});

export type ProductBody = z.infer<typeof productBodySchema>;

function assertAlts(body: ProductBody) {
  if (body.imageAlts.length !== body.images.length) {
    throw new AdminError("Each image needs alt text.", 400);
  }
}

function mapMock(product: ReturnType<typeof mockGetProductById>): AdminProduct | null {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    howToUse: product.howToUse,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    searchKeywords: product.searchKeywords ?? [],
    images: product.images,
    isFeatured: product.isFeatured,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      pricePaise: variant.pricePaise,
      mrpPaise: variant.mrpPaise,
      weightGrams: variant.weightGrams,
      stockQty: variant.stockQty,
      isActive: variant.isActive,
    })),
  };
}

export async function listAdminCategories() {
  if (!isDatabaseConfigured()) {
    return mockListCategories().map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  try {
    const db = getDb();
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
    return rows.map((category) => ({ id: category.id, name: category.name }));
  } catch (error) {
    console.error("[admin] list categories failed", error);
    return [];
  }
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  if (!isDatabaseConfigured()) {
    return mockListAllProducts().map((product) => mapMock(product)!);
  }

  try {
    const db = getDb();
    const rows = await db.query.products.findMany({
      with: { category: true, variants: true },
      orderBy: [asc(products.name)],
    });
    return rows.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      howToUse: product.howToUse,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      searchKeywords: product.searchKeywords ?? [],
      images: product.images,
      isFeatured: product.isFeatured,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        pricePaise: variant.pricePaise,
        mrpPaise: variant.mrpPaise,
        weightGrams: variant.weightGrams,
        stockQty: variant.stockQty,
        isActive: variant.isActive,
      })),
    }));
  } catch (error) {
    console.error("[admin] list products failed", error);
    return [];
  }
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  if (!isDatabaseConfigured()) {
    return mapMock(mockGetProductById(id));
  }

  try {
    const db = getDb();
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true, variants: true },
    });
    if (!product) {
      return null;
    }
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      howToUse: product.howToUse,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      searchKeywords: product.searchKeywords ?? [],
      images: product.images,
      isFeatured: product.isFeatured,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        pricePaise: variant.pricePaise,
        mrpPaise: variant.mrpPaise,
        weightGrams: variant.weightGrams,
        stockQty: variant.stockQty,
        isActive: variant.isActive,
      })),
    };
  } catch (error) {
    console.error("[admin] get product failed", error);
    return null;
  }
}

async function saveLiveProduct(body: ProductBody, id?: string) {
  const db = getDb();
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, body.categoryId),
  });
  if (!category) {
    throw new AdminError("Unknown category.", 400);
  }

  const slugClash = await db.query.products.findFirst({
    where: id ? and(eq(products.slug, body.slug), ne(products.id, id)) : eq(products.slug, body.slug),
  });
  if (slugClash) {
    throw new AdminError("That slug is already used.", 409);
  }

  const values = {
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    howToUse: body.howToUse ?? null,
    categoryId: body.categoryId,
    status: body.status,
    seoTitle: body.seoTitle ?? null,
    seoDescription: body.seoDescription ?? null,
    searchKeywords: body.searchKeywords ?? [],
    images: body.images,
    isFeatured: body.isFeatured,
    updatedAt: new Date(),
  };

  const saved = id
    ? (
        await db.update(products).set(values).where(eq(products.id, id)).returning()
      )[0]
    : (await db.insert(products).values(values).returning())[0];

  if (!saved) {
    throw new AdminError("Could not save the product.", 500);
  }

  const keepIds: string[] = [];
  for (const variant of body.variants) {
    const variantValues = {
      productId: saved.id,
      sku: variant.sku,
      name: variant.name,
      pricePaise: variant.pricePaise,
      mrpPaise: variant.mrpPaise,
      weightGrams: variant.weightGrams,
      stockQty: variant.stockQty,
      isActive: variant.isActive,
    };

    if (variant.id) {
      await db.update(variants).set(variantValues).where(eq(variants.id, variant.id));
      keepIds.push(variant.id);
    } else {
      const [created] = await db.insert(variants).values(variantValues).returning();
      keepIds.push(created.id);
    }
  }

  const existing = await db.query.variants.findMany({
    where: eq(variants.productId, saved.id),
  });
  for (const variant of existing) {
    if (!keepIds.includes(variant.id)) {
      await db.update(variants).set({ isActive: false }).where(eq(variants.id, variant.id));
    }
  }

  return saved.id;
}

export async function saveAdminProduct(
  body: ProductBody,
  id?: string,
  options?: { revalidate?: boolean },
) {
  assertAlts(body);
  const shouldRevalidate = options?.revalidate !== false;
  const mockInput = {
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    howToUse: body.howToUse ?? null,
    categoryId: body.categoryId,
    status: body.status,
    seoTitle: body.seoTitle ?? null,
    seoDescription: body.seoDescription ?? null,
    searchKeywords: body.searchKeywords ?? [],
    images: body.images,
    isFeatured: body.isFeatured,
    variants: body.variants,
  };

  try {
    if (isDatabaseConfigured()) {
      const liveId = await saveLiveProduct(body, id);
      if (shouldRevalidate) {
        revalidateCatalog(body.slug);
      }
      return liveId;
    }

    const saved = mockSaveProduct(mockInput, id);
    if (shouldRevalidate) {
      revalidateCatalog(body.slug);
    }
    return saved.id;
  } catch (error) {
    throw new AdminError(error instanceof Error ? error.message : "Could not save product.", 400);
  }
}

export async function archiveAdminProduct(id: string) {
  const existing = await getAdminProduct(id);
  if (!existing) {
    throw new AdminError("Product not found.", 404);
  }

  mockArchiveProduct(id);

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.update(products).set({ status: "archived", updatedAt: new Date() }).where(eq(products.id, id));
    } catch {
      // Mock archive still hides it from the demo catalog.
    }
  }

  revalidateCatalog(existing.slug);
}

export async function saveAdminHomeTile(slug: string, image: string | null) {
  if (!isHomeRitualSlug(slug)) {
    throw new AdminError("That tile is not part of the home layout.", 400);
  }

  const tile = HOME_RITUAL_TILES.find((item) => item.slug === slug);
  if (!tile) {
    throw new AdminError("That tile is not part of the home layout.", 400);
  }

  if (!isDatabaseConfigured()) {
    throw new AdminError("Set DATABASE_URL before adding home tiles.", 400);
  }

  const db = getDb();
  const meta = CATEGORIES.find((category) => category.slug === slug);
  const imageValue = image?.trim() || null;
  const sortOrder = HOME_RITUAL_SLUGS.indexOf(slug);
  const values = {
    name: tile.name,
    slug: tile.slug,
    description: meta?.description ?? null,
    image: imageValue,
    isActive: true,
    sortOrder,
  };

  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (existing) {
    await db.update(categories).set(values).where(eq(categories.id, existing.id));
    revalidateCatalog();
    return existing.id;
  }

  if (!imageValue) {
    return null;
  }

  const [created] = await db.insert(categories).values(values).returning();
  if (!created) {
    throw new AdminError("Could not save the tile.", 500);
  }
  revalidateCatalog();
  return created.id;
}

export const homeTileBodySchema = z.object({
  slug: z.enum(HOME_RITUAL_SLUGS),
  image: z
    .string()
    .trim()
    .nullable()
    .refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), {
      message: "Images must be a site path or an https URL.",
    }),
});

export const categoryBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  image: z
    .string()
    .trim()
    .nullable()
    .refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), {
      message: "Images must be a site path or an https URL.",
    }),
});

export async function listAdminHomeCategories(): Promise<AdminHomeCategory[]> {
  if (!isDatabaseConfigured()) {
    return mockListCategories().map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
    }));
  }

  try {
    const db = getDb();
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
    return rows.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
    }));
  } catch (error) {
    console.error("[admin] list home categories failed", error);
    return [];
  }
}

export async function saveAdminCategory(
  body: z.infer<typeof categoryBodySchema>,
  id?: string,
) {
  const slug = slugify(body.name);
  if (!slug) {
    throw new AdminError("Enter a category name.", 400);
  }

  if (!isDatabaseConfigured()) {
    throw new AdminError("Set DATABASE_URL before adding home categories.", 400);
  }

  const db = getDb();
  const clash = await db.query.categories.findFirst({
    where: id ? and(eq(categories.slug, slug), ne(categories.id, id)) : eq(categories.slug, slug),
  });
  if (clash) {
    throw new AdminError("That category name is already used.", 409);
  }

  const image = body.image?.trim() || null;
  const values = {
    name: body.name,
    slug,
    image,
    isActive: true,
  };

  if (id) {
    const [updated] = await db
      .update(categories)
      .set(values)
      .where(eq(categories.id, id))
      .returning();
    if (!updated) {
      throw new AdminError("Category not found.", 404);
    }
    revalidateCatalog();
    return updated.id;
  }

  const existingCount = await db.select({ id: categories.id }).from(categories);
  const [created] = await db
    .insert(categories)
    .values({ ...values, sortOrder: existingCount.length })
    .returning();
  if (!created) {
    throw new AdminError("Could not save the category.", 500);
  }
  revalidateCatalog();
  return created.id;
}

export async function deleteAdminCategory(id: string) {
  if (!isDatabaseConfigured()) {
    throw new AdminError("Set DATABASE_URL before removing categories.", 400);
  }

  const db = getDb();
  const linked = await db.query.products.findFirst({
    where: eq(products.categoryId, id),
  });
  if (linked) {
    throw new AdminError("Remove or move products in this category first.", 409);
  }

  const [removed] = await db.delete(categories).where(eq(categories.id, id)).returning();
  if (!removed) {
    throw new AdminError("Category not found.", 404);
  }
  revalidateCatalog();
}



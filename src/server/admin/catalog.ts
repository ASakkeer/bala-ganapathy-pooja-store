import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidateCatalog } from "@/server/admin/revalidate";
import { getDb } from "@/server/db";
import { categories, products, variants } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import {
  mockArchiveProduct,
  mockGetProductById,
  mockListAllProducts,
  mockListCategories,
  mockSaveProduct,
} from "@/server/queries/mock-catalog";
import type { AdminProduct } from "@/types/admin";

export type { AdminProduct };

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
  } catch {
    return mockListCategories().map((category) => ({
      id: category.id,
      name: category.name,
    }));
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
  } catch {
    return mockListAllProducts().map((product) => mapMock(product)!);
  }
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const fromMock = mapMock(mockGetProductById(id));
  if (!isDatabaseConfigured()) {
    return fromMock;
  }

  try {
    const db = getDb();
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true, variants: true },
    });
    if (!product) {
      return fromMock;
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
  } catch {
    return fromMock;
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

export async function saveAdminProduct(body: ProductBody, id?: string) {
  assertAlts(body);

  try {
    const saved = mockSaveProduct(
      {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        howToUse: body.howToUse ?? null,
        categoryId: body.categoryId,
        status: body.status,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        images: body.images,
        isFeatured: body.isFeatured,
        variants: body.variants,
      },
      id,
    );

    if (isDatabaseConfigured()) {
      try {
        const liveId = await saveLiveProduct(body, id);
        revalidateCatalog(body.slug);
        return liveId;
      } catch (error) {
        if (error instanceof AdminError) {
          throw error;
        }
        revalidateCatalog(body.slug);
        return saved.id;
      }
    }

    revalidateCatalog(body.slug);
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



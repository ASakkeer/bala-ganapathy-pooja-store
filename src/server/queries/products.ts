import "server-only";

import { and, asc, desc, eq, exists, gt, ilike, inArray, or, sql } from "drizzle-orm";
import { CATALOG_PRODUCTS, catalogProductMatchesQuery, getCatalogProduct } from "@/content/catalog";
import type { CatalogSort } from "@/lib/catalog";
import { PAGE_SIZE } from "@/lib/constants";
import { parseSearchQuery, searchPattern } from "@/lib/search";
import { getDb } from "@/server/db";
import { categories, products, variants } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import {
  mockCountProducts,
  mockGetCategoryBySlug,
  mockGetProductBySlug,
  mockListCatalog,
  mockListCategories,
  mockListProducts,
  mockSearchProducts,
  mockGetVariantsByIds,
} from "@/server/queries/mock-catalog";

async function liveOrMock<T>(live: () => Promise<T>, mock: () => T): Promise<T> {
  if (!isDatabaseConfigured()) {
    return mock();
  }

  try {
    return await live();
  } catch {
    return mock();
  }
}

export async function listCategories() {
  return liveOrMock(async () => {
    const db = getDb();

    return db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
  }, mockListCategories);
}

export async function getProductBySlug(slug: string) {
  const canonical = getCatalogProduct(slug)?.slug ?? slug;

  return liveOrMock(
    async () => {
      const db = getDb();

      return db.query.products.findFirst({
        where: and(eq(products.slug, canonical), eq(products.status, "active")),
        with: {
          category: true,
          variants: {
            where: eq(variants.isActive, true),
            orderBy: [asc(variants.pricePaise)],
          },
        },
      });
    },
    () => mockGetProductBySlug(canonical),
  );
}

export async function listProducts(options?: {
  categorySlug?: string;
  categorySlugs?: string[];
  featured?: boolean;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return liveOrMock(async () => {
    const db = getDb();
    const page = options?.page && options.page > 0 ? options.page : 1;
    const pageSize = options?.pageSize ?? PAGE_SIZE;
    const offset = (page - 1) * pageSize;
    const filters = [eq(products.status, "active")];

    if (options?.featured) {
      filters.push(eq(products.isFeatured, true));
    }

    const slugs =
      options?.categorySlugs ?? (options?.categorySlug ? [options.categorySlug] : []);

    if (slugs.length > 0) {
      const matchedCategories = await db.query.categories.findMany({
        where: inArray(categories.slug, slugs),
      });

      if (matchedCategories.length === 0) {
        return [];
      }

      filters.push(
        inArray(
          products.categoryId,
          matchedCategories.map((category) => category.id),
        ),
      );
    }

    const rows = await db.query.products.findMany({
      where: and(...filters),
      with: {
        category: true,
        variants: {
          where: options?.inStockOnly
            ? and(eq(variants.isActive, true), gt(variants.stockQty, 0))
            : eq(variants.isActive, true),
          orderBy: [asc(variants.pricePaise)],
        },
      },
      orderBy: [desc(products.isFeatured), desc(products.createdAt)],
      limit: pageSize,
      offset,
    });

    if (!options?.inStockOnly) {
      return rows;
    }

    return rows.filter((product) => product.variants.length > 0);
  }, () => mockListProducts(options));
}

export async function countProducts() {
  return liveOrMock(async () => {
    const db = getDb();
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, "active"));

    return Number(row?.count ?? 0);
  }, mockCountProducts);
}

export type ListedProduct = Awaited<ReturnType<typeof listProducts>>[number];

export async function getCategoryBySlug(slug: string) {
  return liveOrMock(
    async () => {
      const db = getDb();

      return db.query.categories.findFirst({
        where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
      });
    },
    () => mockGetCategoryBySlug(slug),
  );
}

export async function listCatalog(options: {
  categorySlug?: string;
  sort?: CatalogSort;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return liveOrMock(async () => {
    const db = getDb();
    const page = options.page && options.page > 0 ? options.page : 1;
    const pageSize = options.pageSize ?? PAGE_SIZE;
    const offset = (page - 1) * pageSize;
    const sort = options.sort ?? "featured";
    const filters = [eq(products.status, "active")];

    if (options.categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, options.categorySlug),
      });

      if (!category) {
        return { items: [], total: 0, page, pageSize };
      }

      filters.push(eq(products.categoryId, category.id));
    }

    if (options.inStockOnly) {
      filters.push(
        exists(
          db
            .select({ id: variants.id })
            .from(variants)
            .where(
              and(
                eq(variants.productId, products.id),
                eq(variants.isActive, true),
                gt(variants.stockQty, 0),
              ),
            ),
        ),
      );
    }

    const whereClause = and(...filters);
    const minPrice = sql`(
      select min(${variants.pricePaise}) from ${variants}
      where ${variants.productId} = ${products.id} and ${variants.isActive} = true
    )`;

    const orderBy =
      sort === "price-asc"
        ? [asc(minPrice), desc(products.createdAt)]
        : sort === "price-desc"
          ? [desc(minPrice), desc(products.createdAt)]
          : sort === "newest"
            ? [desc(products.createdAt)]
            : [desc(products.isFeatured), desc(products.createdAt)];

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const items = await db.query.products.findMany({
      where: whereClause,
      with: {
        category: true,
        variants: {
          where: eq(variants.isActive, true),
          orderBy: [asc(variants.pricePaise)],
        },
      },
      orderBy,
      limit: pageSize,
      offset,
    });

    return {
      items,
      total: Number(countRow?.count ?? 0),
      page,
      pageSize,
    };
  }, () => mockListCatalog(options));
}

export async function searchProducts(
  rawQuery: string,
  options?: { page?: number; pageSize?: number },
) {
  const query = parseSearchQuery(rawQuery);
  const page = options?.page && options.page > 0 ? options.page : 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  if (!query) {
    return { items: [], total: 0, page, pageSize, query };
  }

  return liveOrMock(
    async () => {
      const db = getDb();
      const offset = (page - 1) * pageSize;
      const pattern = searchPattern(query);
      const aliasSlugs = CATALOG_PRODUCTS.filter((item) =>
        catalogProductMatchesQuery(item, query),
      ).map((item) => item.slug);
      const matchers = [
        ilike(products.name, pattern),
        ilike(products.slug, pattern),
        ilike(products.description, pattern),
        ...(aliasSlugs.length > 0 ? [inArray(products.slug, aliasSlugs)] : []),
      ];
      const whereClause = and(eq(products.status, "active"), or(...matchers));

      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      const items = await db.query.products.findMany({
        where: whereClause,
        with: {
          category: true,
          variants: {
            where: eq(variants.isActive, true),
            orderBy: [asc(variants.pricePaise)],
          },
        },
        orderBy: [desc(products.isFeatured), desc(products.createdAt)],
        limit: pageSize,
        offset,
      });

      return {
        items,
        total: Number(countRow?.count ?? 0),
        page,
        pageSize,
        query,
      };
    },
    () => mockSearchProducts(query, { page, pageSize }),
  );
}

export async function getVariantsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return [];
  }

  return liveOrMock(
    async () => {
      const db = getDb();
      const uuidIds = uniqueIds.filter((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
      );

      if (uuidIds.length === 0) {
        return [];
      }

      return db.query.variants.findMany({
        where: and(inArray(variants.id, uuidIds), eq(variants.isActive, true)),
        with: {
          product: true,
        },
      });
    },
    () => mockGetVariantsByIds(uniqueIds),
  );
}

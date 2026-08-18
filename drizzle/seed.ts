import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { CATEGORIES, CATALOG_PRODUCTS } from "../src/content/catalog";
import { SHOP_ADDRESS, SHOP_MAPS_SHARE_URL, SHOP_PHONES } from "../src/lib/maps";
import {
  categories,
  products,
  serviceablePincodes,
  storeSettings,
  variants,
} from "../src/server/db/schema";

loadEnvConfig(process.cwd());

const SETTINGS_ID = "00000000-0000-4000-8000-000000000001";

async function seed() {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is required to seed. Start Postgres (see README) and set DATABASE_URL in .env.local.",
    );
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, {
    schema: { categories, products, variants, storeSettings, serviceablePincodes },
  });

  try {
    for (const [index, category] of CATEGORIES.entries()) {
      await db
        .insert(categories)
        .values({
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: index,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: category.name,
            description: category.description,
            sortOrder: index,
            isActive: true,
          },
        });
    }

    const categoryRows = await db.select().from(categories);
    const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]));

    for (const product of CATALOG_PRODUCTS) {
      const categoryId = categoryIdBySlug.get(product.categorySlug);

      if (!categoryId) {
        throw new Error(`Missing category ${product.categorySlug} while seeding.`);
      }

      await db
        .insert(products)
        .values({
          name: product.name,
          slug: product.slug,
          description: product.shortDescription,
          howToUse: product.howToUse,
          categoryId,
          status: "active",
          seoTitle: `${product.name} / ${product.nameTa}`,
          seoDescription: product.shortDescription,
          images: product.images,
          isFeatured: product.isFeatured,
        })
        .onConflictDoUpdate({
          target: products.slug,
          set: {
            name: product.name,
            description: product.shortDescription,
            howToUse: product.howToUse,
            categoryId,
            status: "active",
            seoTitle: `${product.name} / ${product.nameTa}`,
            seoDescription: product.shortDescription,
            images: product.images,
            isFeatured: product.isFeatured,
          },
        });

      const [saved] = await db
        .select()
        .from(products)
        .where(eq(products.slug, product.slug))
        .limit(1);

      if (!saved) {
        throw new Error(`Failed to save product ${product.slug}.`);
      }

      for (const variant of product.variants) {
        await db
          .insert(variants)
          .values({
            productId: saved.id,
            sku: variant.sku,
            name: variant.name,
            pricePaise: variant.pricePaise,
            mrpPaise: variant.mrpPaise,
            weightGrams: variant.weightGrams,
            stockQty: variant.stockQty,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: variants.sku,
            set: {
              productId: saved.id,
              name: variant.name,
              pricePaise: variant.pricePaise,
              mrpPaise: variant.mrpPaise,
              weightGrams: variant.weightGrams,
              stockQty: variant.stockQty,
              isActive: true,
            },
          });
      }
    }

    await db
      .insert(storeSettings)
      .values({
        id: SETTINGS_ID,
        phones: [...SHOP_PHONES],
        whatsapp: null,
        address: SHOP_ADDRESS,
        hours: null,
        mapUrl: SHOP_MAPS_SHARE_URL,
        shippingRules: {
          flatShippingPaise: 5000,
          label: "Shipping ₹50 — confirmed at checkout",
        },
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          phones: [...SHOP_PHONES],
          address: SHOP_ADDRESS,
          mapUrl: SHOP_MAPS_SHARE_URL,
        },
      });

    await db
      .insert(serviceablePincodes)
      .values([
        { pincode: "641001", codAllowed: false, estimatedDays: 2 },
        { pincode: "110001", codAllowed: false, estimatedDays: 5 },
        { pincode: "400001", codAllowed: false, estimatedDays: 4 },
        { pincode: "560001", codAllowed: false, estimatedDays: 4 },
      ])
      .onConflictDoUpdate({
        target: serviceablePincodes.pincode,
        set: { codAllowed: false },
      });

    console.log("Seed complete. Sample catalog — replace in admin with real stock.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

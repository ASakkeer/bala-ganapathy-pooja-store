import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SHOP_ADDRESS, SHOP_MAPS_SHARE_URL, SHOP_PHONES } from "../src/lib/maps";
import { serviceablePincodes, storeSettings } from "../src/server/db/schema";

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
    schema: { storeSettings, serviceablePincodes },
  });

  try {
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

    console.log("Seed complete. Store settings only — add categories and products in admin.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

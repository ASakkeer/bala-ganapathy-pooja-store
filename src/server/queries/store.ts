import "server-only";

import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache";
import { cachedQuery } from "@/server/cache";
import { getDb } from "@/server/db";
import { storeSettings } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { mockGetSettings } from "@/server/queries/mock-catalog";

async function fetchStoreSettings() {
  if (!isDatabaseConfigured()) {
    return mockGetSettings();
  }

  try {
    const db = getDb();
    const [row] = await db.select().from(storeSettings).limit(1);
    return row ?? mockGetSettings();
  } catch {
    return mockGetSettings();
  }
}

export const getStoreSettings = cachedQuery(
  () => ["store:settings"],
  fetchStoreSettings,
  {
    revalidate: CACHE_TTL.store,
    tags: [CACHE_TAGS.store],
  },
);

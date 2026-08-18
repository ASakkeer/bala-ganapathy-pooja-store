import "server-only";

import { cache } from "react";
import { getDb } from "@/server/db";
import { storeSettings } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { mockGetSettings } from "@/server/queries/mock-catalog";

export const getStoreSettings = cache(async () => {
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
});

import "server-only";

import { eq } from "drizzle-orm";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache";
import { isIndianPincode } from "@/lib/pincode";
import { cachedQuery } from "@/server/cache";
import { getDb } from "@/server/db";
import { serviceablePincodes } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { mockGetPincode } from "@/server/queries/mock-catalog";

export type ServiceablePincode = {
  pincode: string;
  codAllowed: boolean;
  estimatedDays: number | null;
};

async function fetchServiceablePincode(pincode: string): Promise<ServiceablePincode | null> {
  if (!isIndianPincode(pincode)) {
    return null;
  }

  if (!isDatabaseConfigured()) {
    return mockGetPincode(pincode) ?? null;
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(serviceablePincodes)
      .where(eq(serviceablePincodes.pincode, pincode))
      .limit(1);

    return row ?? null;
  } catch {
    return mockGetPincode(pincode) ?? null;
  }
}

export const getServiceablePincode = cachedQuery(
  (pincode: string) => ["pincode", pincode],
  fetchServiceablePincode,
  {
    revalidate: CACHE_TTL.pincodes,
    tags: [CACHE_TAGS.pincodes],
  },
);

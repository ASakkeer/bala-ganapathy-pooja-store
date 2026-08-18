import "server-only";

import { eq } from "drizzle-orm";
import { isIndianPincode } from "@/lib/pincode";
import { getDb } from "@/server/db";
import { serviceablePincodes } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { mockGetPincode } from "@/server/queries/mock-catalog";

export type ServiceablePincode = {
  pincode: string;
  codAllowed: boolean;
  estimatedDays: number | null;
};

export async function getServiceablePincode(pincode: string): Promise<ServiceablePincode | null> {
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

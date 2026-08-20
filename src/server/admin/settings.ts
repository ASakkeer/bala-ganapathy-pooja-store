import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { AdminError } from "@/server/admin/catalog";
import { revalidatePincodes, revalidateStore } from "@/server/admin/revalidate";
import { getDb } from "@/server/db";
import { serviceablePincodes, storeSettings } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import {
  mockDeletePincode,
  mockGetSettings,
  mockListPincodes,
  mockSaveSettings,
  mockUpsertPincode,
} from "@/server/queries/mock-catalog";
import { getStoreSettings } from "@/server/queries/store";

export const settingsBodySchema = z.object({
  phones: z.array(z.string().trim()).max(5),
  whatsapp: z.string().trim().max(20).nullable(),
  address: z.string().trim().max(400).nullable(),
  hours: z.string().trim().max(200).nullable(),
  mapUrl: z.string().trim().max(2000).nullable(),
  announcement: z.string().trim().max(200).nullable(),
  shippingLabel: z.string().trim().min(1).max(120),
  flatShippingPaise: z.number().int().nonnegative(),
});

export const pincodeBodySchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  estimatedDays: z.number().int().positive().max(30).nullable().optional(),
});

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export async function getAdminSettings() {
  const current = await getStoreSettings();
  return {
    phones: current?.phones ?? [],
    whatsapp: current?.whatsapp ?? null,
    address: current?.address ?? null,
    hours: current?.hours ?? null,
    mapUrl: current?.mapUrl ?? null,
    announcement: current?.announcement ?? null,
    shippingRules: current?.shippingRules ?? mockGetSettings().shippingRules,
  };
}

export async function saveAdminSettings(body: z.infer<typeof settingsBodySchema>) {
  const phones = body.phones.map((phone) => phone.replace(/\D/g, "")).filter((phone) => phone.length >= 10);
  const next = {
    phones,
    whatsapp: emptyToNull(body.whatsapp),
    address: emptyToNull(body.address),
    hours: emptyToNull(body.hours),
    mapUrl: emptyToNull(body.mapUrl),
    announcement: emptyToNull(body.announcement),
    shippingRules: {
      flatShippingPaise: body.flatShippingPaise,
      label: body.shippingLabel,
    },
  };

  mockSaveSettings(next);

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const [existing] = await db.select().from(storeSettings).limit(1);
      if (existing) {
        await db
          .update(storeSettings)
          .set({ ...next, updatedAt: new Date() })
          .where(eq(storeSettings.id, existing.id));
      } else {
        await db.insert(storeSettings).values(next);
      }
    } catch {
      // Mock settings still apply for this process.
    }
  }

  revalidateStore();
  return next;
}

export async function listAdminPincodes() {
  if (!isDatabaseConfigured()) {
    return mockListPincodes();
  }

  try {
    const db = getDb();
    return db.select().from(serviceablePincodes);
  } catch {
    return mockListPincodes();
  }
}

export async function addAdminPincode(body: z.infer<typeof pincodeBodySchema>) {
  mockUpsertPincode({
    pincode: body.pincode,
    estimatedDays: body.estimatedDays ?? null,
  });

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db
        .insert(serviceablePincodes)
        .values({
          pincode: body.pincode,
          codAllowed: false,
          estimatedDays: body.estimatedDays ?? null,
        })
        .onConflictDoUpdate({
          target: serviceablePincodes.pincode,
          set: { estimatedDays: body.estimatedDays ?? null },
        });
    } catch {
      // Mock pincode list still updated.
    }
  }

  revalidatePincodes();
}

export async function removeAdminPincode(pincode: string) {
  if (!/^\d{6}$/.test(pincode)) {
    throw new AdminError("Enter a 6-digit pincode.", 400);
  }

  mockDeletePincode(pincode);

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.delete(serviceablePincodes).where(eq(serviceablePincodes.pincode, pincode));
    } catch {
      // Mock pincode removed.
    }
  }

  revalidatePincodes();
}

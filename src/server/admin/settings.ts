import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { AdminError } from "@/server/admin/catalog";
import { revalidatePincodes, revalidateStore } from "@/server/admin/revalidate";
import { resolveHomeContent, type HomeContent } from "@/content/home-content";
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
    heroImage: current?.heroImage ?? null,
    homeContent: resolveHomeContent(current?.homeContent ?? null),
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

export async function saveAdminHeroImage(heroImage: string | null) {
  const next = emptyToNull(heroImage);

  if (!isDatabaseConfigured()) {
    const current = mockGetSettings();
    current.heroImage = next;
    revalidateStore();
    return next;
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(storeSettings).limit(1);
    if (existing) {
      await db
        .update(storeSettings)
        .set({ heroImage: next, updatedAt: new Date() })
        .where(eq(storeSettings.id, existing.id));
    } else {
      await db.insert(storeSettings).values({ heroImage: next });
    }
  } catch (error) {
    console.error("[admin] save hero image failed", error);
    throw new AdminError("Could not save the home banner.", 500);
  }

  revalidateStore();
  return next;
}

const tileCopySchema = z.object({
  title: z.string().max(80),
  subtitle: z.string().max(160),
});

export const homeContentBodySchema = z.object({
  heroEyebrow: z.string().max(80),
  heroTitle: z.string().max(120),
  heroSubtitle: z.string().max(240),
  heroCta: z.string().max(80),
  ritualEyebrow: z.string().max(80),
  ritualTitle: z.string().max(120),
  ritualCta: z.string().max(80),
  ritualTiles: z.object({
    "ganapathy-homam": tileCopySchema,
    "navagraha-homam": tileCopySchema,
    kumbabishekam: tileCopySchema,
    "pooja-essentials": tileCopySchema,
    "naattu-marundhu": tileCopySchema,
  }),
  popularEyebrow: z.string().max(80),
  popularTitle: z.string().max(120),
  popularBody: z.string().max(400),
  popularCta: z.string().max(80),
  trust: z
    .array(
      z.object({
        title: z.string().max(80),
        body: z.string().max(280),
      }),
    )
    .length(3),
});

export async function saveAdminHomeContent(body: z.infer<typeof homeContentBodySchema>) {
  const next: HomeContent = {
    heroEyebrow: body.heroEyebrow.trim(),
    heroTitle: body.heroTitle.trim(),
    heroSubtitle: body.heroSubtitle.trim(),
    heroCta: body.heroCta.trim(),
    ritualEyebrow: body.ritualEyebrow.trim(),
    ritualTitle: body.ritualTitle.trim(),
    ritualCta: body.ritualCta.trim(),
    ritualTiles: {
      "ganapathy-homam": {
        title: body.ritualTiles["ganapathy-homam"].title.trim(),
        subtitle: body.ritualTiles["ganapathy-homam"].subtitle.trim(),
      },
      "navagraha-homam": {
        title: body.ritualTiles["navagraha-homam"].title.trim(),
        subtitle: body.ritualTiles["navagraha-homam"].subtitle.trim(),
      },
      kumbabishekam: {
        title: body.ritualTiles.kumbabishekam.title.trim(),
        subtitle: body.ritualTiles.kumbabishekam.subtitle.trim(),
      },
      "pooja-essentials": {
        title: body.ritualTiles["pooja-essentials"].title.trim(),
        subtitle: body.ritualTiles["pooja-essentials"].subtitle.trim(),
      },
      "naattu-marundhu": {
        title: body.ritualTiles["naattu-marundhu"].title.trim(),
        subtitle: body.ritualTiles["naattu-marundhu"].subtitle.trim(),
      },
    },
    popularEyebrow: body.popularEyebrow.trim(),
    popularTitle: body.popularTitle.trim(),
    popularBody: body.popularBody.trim(),
    popularCta: body.popularCta.trim(),
    trust: [
      { title: body.trust[0]?.title.trim() ?? "", body: body.trust[0]?.body.trim() ?? "" },
      { title: body.trust[1]?.title.trim() ?? "", body: body.trust[1]?.body.trim() ?? "" },
      { title: body.trust[2]?.title.trim() ?? "", body: body.trust[2]?.body.trim() ?? "" },
    ],
  };

  if (!isDatabaseConfigured()) {
    mockGetSettings().homeContent = next;
    revalidateStore();
    return next;
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(storeSettings).limit(1);
    if (existing) {
      await db
        .update(storeSettings)
        .set({ homeContent: next, updatedAt: new Date() })
        .where(eq(storeSettings.id, existing.id));
    } else {
      await db.insert(storeSettings).values({ homeContent: next });
    }
  } catch (error) {
    console.error("[admin] save home content failed", error);
    throw new AdminError("Could not save the home page text.", 500);
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
  } catch (error) {
    console.error("[admin] list pincodes failed", error);
    return [];
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

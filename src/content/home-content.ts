import { copy } from "@/content/copy";
import { HOME_RITUAL_SLUGS, type HomeRitualSlug } from "@/content/home-rituals";

export type HomeRitualTileCopy = {
  title: string;
  subtitle: string;
};

export type HomeTrustCopy = {
  title: string;
  body: string;
};

export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  ritualEyebrow: string;
  ritualTitle: string;
  ritualCta: string;
  ritualTiles: Record<HomeRitualSlug, HomeRitualTileCopy>;
  popularEyebrow: string;
  popularTitle: string;
  popularBody: string;
  popularCta: string;
  trust: [HomeTrustCopy, HomeTrustCopy, HomeTrustCopy];
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow: copy.storeLocationLine,
  heroTitle: copy.storeTagline,
  heroSubtitle: copy.storeTamilLine.replaceAll(" · ", " • "),
  heroCta: copy.shopNow,
  ritualEyebrow: copy.shopByRitualEyebrow,
  ritualTitle: copy.shopByRitual,
  ritualCta: copy.exploreCategories,
  ritualTiles: {
    "ganapathy-homam": {
      title: "Ganapathy Homam",
      subtitle: "கணபதி ஹோமம் • Everything you need for an auspicious beginning",
    },
    "navagraha-homam": {
      title: "Navagraha Homam",
      subtitle: "நவக்கிரக ஹோமம்",
    },
    kumbabishekam: {
      title: "Kumbabishekam",
      subtitle: "கும்பாபிஷேகம்",
    },
    "pooja-essentials": {
      title: "Daily Pooja",
      subtitle: "பூஜை சாமான்கள்",
    },
    "naattu-marundhu": {
      title: "Naattu Marundhu",
      subtitle: "நாட்டு மருந்துகள்",
    },
  },
  popularEyebrow: copy.popularPoojaEyebrow,
  popularTitle: copy.popularPooja,
  popularBody: copy.popularPoojaBody,
  popularCta: copy.popularPoojaCta,
  trust: [
    {
      title: "Authentic Quality",
      body: "Sourced directly from traditional makers, ensuring the highest purity for your rituals.",
    },
    {
      title: "Fast & Secure Delivery",
      body: "Carefully packed to preserve sanctity, delivered reliably to your doorstep.",
    },
    {
      title: "Rooted in Tradition",
      body: "Decades of heritage serving devotees in R.S. Puram, now available online.",
    },
  ],
};

function pick(value: string | undefined, fallback: string) {
  return value === undefined ? fallback : value;
}

export function resolveHomeContent(stored?: Partial<HomeContent> | null): HomeContent {
  const ritualTiles = { ...DEFAULT_HOME_CONTENT.ritualTiles };
  for (const slug of HOME_RITUAL_SLUGS) {
    ritualTiles[slug] = {
      title: pick(stored?.ritualTiles?.[slug]?.title, ritualTiles[slug].title),
      subtitle: pick(stored?.ritualTiles?.[slug]?.subtitle, ritualTiles[slug].subtitle),
    };
  }

  const trust = DEFAULT_HOME_CONTENT.trust.map((item, index) => ({
    title: pick(stored?.trust?.[index]?.title, item.title),
    body: pick(stored?.trust?.[index]?.body, item.body),
  })) as HomeContent["trust"];

  return {
    heroEyebrow: pick(stored?.heroEyebrow, DEFAULT_HOME_CONTENT.heroEyebrow),
    heroTitle: pick(stored?.heroTitle, DEFAULT_HOME_CONTENT.heroTitle),
    heroSubtitle: pick(stored?.heroSubtitle, DEFAULT_HOME_CONTENT.heroSubtitle),
    heroCta: pick(stored?.heroCta, DEFAULT_HOME_CONTENT.heroCta),
    ritualEyebrow: pick(stored?.ritualEyebrow, DEFAULT_HOME_CONTENT.ritualEyebrow),
    ritualTitle: pick(stored?.ritualTitle, DEFAULT_HOME_CONTENT.ritualTitle),
    ritualCta: pick(stored?.ritualCta, DEFAULT_HOME_CONTENT.ritualCta),
    ritualTiles,
    popularEyebrow: pick(stored?.popularEyebrow, DEFAULT_HOME_CONTENT.popularEyebrow),
    popularTitle: pick(stored?.popularTitle, DEFAULT_HOME_CONTENT.popularTitle),
    popularBody: pick(stored?.popularBody, DEFAULT_HOME_CONTENT.popularBody),
    popularCta: pick(stored?.popularCta, DEFAULT_HOME_CONTENT.popularCta),
    trust,
  };
}

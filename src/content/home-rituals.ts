export const HOME_RITUAL_TILES = [
  { slug: "ganapathy-homam", name: "Ganapathy Homam", featured: true },
  { slug: "navagraha-homam", name: "Navagraha Homam", featured: false },
  { slug: "kumbabishekam", name: "Kumbabishekam", featured: false },
  { slug: "pooja-essentials", name: "Pooja Essentials", featured: false },
  { slug: "naattu-marundhu", name: "Naattu Marundhu", featured: false },
] as const;

export const HOME_RITUAL_SLUGS = [
  "ganapathy-homam",
  "navagraha-homam",
  "kumbabishekam",
  "pooja-essentials",
  "naattu-marundhu",
] as const;

export type HomeRitualSlug = (typeof HOME_RITUAL_SLUGS)[number];

export const HOME_RITUAL_FEATURED_SLUG: HomeRitualSlug = "ganapathy-homam";

export function isHomeRitualSlug(value: string): value is HomeRitualSlug {
  return (HOME_RITUAL_SLUGS as readonly string[]).includes(value);
}

/**
 * Sample catalog for development.
 * Replace names, prices, pack sizes, and photos with real shop inventory in admin.
 *
 * IMAGES ARE TEMPORARY Unsplash stand-ins (not this shop’s photography).
 * Swap the `photos` map for files under /public/catalog when shop photos exist.
 */

export const photos = {
  spices: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1400&q=80",
  herbs: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1400&q=80",
  amber: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1400&q=80",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1400&q=80",
  brass: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1400&q=80",
  lamp: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1400&q=80",
  flowers: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
  forest: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
  linen: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80",
  kitchen: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80",
  temple: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80",
  warm: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1400&q=80",
  metal: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
} as const;

export const SAMPLE_CATALOG_NOTE =
  "Sample listing for the online catalog. Pack, price, and photo will match the counter when this SKU is replaced in admin.";

export const HERBAL_DISCLAIMER =
  "Traditional herbal product (naattu marundhu). This is not a medicine and is not intended to diagnose, treat, cure, or prevent any disease. Follow the pack. Ask the shop if you are unsure.";

export const KIT_NOTE =
  "Typical materials sold together for this use. This is not a priest’s required list. Final contents are packed at the shop — ask if you need a specific item included or left out.";

export const CATEGORIES = [
  {
    name: "Pooja Essentials",
    nameTa: "பூஜை சாமான்கள்",
    shortName: "Pooja",
    slug: "pooja-essentials",
    blurb: "Kumkum, camphor, wicks, oil, and daily samagri.",
    description:
      "Everyday pooja samagri for the home: kumkum, turmeric, camphor, incense, wicks, oil, and starter kits.",
  },
  {
    name: "Ganapathy Homam",
    nameTa: "கணபதி ஹோமம்",
    shortName: "Ganapathy Homam",
    slug: "ganapathy-homam",
    blurb: "Homam samagri and kits sold for Ganapathy Homam.",
    description:
      "Materials commonly sold for Ganapathy Homam: samagri, samidha, and a shop-packed kit. Confirm contents at the counter.",
  },
  {
    name: "Navagraha Homam",
    nameTa: "நவக்கிரக ஹோமம்",
    shortName: "Navagraha",
    slug: "navagraha-homam",
    blurb: "Navadhanya, samagri, and Navagraha pooja kits.",
    description:
      "Materials commonly sold for Navagraha Homam and Navagraha pooja, including navadhanya and a shop-packed kit.",
  },
  {
    name: "Kumbabishekam",
    nameTa: "கும்பாபிஷேகம்",
    shortName: "Kumbabishekam",
    slug: "kumbabishekam",
    blurb: "Temple and kumbabishekam requirements from the shop.",
    description:
      "Kalasam and bulk pooja materials often bought for kumbabishekam and temple work. Ask the shop for the quantity you need.",
  },
  {
    name: "Naattu Marundhu",
    nameTa: "நாட்டு மருந்துகள்",
    shortName: "Naattu Marundhu",
    slug: "naattu-marundhu",
    blurb: "Traditional Tamil herbal preparations from the shop.",
    description: `Dried herbs and traditional preparations sold at the counter. ${HERBAL_DISCLAIMER}`,
  },
  {
    name: "Spiritual Essentials",
    nameTa: "ஆன்மீகப் பொருட்கள்",
    shortName: "Spiritual essentials",
    slug: "spiritual-essentials",
    blurb: "Lamps, bells, plates, and small idols.",
    description: "Brass lamps, bells, pooja plates, and small idols for the home shrine.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATALOG_REDIRECTS = [
  { source: "/c/daily-pooja", destination: "/c/pooja-essentials" },
  { source: "/c/incense-camphor", destination: "/c/pooja-essentials" },
  { source: "/c/kumkum-turmeric", destination: "/c/pooja-essentials" },
  { source: "/c/oils-ghee", destination: "/c/pooja-essentials" },
  { source: "/c/pooja-kits", destination: "/c/pooja-essentials" },
  { source: "/c/lamps-diyas", destination: "/c/spiritual-essentials" },
  { source: "/c/idols", destination: "/c/spiritual-essentials" },
  { source: "/c/malas-accessories", destination: "/c/spiritual-essentials" },
  { source: "/c/books", destination: "/shop" },
  { source: "/c/festivals", destination: "/c/kumbabishekam" },
  { source: "/p/demo-camphor-50g", destination: "/p/karpooram-camphor" },
  { source: "/p/demo-agarbatti-pack", destination: "/p/agarbatti" },
  { source: "/p/demo-brass-diya", destination: "/p/brass-diya-vilakku" },
  { source: "/p/demo-kumkum-50g", destination: "/p/kungumam-kumkum" },
  { source: "/p/demo-daily-pooja-kit", destination: "/p/pooja-starter-kit" },
  { source: "/p/demo-ganesha-idol", destination: "/p/ganapathy-idol" },
  { source: "/p/demo-cotton-wicks", destination: "/p/cotton-wicks-thiri" },
] as const;

type VariantDef = {
  id: string;
  sku: string;
  name: string;
  pricePaise: number;
  mrpPaise: number | null;
  weightGrams: number | null;
  stockQty: number;
};

export type CatalogProductDef = {
  id: string;
  name: string;
  nameTa: string;
  slug: string;
  slugAliases?: string[];
  categorySlug: CategorySlug;
  shortDescription: string;
  description: string;
  howToUse: string;
  images: string[];
  isFeatured: boolean;
  tags: string[];
  aliases: string[];
  relatedSlugs: string[];
  rating: number | null;
  reviewCount: number;
  variants: VariantDef[];
};

function product(def: CatalogProductDef): CatalogProductDef {
  return {
    ...def,
    rating: null,
    reviewCount: 0,
  };
}

export const CATALOG_PRODUCTS: CatalogProductDef[] = [
  product({
    id: "prod-camphor",
    name: "Camphor",
    nameTa: "கற்பூரம்",
    slug: "karpooram-camphor",
    slugAliases: ["demo-camphor-50g"],
    categorySlug: "pooja-essentials",
    shortDescription: "Camphor tablets (karpooram) for aarti and the camphor burner.",
    description: `${SAMPLE_CATALOG_NOTE} Camphor / கற்பூரம் used during home pooja. Sold by pack weight.`,
    howToUse: "Place a small piece in a camphor burner and light. Use in a ventilated room. Keep away from children.",
    images: [photos.amber, photos.warm],
    isFeatured: true,
    tags: ["camphor", "karpooram", "aarti"],
    aliases: ["camphor", "karpooram", "karpooram", "கற்பூரம்", "karpuuram", "kapoor"],
    relatedSlugs: ["sambrani", "agarbatti", "pooja-starter-kit"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-camphor-50", sku: "BG-CAMPHOR-50", name: "50g", pricePaise: 8900, mrpPaise: 9900, weightGrams: 50, stockQty: 40 },
      { id: "var-camphor-100", sku: "BG-CAMPHOR-100", name: "100g", pricePaise: 15900, mrpPaise: 17900, weightGrams: 100, stockQty: 20 },
    ],
  }),
  product({
    id: "prod-kumkum",
    name: "Kumkum",
    nameTa: "குங்குமம்",
    slug: "kungumam-kumkum",
    slugAliases: ["demo-kumkum-50g"],
    categorySlug: "pooja-essentials",
    shortDescription: "Kumkum (kungumam) for tilak and pooja decoration.",
    description: `${SAMPLE_CATALOG_NOTE} Kumkum / குங்குமம் sold in a closed pack.`,
    howToUse: "Use a pinch for tilak or decoration. Close the pack tightly after use.",
    images: [photos.spices],
    isFeatured: true,
    tags: ["kumkum", "kungumam"],
    aliases: ["kumkum", "kumkuma", "kungumam", "குங்குமம்", "sindoor"],
    relatedSlugs: ["manjal-turmeric", "sandal-powder", "pooja-starter-kit"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-kumkum-50", sku: "BG-KUMKUM-50", name: "50g", pricePaise: 3900, mrpPaise: 4500, weightGrams: 50, stockQty: 35 },
    ],
  }),
  product({
    id: "prod-turmeric",
    name: "Turmeric",
    nameTa: "மஞ்சள்",
    slug: "manjal-turmeric",
    categorySlug: "pooja-essentials",
    shortDescription: "Turmeric powder (manjal) used in pooja and traditional kitchens.",
    description: `${SAMPLE_CATALOG_NOTE} Turmeric / மஞ்சள். Traditional kitchen and pooja use — not a medical product.`,
    howToUse: "Use as you would any packed turmeric. Keep dry.",
    images: [photos.spices, photos.herbs],
    isFeatured: true,
    tags: ["turmeric", "manjal"],
    aliases: ["turmeric", "manjal", "manjal podi", "மஞ்சள்", "haldi"],
    relatedSlugs: ["kungumam-kumkum", "kasturi-manjal"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-turmeric-100", sku: "BG-MANJAL-100", name: "100g", pricePaise: 4500, mrpPaise: 5500, weightGrams: 100, stockQty: 40 },
    ],
  }),
  product({
    id: "prod-agarbatti",
    name: "Agarbatti",
    nameTa: "ஊதுபத்தி",
    slug: "agarbatti",
    slugAliases: ["demo-agarbatti-pack"],
    categorySlug: "pooja-essentials",
    shortDescription: "Incense sticks (agarbatti / oodupathi) for daily pooja.",
    description: `${SAMPLE_CATALOG_NOTE} Agarbatti / ஊதுபத்தி.`,
    howToUse: "Light the coated tip, blow out the flame, and rest the stick in a holder.",
    images: [photos.forest, photos.flowers],
    isFeatured: true,
    tags: ["incense", "agarbatti"],
    aliases: ["agarbatti", "agarbathi", "incense", "oodupathi", "ஊதுபத்தி", "oodhu pathi"],
    relatedSlugs: ["sambrani", "karpooram-camphor"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-agarbatti-20", sku: "BG-AGARBATTI-20", name: "20 sticks", pricePaise: 4900, mrpPaise: 5900, weightGrams: null, stockQty: 60 },
    ],
  }),
  product({
    id: "prod-sambrani",
    name: "Sambrani",
    nameTa: "சாம்பிராணி",
    slug: "sambrani",
    categorySlug: "pooja-essentials",
    shortDescription: "Traditional aromatic resin used during pooja.",
    description: `${SAMPLE_CATALOG_NOTE} Sambrani / சாம்பிராணி — aromatic resin burned over coal or a sambrani cup.`,
    howToUse: "Use a sambrani cup or a little over glowing coal. Do not leave burning resin unattended.",
    images: [photos.warm],
    isFeatured: true,
    tags: ["sambrani", "dhoop"],
    aliases: ["sambrani", "sambirani", "சாம்பிராணி", "dhoop", "benzoin"],
    relatedSlugs: ["karpooram-camphor", "agarbatti"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-sambrani-50", sku: "BG-SAMBRANI-50", name: "50g", pricePaise: 5500, mrpPaise: 6500, weightGrams: 50, stockQty: 28 },
    ],
  }),
  product({
    id: "prod-wicks",
    name: "Cotton wicks",
    nameTa: "திரி",
    slug: "cotton-wicks-thiri",
    slugAliases: ["demo-cotton-wicks"],
    categorySlug: "pooja-essentials",
    shortDescription: "Cotton wicks (thiri) for oil lamps.",
    description: `${SAMPLE_CATALOG_NOTE} Cotton wicks / திரி for vilakku.`,
    howToUse: "Place in a diya with oil or ghee, then light.",
    images: [photos.linen, photos.lamp],
    isFeatured: true,
    tags: ["wicks", "thiri"],
    aliases: ["wicks", "thiri", "thiri vatthi", "திரி", "cotton wick", "vilakku thiri"],
    relatedSlugs: ["pooja-lamp-oil", "brass-diya-vilakku"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-wicks-100", sku: "BG-THIRI-100", name: "100 pcs", pricePaise: 3500, mrpPaise: 4000, weightGrams: 40, stockQty: 80 },
    ],
  }),
  product({
    id: "prod-oil",
    name: "Pooja lamp oil",
    nameTa: "விளக்கு எண்ணெய்",
    slug: "pooja-lamp-oil",
    categorySlug: "pooja-essentials",
    shortDescription: "Oil used in traditional oil lamps (vilakku).",
    description: `${SAMPLE_CATALOG_NOTE} Vilakku ennai / விளக்கு எண்ணெய். Confirm the oil type at the counter when this sample SKU is replaced.`,
    howToUse: "Pour into a stable diya with a cotton wick. Keep away from children and cloth.",
    images: [photos.oil],
    isFeatured: false,
    tags: ["oil", "vilakku"],
    aliases: ["pooja oil", "vilakku ennai", "விளக்கு எண்ணெய்", "lamp oil", "gingelly oil"],
    relatedSlugs: ["cotton-wicks-thiri", "brass-diya-vilakku"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-oil-200", sku: "BG-OIL-200", name: "200ml", pricePaise: 12900, mrpPaise: 14900, weightGrams: 200, stockQty: 18 },
    ],
  }),
  product({
    id: "prod-sandal",
    name: "Sandal powder",
    nameTa: "சந்தனம்",
    slug: "sandal-powder",
    categorySlug: "pooja-essentials",
    shortDescription: "Sandal paste powder (chandanam) for tilak and decoration.",
    description: `${SAMPLE_CATALOG_NOTE} Sandal powder / சந்தனம்.`,
    howToUse: "Mix a little with water to make a paste. Follow the pack.",
    images: [photos.herbs],
    isFeatured: false,
    tags: ["sandal", "chandan"],
    aliases: ["sandal", "sandalwood", "chandan", "chandanam", "சந்தனம்", "santhanam"],
    relatedSlugs: ["kungumam-kumkum", "manjal-turmeric"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-sandal-50", sku: "BG-SANDAL-50", name: "50g", pricePaise: 8500, mrpPaise: 9900, weightGrams: 50, stockQty: 22 },
    ],
  }),
  product({
    id: "prod-pooja-kit",
    name: "Pooja starter kit",
    nameTa: "பூஜை கிட்",
    slug: "pooja-starter-kit",
    slugAliases: ["demo-daily-pooja-kit"],
    categorySlug: "pooja-essentials",
    shortDescription: "A shop-packed set of everyday pooja essentials.",
    description: `${SAMPLE_CATALOG_NOTE} ${KIT_NOTE}`,
    howToUse: "Unpack and use each item as you would in a daily home pooja. Check each pack.",
    images: [photos.kitchen, photos.brass],
    isFeatured: true,
    tags: ["kit", "pooja"],
    aliases: ["pooja kit", "pooja starter", "daily pooja kit", "பூஜை கிட்", "samagri kit"],
    relatedSlugs: ["karpooram-camphor", "kungumam-kumkum", "cotton-wicks-thiri"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-kit-daily", sku: "BG-KIT-POOJA", name: "1 kit", pricePaise: 49900, mrpPaise: 59900, weightGrams: 750, stockQty: 12 },
    ],
  }),
  product({
    id: "prod-ganapathy-kit",
    name: "Ganapathy Homam kit",
    nameTa: "கணபதி ஹோமக் கிட்",
    slug: "ganapathy-homam-kit",
    categorySlug: "ganapathy-homam",
    shortDescription: "Shop-packed materials commonly sold for Ganapathy Homam.",
    description: `${SAMPLE_CATALOG_NOTE} ${KIT_NOTE} Often bought with samagri, ghee, and camphor — not a substitute for a priest’s instruction.`,
    howToUse: "Hand to the priest or use as directed by your family custom. Ask the shop to adjust contents.",
    images: [photos.temple, photos.kitchen],
    isFeatured: true,
    tags: ["homam", "ganapathy", "kit"],
    aliases: [
      "ganapathy homam",
      "ganapathi homam",
      "ganesha homam",
      "ganapathy homam kit",
      "கணபதி ஹோமம்",
      "vinayaka homam",
    ],
    relatedSlugs: ["ganapathy-homam-samagri", "homam-samidha", "karpooram-camphor"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-gh-kit", sku: "BG-KIT-GHOMAM", name: "1 kit", pricePaise: 69900, mrpPaise: 79900, weightGrams: 1200, stockQty: 10 },
    ],
  }),
  product({
    id: "prod-gh-samagri",
    name: "Ganapathy Homam samagri",
    nameTa: "கணபதி ஹோம சாமகிரி",
    slug: "ganapathy-homam-samagri",
    categorySlug: "ganapathy-homam",
    shortDescription: "Mixed homam samagri sold for Ganapathy Homam.",
    description: `${SAMPLE_CATALOG_NOTE} A mixed samagri pack. Exact herbs and grains vary by pack — read the label at the counter.`,
    howToUse: "Used during homam as directed by the priest. Keep dry.",
    images: [photos.spices, photos.herbs],
    isFeatured: true,
    tags: ["samagri", "homam"],
    aliases: ["homam samagri", "havan samagri", "ganapathy samagri", "ஹோம சாமகிரி"],
    relatedSlugs: ["ganapathy-homam-kit", "homam-samidha"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-gh-samagri", sku: "BG-GH-SAMAGRI", name: "250g", pricePaise: 14900, mrpPaise: 17900, weightGrams: 250, stockQty: 20 },
    ],
  }),
  product({
    id: "prod-samidha",
    name: "Homam samidha",
    nameTa: "ஹோம சமிதா",
    slug: "homam-samidha",
    categorySlug: "ganapathy-homam",
    shortDescription: "Dried wood sticks (samidha) used in homam fire.",
    description: `${SAMPLE_CATALOG_NOTE} Samidha / ஹோம சமிதா — dried sticks sold for havan. Species and size vary by pack.`,
    howToUse: "Used in the havan kund as directed. Store dry, away from flame until use.",
    images: [photos.forest],
    isFeatured: false,
    tags: ["samidha", "havan"],
    aliases: ["samidha", "samith", "havan sticks", "ஹோம சமிதா", "homam wood"],
    relatedSlugs: ["ganapathy-homam-kit", "ganapathy-homam-samagri"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-samidha", sku: "BG-SAMIDHA", name: "1 bundle", pricePaise: 9900, mrpPaise: 11900, weightGrams: 400, stockQty: 16 },
    ],
  }),
  product({
    id: "prod-navagraha-kit",
    name: "Navagraha Homam kit",
    nameTa: "நவக்கிரக ஹோமக் கிட்",
    slug: "navagraha-homam-kit",
    categorySlug: "navagraha-homam",
    shortDescription: "Shop-packed materials commonly sold for Navagraha Homam.",
    description: `${SAMPLE_CATALOG_NOTE} ${KIT_NOTE}`,
    howToUse: "Hand to the priest or follow family custom. Ask the shop to adjust contents.",
    images: [photos.temple, photos.spices],
    isFeatured: true,
    tags: ["navagraha", "homam", "kit"],
    aliases: [
      "navagraha homam",
      "navagraha pooja",
      "navagraham",
      "நவக்கிரக பூஜை",
      "நவக்கிரக ஹோமம்",
      "navagraha kit",
    ],
    relatedSlugs: ["navadhanya", "navagraha-samagri"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-ng-kit", sku: "BG-KIT-NGHOMAM", name: "1 kit", pricePaise: 79900, mrpPaise: 89900, weightGrams: 1400, stockQty: 8 },
    ],
  }),
  product({
    id: "prod-navadhanya",
    name: "Navadhanya",
    nameTa: "நவதானியம்",
    slug: "navadhanya",
    categorySlug: "navagraha-homam",
    shortDescription: "Nine grains used in Navagraha pooja.",
    description: `${SAMPLE_CATALOG_NOTE} Navadhanya / நவதானியம் — nine grains sold as a set for Navagraha pooja.`,
    howToUse: "Used in Navagraha pooja as directed by the priest or family custom. Keep dry.",
    images: [photos.herbs, photos.spices],
    isFeatured: true,
    tags: ["navadhanya", "navagraha"],
    aliases: ["navadhanya", "nava dhanya", "nine grains", "நவதானியம்", "navagraha grains"],
    relatedSlugs: ["navagraha-homam-kit", "navagraha-samagri"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-navadhanya", sku: "BG-NAVADHANYA", name: "1 set", pricePaise: 8900, mrpPaise: 9900, weightGrams: 450, stockQty: 24 },
    ],
  }),
  product({
    id: "prod-ng-samagri",
    name: "Navagraha Homam samagri",
    nameTa: "நவக்கிரக ஹோம சாமகிரி",
    slug: "navagraha-samagri",
    categorySlug: "navagraha-homam",
    shortDescription: "Mixed samagri sold for Navagraha Homam.",
    description: `${SAMPLE_CATALOG_NOTE} Mixed samagri. Exact mix varies by pack.`,
    howToUse: "Used during homam as directed. Keep dry.",
    images: [photos.spices],
    isFeatured: false,
    tags: ["samagri", "navagraha"],
    aliases: ["navagraha samagri", "navagraha havan", "நவக்கிரக சாமகிரி"],
    relatedSlugs: ["navagraha-homam-kit", "navadhanya"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-ng-samagri", sku: "BG-NG-SAMAGRI", name: "250g", pricePaise: 16900, mrpPaise: 19900, weightGrams: 250, stockQty: 14 },
    ],
  }),
  product({
    id: "prod-kumbha-kit",
    name: "Kumbabishekam essentials kit",
    nameTa: "கும்பாபிஷேகக் கிட்",
    slug: "kumbabishekam-essentials-kit",
    categorySlug: "kumbabishekam",
    shortDescription: "Shop-packed materials often bought for kumbabishekam work.",
    description: `${SAMPLE_CATALOG_NOTE} ${KIT_NOTE} Temple quantities differ — call the shop before a large event.`,
    howToUse: "Packed for the organiser or priest to sort. Confirm quantities with the shop.",
    images: [photos.temple, photos.brass],
    isFeatured: true,
    tags: ["kumbabishekam", "temple", "kit"],
    aliases: ["kumbabishekam", "kumbhabhishekam", "kumbabishekam kit", "கும்பாபிஷேகம்", "temple pooja kit"],
    relatedSlugs: ["brass-kalasam", "kungumam-kumkum"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-kb-kit", sku: "BG-KIT-KUMBHA", name: "1 kit", pricePaise: 149900, mrpPaise: 169900, weightGrams: 2500, stockQty: 6 },
    ],
  }),
  product({
    id: "prod-kalasam",
    name: "Brass kalasam",
    nameTa: "பித்தளை கலசம்",
    slug: "brass-kalasam",
    categorySlug: "kumbabishekam",
    shortDescription: "Brass kalasam used in temple and home rituals.",
    description: `${SAMPLE_CATALOG_NOTE} Brass kalasam / கலசம். Finish and size vary — this is a sample listing.`,
    howToUse: "Wash and dry before use. Place as directed for the ritual.",
    images: [photos.brass, photos.metal],
    isFeatured: true,
    tags: ["kalasam", "brass"],
    aliases: ["kalasam", "kalash", "kalasha", "கலசம்", "brass kalasam"],
    relatedSlugs: ["kumbabishekam-essentials-kit", "pooja-bell"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-kalasam-m", sku: "BG-KALASAM-M", name: "Medium", pricePaise: 89900, mrpPaise: 99900, weightGrams: 800, stockQty: 7 },
    ],
  }),
  product({
    id: "prod-sukku",
    name: "Sukku",
    nameTa: "சுக்கு",
    slug: "sukku",
    categorySlug: "naattu-marundhu",
    shortDescription: "Dried ginger. Traditional herbal product.",
    description: `${SAMPLE_CATALOG_NOTE} Sukku / சுக்கு (dried ginger). ${HERBAL_DISCLAIMER}`,
    howToUse: "Traditional kitchen and home use. Follow the pack. Not a substitute for medical care.",
    images: [photos.spices],
    isFeatured: true,
    tags: ["sukku", "herbal"],
    aliases: ["sukku", "dried ginger", "chukku", "சுக்கு", "sukku podi"],
    relatedSlugs: ["omam", "chitharathai"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-sukku-50", sku: "BG-SUKKU-50", name: "50g", pricePaise: 4900, mrpPaise: 5900, weightGrams: 50, stockQty: 30 },
    ],
  }),
  product({
    id: "prod-omam",
    name: "Omam",
    nameTa: "ஓமம்",
    slug: "omam",
    categorySlug: "naattu-marundhu",
    shortDescription: "Ajwain (omam). Traditional herbal product.",
    description: `${SAMPLE_CATALOG_NOTE} Omam / ஓமம். ${HERBAL_DISCLAIMER}`,
    howToUse: "Traditional kitchen and home use. Follow the pack. Not a substitute for medical care.",
    images: [photos.spices, photos.herbs],
    isFeatured: true,
    tags: ["omam", "herbal"],
    aliases: ["omam", "ajwain", "omam seeds", "ஓமம்", "carom"],
    relatedSlugs: ["sukku", "chitharathai"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-omam-50", sku: "BG-OMAM-50", name: "50g", pricePaise: 3500, mrpPaise: 4000, weightGrams: 50, stockQty: 26 },
    ],
  }),
  product({
    id: "prod-chitharathai",
    name: "Chitharathai",
    nameTa: "சித்தரத்தை",
    slug: "chitharathai",
    categorySlug: "naattu-marundhu",
    shortDescription: "Dried Alpinia (chitharathai). Traditional herbal product.",
    description: `${SAMPLE_CATALOG_NOTE} Chitharathai / சித்தரத்தை. ${HERBAL_DISCLAIMER}`,
    howToUse: "Traditional home use. Follow the pack. Not a substitute for medical care.",
    images: [photos.herbs],
    isFeatured: false,
    tags: ["chitharathai", "herbal"],
    aliases: ["chitharathai", "sitharathai", "சித்தரத்தை", "alpinia"],
    relatedSlugs: ["sukku", "omam"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-chitharathai-50", sku: "BG-CHITHARATHAI-50", name: "50g", pricePaise: 6500, mrpPaise: 7500, weightGrams: 50, stockQty: 18 },
    ],
  }),
  product({
    id: "prod-kasturi",
    name: "Kasturi manjal",
    nameTa: "கஸ்தூரி மஞ்சள்",
    slug: "kasturi-manjal",
    categorySlug: "naattu-marundhu",
    shortDescription: "Wild turmeric (kasturi manjal). Traditional herbal product.",
    description: `${SAMPLE_CATALOG_NOTE} Kasturi manjal / கஸ்தூரி மஞ்சள். ${HERBAL_DISCLAIMER}`,
    howToUse: "Traditional cosmetic and home use as on the pack. Not a substitute for medical care.",
    images: [photos.spices],
    isFeatured: true,
    tags: ["kasturi manjal", "herbal"],
    aliases: ["kasturi manjal", "kasthuri manjal", "wild turmeric", "கஸ்தூரி மஞ்சள்"],
    relatedSlugs: ["manjal-turmeric", "sukku"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-kasturi-50", sku: "BG-KASTURI-50", name: "50g", pricePaise: 7900, mrpPaise: 8900, weightGrams: 50, stockQty: 20 },
    ],
  }),
  product({
    id: "prod-diya",
    name: "Brass diya",
    nameTa: "பித்தளை விளக்கு",
    slug: "brass-diya-vilakku",
    slugAliases: ["demo-brass-diya"],
    categorySlug: "spiritual-essentials",
    shortDescription: "Brass oil lamp (vilakku) for the home shrine.",
    description: `${SAMPLE_CATALOG_NOTE} Brass diya / விளக்கு.`,
    howToUse: "Add oil or ghee and a cotton wick, then light on a stable surface.",
    images: [photos.brass, photos.lamp],
    isFeatured: true,
    tags: ["diya", "vilakku"],
    aliases: ["diya", "vilakku", "brass lamp", "விளக்கு", "deepam"],
    relatedSlugs: ["cotton-wicks-thiri", "pooja-lamp-oil"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-diya-s", sku: "BG-DIYA-S", name: "Small", pricePaise: 24900, mrpPaise: 29900, weightGrams: 180, stockQty: 15 },
    ],
  }),
  product({
    id: "prod-ganesha",
    name: "Ganapathy idol",
    nameTa: "கணபதி விக்ரகம்",
    slug: "ganapathy-idol",
    slugAliases: ["demo-ganesha-idol"],
    categorySlug: "spiritual-essentials",
    shortDescription: "Small Ganapathy idol for the pooja shelf.",
    description: `${SAMPLE_CATALOG_NOTE} A sample idol listing. Material and size will match the counter when replaced.`,
    howToUse: "Place on a clean pooja shelf. Wipe with a dry cloth.",
    images: [photos.india, photos.temple],
    isFeatured: false,
    tags: ["ganapathy", "idol"],
    aliases: ["ganesha", "ganapathy", "ganapathi", "vinayaka", "pillayar", "கணபதி", "idol"],
    relatedSlugs: ["ganapathy-homam-kit", "pooja-bell"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-ganesha-m", sku: "BG-GANAPATHY-M", name: "Medium", pricePaise: 79900, mrpPaise: 89900, weightGrams: 650, stockQty: 8 },
    ],
  }),
  product({
    id: "prod-bell",
    name: "Pooja bell",
    nameTa: "பூஜை மணி",
    slug: "pooja-bell",
    categorySlug: "spiritual-essentials",
    shortDescription: "Hand bell used during aarti.",
    description: `${SAMPLE_CATALOG_NOTE} Pooja bell / மணி.`,
    howToUse: "Ring during aarti as you normally would. Keep dry.",
    images: [photos.metal, photos.brass],
    isFeatured: false,
    tags: ["bell", "mani"],
    aliases: ["bell", "pooja bell", "mani", "மணி", "ghanti"],
    relatedSlugs: ["brass-diya-vilakku", "brass-kalasam"],
    rating: null,
    reviewCount: 0,
    variants: [
      { id: "var-bell", sku: "BG-BELL", name: "1 pc", pricePaise: 19900, mrpPaise: 24900, weightGrams: 220, stockQty: 14 },
    ],
  }),
];

const productsBySlug = new Map(CATALOG_PRODUCTS.map((item) => [item.slug, item]));

export function getCatalogProduct(slug: string) {
  const direct = productsBySlug.get(slug);
  if (direct) {
    return direct;
  }

  return CATALOG_PRODUCTS.find((item) => item.slugAliases?.includes(slug));
}

export function catalogSearchHaystack(product: CatalogProductDef) {
  const category = CATEGORIES.find((item) => item.slug === product.categorySlug);
  return [
    product.name,
    product.nameTa,
    product.slug,
    product.shortDescription,
    product.description,
    ...(product.slugAliases ?? []),
    ...product.aliases,
    ...product.tags,
    category?.name,
    category?.nameTa,
    category?.shortName,
    category?.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function normalizeSearchNeedle(query: string) {
  return query.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
}

export function catalogProductMatchesQuery(product: CatalogProductDef, query: string) {
  const needle = normalizeSearchNeedle(query);
  if (!needle) {
    return false;
  }

  return catalogSearchHaystack(product).includes(needle);
}

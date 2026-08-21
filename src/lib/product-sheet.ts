import { rupeesToPaise } from "@/lib/paise-parse";
import { parseSearchKeywords } from "@/lib/search";
import { slugify } from "@/lib/slug";

export const PRODUCT_SHEET_MAX_ROWS = 200;
export const PRODUCT_SHEET_MAX_IMAGES = 8;
export const PRODUCT_SHEET_NAME = "Products";
export const PRODUCT_SHEET_CATEGORIES_NAME = "Categories";
export const PRODUCT_SHEET_INSTRUCTIONS_NAME = "Read me";

export const PRODUCT_SHEET_COLUMNS = [
  { key: "name", header: "Name", width: 28, wrap: false },
  { key: "category", header: "Category", width: 24, wrap: false },
  { key: "slug", header: "URL name", width: 22, wrap: false },
  { key: "status", header: "Status", width: 14, wrap: false },
  { key: "featured", header: "Featured", width: 12, wrap: false },
  { key: "description", header: "Description", width: 40, wrap: true },
  { key: "how_to_use", header: "How to use", width: 36, wrap: true },
  { key: "search_keywords", header: "Search words", width: 36, wrap: true },
  { key: "seo_title", header: "Google title", width: 28, wrap: true },
  { key: "seo_description", header: "Google description", width: 36, wrap: true },
  { key: "pack_name", header: "Pack name", width: 16, wrap: false },
  { key: "sku", header: "SKU", width: 18, wrap: false },
  { key: "price", header: "Price", width: 12, wrap: false },
  { key: "mrp", header: "MRP", width: 12, wrap: false },
  { key: "weight_grams", header: "Weight grams", width: 14, wrap: false },
  { key: "stock", header: "Stock", width: 10, wrap: false },
  { key: "image", header: "Image", width: 22, wrap: false },
  { key: "image_2", header: "Image 2", width: 22, wrap: false },
] as const;

export type ProductSheetColumn = (typeof PRODUCT_SHEET_COLUMNS)[number]["key"];

const HEADER_ALIASES: Record<string, ProductSheetColumn> = {
  name: "name",
  product: "name",
  product_name: "name",
  category: "category",
  slug: "slug",
  url_name: "slug",
  url: "slug",
  status: "status",
  featured: "featured",
  description: "description",
  how_to_use: "how_to_use",
  search_words: "search_keywords",
  search_keywords: "search_keywords",
  google_title: "seo_title",
  seo_title: "seo_title",
  google_description: "seo_description",
  seo_description: "seo_description",
  pack_name: "pack_name",
  pack: "pack_name",
  variant: "pack_name",
  sku: "sku",
  price: "price",
  selling_price: "price",
  mrp: "mrp",
  weight_grams: "weight_grams",
  weight: "weight_grams",
  stock: "stock",
  image: "image",
  image_1: "image",
  photo: "image",
  image_2: "image_2",
  photo_2: "image_2",
};

const IMAGE_COLUMNS = PRODUCT_SHEET_COLUMNS.filter((column) => column.key.startsWith("image")).map(
  (column) => column.key,
);

export type ProductSheetError = {
  row: number | null;
  column: string | null;
  message: string;
};

export type ProductSheetRow = {
  rowNumber: number;
  values: Partial<Record<ProductSheetColumn, string>>;
};

export type BulkCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type BulkProductDraft = {
  name: string;
  slug: string;
  description: string | null;
  howToUse: string | null;
  categoryId: string;
  categoryName: string;
  status: "draft" | "active" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  searchKeywords: string[];
  imageRefs: string[];
  isFeatured: boolean;
  variants: Array<{
    rowNumber: number;
    sku: string;
    name: string;
    pricePaise: number;
    mrpPaise: number | null;
    weightGrams: number | null;
    stockQty: number;
    isActive: boolean;
  }>;
};

export type BulkPreviewPack = {
  rowNumber: number;
  packName: string;
  sku: string;
  pricePaise: number;
  stockQty: number;
};

export type BulkPreviewProduct = {
  name: string;
  slug: string;
  categoryName: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  searchKeywords: string[];
  imageRefs: string[];
  packs: BulkPreviewPack[];
};

export type ProductSheetAnalysis = {
  errors: ProductSheetError[];
  products: BulkProductDraft[];
  preview: BulkPreviewProduct[];
};

export function normalizeSheetHeader(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

export function resolveSheetHeader(raw: string): ProductSheetColumn | null {
  const normalized = normalizeSheetHeader(raw);
  if (!normalized) {
    return null;
  }
  return HEADER_ALIASES[normalized] ?? null;
}

export function cellToText(value: unknown) {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.replace(/^\uFEFF/, "").trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (Number.isInteger(value)) {
      return String(value);
    }
    return String(Math.round(value * 100) / 100);
  }
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }
  if (typeof value === "object") {
    const record = value as { text?: unknown; result?: unknown; richText?: Array<{ text?: string }> };
    if (typeof record.text === "string") {
      return record.text.trim();
    }
    if (Array.isArray(record.richText)) {
      return record.richText.map((part) => part.text ?? "").join("").trim();
    }
    if ("result" in record) {
      return cellToText(record.result);
    }
  }
  return String(value).trim();
}

export function parseCsvTable(text: string) {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        quoted = false;
        continue;
      }
      field += char;
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      current.push(field.trim());
      field = "";
      continue;
    }
    if (char === "\n") {
      current.push(field.trim());
      field = "";
      if (current.some((item) => item)) {
        rows.push(current);
      }
      current = [];
      continue;
    }
    field += char;
  }

  current.push(field.trim());
  if (current.some((item) => item)) {
    rows.push(current);
  }

  return rows;
}

export function tableToSheetRows(table: string[][]): { rows: ProductSheetRow[]; errors: ProductSheetError[] } {
  const errors: ProductSheetError[] = [];
  if (table.length === 0) {
    return { rows: [], errors: [{ row: null, column: null, message: "The sheet is empty." }] };
  }

  const headerCells = table[0] ?? [];
  const headerMap: Array<ProductSheetColumn | null> = headerCells.map((header) => resolveSheetHeader(header));
  const seen = new Set<ProductSheetColumn>();
  let hasName = false;
  let hasCategory = false;

  headerMap.forEach((column, index) => {
    const label = headerCells[index]?.trim() || `column ${index + 1}`;
    if (!column) {
      return;
    }
    if (column === "name") {
      hasName = true;
    }
    if (column === "category") {
      hasCategory = true;
    }
    if (seen.has(column) && !column.startsWith("image")) {
      errors.push({ row: 1, column: label, message: `Column “${label}” is repeated.` });
    }
    seen.add(column);
  });

  if (!hasName || !hasCategory) {
    errors.push({
      row: 1,
      column: null,
      message: "The first row must include Name and Category. Download the template and keep that header row.",
    });
    return { rows: [], errors };
  }

  const rows: ProductSheetRow[] = [];
  for (let tableIndex = 1; tableIndex < table.length; tableIndex += 1) {
    const cells = table[tableIndex] ?? [];
    const rowNumber = tableIndex + 1;
    const values: ProductSheetRow["values"] = {};
    let empty = true;
    headerMap.forEach((column, index) => {
      if (!column) {
        return;
      }
      const text = (cells[index] ?? "").trim();
      if (!text) {
        return;
      }
      empty = false;
      if (column.startsWith("image") && values[column]) {
        values[column] = `${values[column]}; ${text}`;
        return;
      }
      values[column] = text;
    });
    if (!empty) {
      rows.push({ rowNumber, values });
    }
  }

  return { rows, errors };
}

export function sheetBasename(raw: string) {
  return raw.replace(/\\/g, "/").split("/").pop()?.trim() ?? "";
}

function optionalText(value: string | undefined, max: number, row: number, column: string, errors: ProductSheetError[]) {
  const text = (value ?? "").trim();
  if (!text) {
    return null;
  }
  if (text.length > max) {
    errors.push({ row, column, message: `${column} is too long (max ${max} characters).` });
    return text.slice(0, max);
  }
  return text;
}

function parseStatus(raw: string | undefined, row: number, errors: ProductSheetError[]) {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) {
    return "draft" as const;
  }
  if (value === "draft" || value === "active" || value === "archived") {
    return value;
  }
  errors.push({
    row,
    column: "Status",
    message: "Status must be draft, active, or archived. Leave it blank for draft.",
  });
  return "draft" as const;
}

function parseFeatured(raw: string | undefined, row: number, errors: ProductSheetError[]) {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) {
    return false;
  }
  if (["yes", "y", "true", "1"].includes(value)) {
    return true;
  }
  if (["no", "n", "false", "0"].includes(value)) {
    return false;
  }
  errors.push({ row, column: "Featured", message: "Featured must be yes or no. Leave it blank for no." });
  return false;
}

function parseRupees(raw: string | undefined, row: number, column: string, errors: ProductSheetError[], emptyValue: number | null) {
  const text = (raw ?? "").trim();
  if (!text) {
    return emptyValue;
  }
  const paise = rupeesToPaise(text);
  if (paise == null) {
    errors.push({ row, column, message: `${column} must be rupees, for example 89 or 89.50.` });
    return emptyValue;
  }
  return paise;
}

function parseInteger(raw: string | undefined, row: number, column: string, errors: ProductSheetError[], emptyValue: number | null, options?: { positive?: boolean }) {
  const text = (raw ?? "").trim();
  if (!text) {
    return emptyValue;
  }
  if (!/^\d+$/.test(text)) {
    errors.push({ row, column, message: `${column} must be a whole number.` });
    return emptyValue;
  }
  const value = Number(text);
  if (options?.positive && value <= 0) {
    errors.push({ row, column, message: `${column} must be greater than 0, or leave it blank.` });
    return emptyValue;
  }
  return value;
}

function parseImageRef(raw: string, row: number, column: string, errors: ProductSheetError[], imageNames: Set<string>) {
  const value = raw.trim();
  if (!value) {
    return null;
  }
  if (value.includes("..")) {
    errors.push({ row, column, message: `${column} cannot contain “..”.` });
    return null;
  }
  if (value.startsWith("https://") || value.startsWith("/uploads/")) {
    return value;
  }
  if (value.startsWith("http://")) {
    errors.push({ row, column, message: `${column} links must start with https:// or /uploads/.` });
    return null;
  }
  const filename = sheetBasename(value);
  if (!filename) {
    errors.push({ row, column, message: `${column} needs a file name, such as karpooram.jpg.` });
    return null;
  }
  if (!imageNames.has(filename.toLowerCase())) {
    errors.push({
      row,
      column,
      message: `Photo “${filename}” was not uploaded. Add it next to the sheet, or clear this cell.`,
    });
    return null;
  }
  return filename;
}

function matchCategory(raw: string, categories: BulkCategoryOption[]) {
  const needle = raw.trim().toLowerCase();
  return categories.find((category) => category.name.toLowerCase() === needle || category.slug.toLowerCase() === needle);
}

function defaultSku(name: string, packIndex: number) {
  const stem = slugify(name).replace(/-/g, "").slice(0, 12).toUpperCase() || "ITEM";
  return `BG-${stem}-${packIndex + 1}`;
}

function nextGeneratedSku(name: string, startIndex: number, used: Set<string>) {
  let index = startIndex;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const sku = defaultSku(name, index);
    if (!used.has(sku.toLowerCase())) {
      used.add(sku.toLowerCase());
      return sku;
    }
    index += 1;
  }
  return defaultSku(name, startIndex);
}

function previewFromDraft(product: BulkProductDraft): BulkPreviewProduct {
  return {
    name: product.name,
    slug: product.slug,
    categoryName: product.categoryName,
    status: product.status,
    featured: product.isFeatured,
    searchKeywords: product.searchKeywords,
    imageRefs: product.imageRefs,
    packs: product.variants.map((variant) => ({
      rowNumber: variant.rowNumber,
      packName: variant.name,
      sku: variant.sku,
      pricePaise: variant.pricePaise,
      stockQty: variant.stockQty,
    })),
  };
}

export function analyzeProductSheetRows(
  rows: ProductSheetRow[],
  options: {
    categories: BulkCategoryOption[];
    existingSlugs: string[];
    existingSkus: string[];
    imageNames: string[];
  },
): ProductSheetAnalysis {
  const errors: ProductSheetError[] = [];
  const usedSlugs = new Set(options.existingSlugs.map((item) => item.toLowerCase()));
  const usedSkus = new Set(options.existingSkus.map((item) => item.toLowerCase()));
  const imageNames = new Set(options.imageNames.map((item) => item.toLowerCase()));

  if (options.categories.length === 0) {
    errors.push({
      row: null,
      column: "Category",
      message: "No categories in the shop yet. Add ritual tiles under Home first, then upload again.",
    });
  }

  if (rows.length === 0) {
    errors.push({ row: null, column: null, message: "The sheet has no product rows under the header." });
    return { errors, products: [], preview: [] };
  }

  if (rows.length > PRODUCT_SHEET_MAX_ROWS) {
    errors.push({
      row: null,
      column: null,
      message: `The sheet has ${rows.length} product rows. Upload at most ${PRODUCT_SHEET_MAX_ROWS} at a time.`,
    });
    return { errors, products: [], preview: [] };
  }

  const groups = new Map<string, ProductSheetRow[]>();
  const groupOrder: string[] = [];
  for (const row of rows) {
    const name = (row.values.name ?? "").trim();
    if (!name) {
      errors.push({ row: row.rowNumber, column: "Name", message: "Name is required." });
      continue;
    }
    if (name.length > 160) {
      errors.push({ row: row.rowNumber, column: "Name", message: "Name is too long (max 160 characters)." });
    }
    const key = name.replace(/\s+/g, " ").toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(key, [row]);
      groupOrder.push(key);
    }
  }

  const products: BulkProductDraft[] = [];

  for (const key of groupOrder) {
    const group = groups.get(key) ?? [];
    const first = group[0];
    if (!first) {
      continue;
    }

    const name = (first.values.name ?? "").replace(/\s+/g, " ").trim();
    const categoryRaw = group.map((row) => row.values.category?.trim() ?? "").find(Boolean) ?? "";
    if (!categoryRaw) {
      errors.push({ row: first.rowNumber, column: "Category", message: "Category is required." });
    }
    const category = categoryRaw ? matchCategory(categoryRaw, options.categories) : undefined;
    if (categoryRaw && !category && options.categories.length > 0) {
      errors.push({
        row: first.rowNumber,
        column: "Category",
        message: `Category “${categoryRaw}” is not in the shop. Use a name from the Categories sheet.`,
      });
    }

    for (const row of group.slice(1)) {
      const rowCategory = row.values.category?.trim() ?? "";
      if (rowCategory && categoryRaw && rowCategory.toLowerCase() !== categoryRaw.toLowerCase()) {
        errors.push({
          row: row.rowNumber,
          column: "Category",
          message: `This pack uses a different category than “${name}” on row ${first.rowNumber}.`,
        });
      }
    }

    const slugSource = group.map((row) => row.values.slug?.trim() ?? "").find(Boolean) || name;
    const slug = slugify(slugSource);
    if (!slug) {
      errors.push({
        row: first.rowNumber,
        column: "URL name",
        message: "URL name is empty. Add an English URL name, for example karpooram.",
      });
    } else if (usedSlugs.has(slug)) {
      errors.push({
        row: first.rowNumber,
        column: "URL name",
        message: `URL name “${slug}” is already used. Change the name or URL name.`,
      });
    } else {
      usedSlugs.add(slug);
    }

    const statusValues = [...new Set(group.map((row) => (row.values.status ?? "").trim().toLowerCase()).filter(Boolean))];
    if (statusValues.length > 1) {
      errors.push({
        row: first.rowNumber,
        column: "Status",
        message: `Rows for “${name}” have different status values.`,
      });
    }
    const status = parseStatus(statusValues[0], first.rowNumber, errors);

    const featuredValues = [...new Set(group.map((row) => (row.values.featured ?? "").trim().toLowerCase()).filter(Boolean))];
    if (featuredValues.length > 1) {
      errors.push({
        row: first.rowNumber,
        column: "Featured",
        message: `Rows for “${name}” have different Featured values.`,
      });
    }
    const isFeatured = parseFeatured(featuredValues[0], first.rowNumber, errors);

    const description = optionalText(
      group.map((row) => row.values.description ?? "").find((value) => value.trim()) ?? "",
      4000,
      first.rowNumber,
      "Description",
      errors,
    );
    const howToUse = optionalText(
      group.map((row) => row.values.how_to_use ?? "").find((value) => value.trim()) ?? "",
      4000,
      first.rowNumber,
      "How to use",
      errors,
    );
    const seoTitle = optionalText(
      group.map((row) => row.values.seo_title ?? "").find((value) => value.trim()) ?? "",
      160,
      first.rowNumber,
      "Google title",
      errors,
    );
    const seoDescription = optionalText(
      group.map((row) => row.values.seo_description ?? "").find((value) => value.trim()) ?? "",
      300,
      first.rowNumber,
      "Google description",
      errors,
    );
    const searchKeywords = parseSearchKeywords(
      group.map((row) => row.values.search_keywords ?? "").filter((value) => value.trim()).join(", "),
    );

    const imageRefs: string[] = [];
    for (const row of group) {
      for (const column of IMAGE_COLUMNS) {
        const raw = row.values[column];
        if (!raw) {
          continue;
        }
        for (const part of raw.split(/[;,]/)) {
          const header = PRODUCT_SHEET_COLUMNS.find((item) => item.key === column)?.header ?? "Image";
          const ref = parseImageRef(part, row.rowNumber, header, errors, imageNames);
          if (!ref) {
            continue;
          }
          if (imageRefs.some((item) => item.toLowerCase() === ref.toLowerCase())) {
            continue;
          }
          if (imageRefs.length >= PRODUCT_SHEET_MAX_IMAGES) {
            errors.push({
              row: row.rowNumber,
              column: header,
              message: `A product can have at most ${PRODUCT_SHEET_MAX_IMAGES} photos.`,
            });
            continue;
          }
          imageRefs.push(ref);
        }
      }
    }

    const variants: BulkProductDraft["variants"] = [];
    group.forEach((row, packIndex) => {
      const packName = (row.values.pack_name ?? "").trim() || "1 pack";
      if (packName.length > 80) {
        errors.push({ row: row.rowNumber, column: "Pack name", message: "Pack name is too long (max 80 characters)." });
      }
      const providedSku = (row.values.sku ?? "").trim();
      let sku = providedSku;
      if (providedSku) {
        if (providedSku.length > 64) {
          errors.push({ row: row.rowNumber, column: "SKU", message: "SKU is too long (max 64 characters)." });
        }
        if (usedSkus.has(providedSku.toLowerCase())) {
          errors.push({ row: row.rowNumber, column: "SKU", message: `SKU “${providedSku}” is already used.` });
        } else {
          usedSkus.add(providedSku.toLowerCase());
        }
      } else {
        sku = nextGeneratedSku(name, packIndex, usedSkus);
      }

      const pricePaise = parseRupees(row.values.price, row.rowNumber, "Price", errors, 0) ?? 0;
      const mrpPaise = parseRupees(row.values.mrp, row.rowNumber, "MRP", errors, null);
      const weightGrams = parseInteger(row.values.weight_grams, row.rowNumber, "Weight grams", errors, null, {
        positive: true,
      });
      const stockQty = parseInteger(row.values.stock, row.rowNumber, "Stock", errors, 0) ?? 0;

      variants.push({
        rowNumber: row.rowNumber,
        sku,
        name: packName.slice(0, 80) || "1 pack",
        pricePaise,
        mrpPaise,
        weightGrams,
        stockQty,
        isActive: true,
      });
    });

    if (!category || !slug || variants.length === 0) {
      continue;
    }

    products.push({
      name,
      slug,
      description,
      howToUse,
      categoryId: category.id,
      categoryName: category.name,
      status,
      seoTitle,
      seoDescription,
      searchKeywords,
      imageRefs,
      isFeatured,
      variants,
    });
  }

  if (errors.length > 0) {
    return { errors, products: [], preview: [] };
  }

  return {
    errors,
    products,
    preview: products.map(previewFromDraft),
  };
}

export const PRODUCT_SHEET_EXAMPLE_ROWS: string[][] = [
  [
    "Karpooram",
    "Pooja Essentials",
    "",
    "draft",
    "no",
    "Camphor tablets for daily pooja and homam.",
    "Light a small piece during pooja. Keep away from children.",
    "camphor, karpooram, கற்பூரம், kapoor",
    "",
    "",
    "50g",
    "",
    "89",
    "99",
    "50",
    "40",
    "karpooram.jpg",
    "",
  ],
  [
    "Karpooram",
    "Pooja Essentials",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "100g",
    "",
    "159",
    "179",
    "100",
    "20",
    "",
    "",
  ],
  [
    "Kumkum",
    "Pooja Essentials",
    "",
    "draft",
    "no",
    "Kumkum for tilak and pooja decoration.",
    "",
    "kumkum, kungumam, குங்குமம்",
    "",
    "",
    "50g",
    "",
    "39",
    "",
    "50",
    "35",
    "kumkum.jpg",
    "",
  ],
];

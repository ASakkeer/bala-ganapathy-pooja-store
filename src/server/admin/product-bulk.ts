import "server-only";

import { AdminError, listAdminHomeCategories, listAdminProducts, productBodySchema, saveAdminProduct } from "@/server/admin/catalog";
import { buildProductSheetTemplate, parseProductWorkbook } from "@/server/admin/product-sheet-workbook";
import { revalidateCatalog } from "@/server/admin/revalidate";
import {
  analyzeProductSheetRows,
  parseCsvTable,
  tableToSheetRows,
  type BulkPreviewProduct,
  type BulkProductDraft,
  type ProductSheetError,
} from "@/lib/product-sheet";

const MAX_SHEET_BYTES = 2 * 1024 * 1024;

export type BulkCheckResult = {
  errors: ProductSheetError[];
  preview: BulkPreviewProduct[];
  productCount: number;
  packCount: number;
};

function isCsv(filename: string, type: string) {
  const name = filename.toLowerCase();
  return name.endsWith(".csv") || type === "text/csv" || type === "application/csv";
}

function isXlsx(filename: string, type: string) {
  const name = filename.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

async function sheetRowsFromFile(file: File) {
  if (file.size > MAX_SHEET_BYTES) {
    throw new AdminError("The sheet must be 2 MB or smaller.", 400);
  }

  const filename = file.name || "products.xlsx";
  const type = file.type || "";

  if (filename.toLowerCase().endsWith(".xls") && !filename.toLowerCase().endsWith(".xlsx")) {
    throw new AdminError("Use .xlsx or .csv. The old .xls format is not supported.", 400);
  }

  if (isCsv(filename, type)) {
    const text = await file.text();
    return tableToSheetRows(parseCsvTable(text));
  }

  if (!isXlsx(filename, type) && !filename.toLowerCase().endsWith(".xlsx")) {
    throw new AdminError("Upload an Excel .xlsx file or a CSV UTF-8 file.", 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return parseProductWorkbook(bytes, filename);
}

async function catalogContext() {
  const [categories, products] = await Promise.all([listAdminHomeCategories(), listAdminProducts()]);
  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
    existingSlugs: products.map((product) => product.slug),
    existingSkus: products.flatMap((product) => product.variants.map((variant) => variant.sku)),
  };
}

function draftsToCheckResult(drafts: BulkProductDraft[], errors: ProductSheetError[]): BulkCheckResult {
  const previewErrors = errors.length > 0 ? errors : [];
  const products = errors.length > 0 ? [] : drafts;
  return {
    errors: previewErrors,
    preview: errors.length > 0 ? [] : products.map((product) => ({
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
    })),
    productCount: products.length,
    packCount: products.reduce((sum, product) => sum + product.variants.length, 0),
  };
}

export async function analyzeAdminProductSheet(file: File, imageNames: string[]): Promise<BulkCheckResult> {
  const parsed = await sheetRowsFromFile(file);
  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    return { errors: parsed.errors, preview: [], productCount: 0, packCount: 0 };
  }

  const context = await catalogContext();
  const analysis = analyzeProductSheetRows(parsed.rows, {
    ...context,
    imageNames,
  });
  return draftsToCheckResult(analysis.products, [...parsed.errors, ...analysis.errors]);
}

function resolveImageRefs(refs: string[], imageUrls: Record<string, string>, errors: ProductSheetError[]) {
  const images: string[] = [];
  for (const ref of refs) {
    if (ref.startsWith("https://") || ref.startsWith("/uploads/")) {
      images.push(ref);
      continue;
    }
    const url = imageUrls[ref.toLowerCase()];
    if (!url) {
      errors.push({
        row: null,
        column: "Image",
        message: `Photo “${ref}” was not uploaded.`,
      });
      continue;
    }
    images.push(url);
  }
  return images;
}

export async function importAdminProductSheet(file: File, imageUrls: Record<string, string>) {
  const parsed = await sheetRowsFromFile(file);
  const context = await catalogContext();
  const imageNames = Object.keys(imageUrls);
  const analysis = analyzeProductSheetRows(parsed.rows, {
    ...context,
    imageNames,
  });
  const errors = [...parsed.errors, ...analysis.errors];
  if (errors.length > 0) {
    return { ok: false as const, ...draftsToCheckResult([], errors) };
  }

  const bodies = [];
  for (const draft of analysis.products) {
    const images = resolveImageRefs(draft.imageRefs, imageUrls, errors);
    const parsedBody = productBodySchema.safeParse({
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      howToUse: draft.howToUse,
      categoryId: draft.categoryId,
      status: draft.status,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      searchKeywords: draft.searchKeywords,
      images,
      imageAlts: images.map(() => draft.name),
      isFeatured: draft.isFeatured,
      variants: draft.variants.map((variant) => ({
        sku: variant.sku,
        name: variant.name,
        pricePaise: variant.pricePaise,
        mrpPaise: variant.mrpPaise,
        weightGrams: variant.weightGrams,
        stockQty: variant.stockQty,
        isActive: true,
      })),
    });
    if (!parsedBody.success) {
      errors.push({
        row: draft.variants[0]?.rowNumber ?? null,
        column: null,
        message: parsedBody.error.issues[0]?.message ?? `Could not import “${draft.name}”.`,
      });
      continue;
    }
    bodies.push(parsedBody.data);
  }

  if (errors.length > 0) {
    return { ok: false as const, ...draftsToCheckResult([], errors) };
  }

  const ids: string[] = [];
  for (const body of bodies) {
    const id = await saveAdminProduct(body, undefined, { revalidate: false });
    ids.push(id);
  }
  revalidateCatalog();
  return { ok: true as const, imported: ids.length, ids };
}

export async function downloadProductSheetTemplate() {
  const categories = await listAdminHomeCategories();
  return buildProductSheetTemplate(
    categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug })),
  );
}

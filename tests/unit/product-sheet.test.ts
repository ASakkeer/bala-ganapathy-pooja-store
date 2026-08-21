import { describe, expect, it } from "vitest";
import {
  analyzeProductSheetRows,
  parseCsvTable,
  tableToSheetRows,
} from "@/lib/product-sheet";

const categories = [
  { id: "cat-pooja", name: "Pooja Essentials", slug: "pooja-essentials" },
  { id: "cat-gh", name: "Ganapathy Homam", slug: "ganapathy-homam" },
];

function analyze(
  csv: string,
  extras?: { imageNames?: string[]; existingSlugs?: string[]; existingSkus?: string[] },
) {
  const { rows, errors } = tableToSheetRows(parseCsvTable(csv));
  const analysis = analyzeProductSheetRows(rows, {
    categories,
    existingSlugs: extras?.existingSlugs ?? [],
    existingSkus: extras?.existingSkus ?? [],
    imageNames: extras?.imageNames ?? [],
  });
  return { headerErrors: errors, ...analysis };
}

const header = "Name,Category,URL name,Status,Featured,Description,How to use,Search words,Pack name,SKU,Price,MRP,Weight grams,Stock,Image";

describe("product sheet", () => {
  it("parses quoted CSV with Tamil search words", () => {
    const table = parseCsvTable(`${header}\nKarpooram,Pooja Essentials,,,,,,,,50g,,89,,,,"camphor, கற்பூரம்"`);
    expect(table[1]?.[0]).toBe("Karpooram");
  });

  it("groups two packs under one product", () => {
    const csv = `${header}
Karpooram,Pooja Essentials,,,,,,camphor,50g,,89,,,40,karpooram.jpg
Karpooram,Pooja Essentials,,,,,,,100g,,159,,,20,`;
    const result = analyze(csv, { imageNames: ["karpooram.jpg"] });
    expect(result.errors).toEqual([]);
    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.variants).toHaveLength(2);
    expect(result.products[0]?.variants.map((item) => item.name)).toEqual(["50g", "100g"]);
    expect(result.products[0]?.status).toBe("draft");
    expect(result.products[0]?.searchKeywords).toContain("camphor");
  });

  it("reports missing name and unknown category with row and column", () => {
    const csv = `${header}
,Pooja Essentials,,,,,,,,,,,,,
Kumkum,Unknown Aisle,,,,,,,,,,,,,`;
    const result = analyze(csv);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 2, column: "Name" }),
        expect.objectContaining({ row: 3, column: "Category", message: expect.stringContaining("Unknown Aisle") }),
      ]),
    );
    expect(result.preview).toEqual([]);
  });

  it("allows a missing photo cell and errors when the named file is absent", () => {
    const ok = analyze(`${header}\nKumkum,Pooja Essentials,,,,,,,,,,,,,`);
    expect(ok.errors).toEqual([]);
    expect(ok.products[0]?.imageRefs).toEqual([]);

    const missing = analyze(`${header}\nKumkum,Pooja Essentials,,,,,,,,,,,,,kumkum.jpg`);
    expect(missing.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ row: 2, column: "Image", message: expect.stringContaining("kumkum.jpg") })]),
    );
  });

  it("requires an English URL name when the product name cannot make a slug", () => {
    const result = analyze(`${header}\nகற்பூரம்,Pooja Essentials,,,,,,,,,,,,,`);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ column: "URL name" })]),
    );
  });

  it("rejects a slug that already exists", () => {
    const result = analyze(`${header}\nKarpooram,Pooja Essentials,,,,,,,,,,,,,`, {
      existingSlugs: ["karpooram"],
    });
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ column: "URL name", message: expect.stringContaining("already used") })]),
    );
  });
});

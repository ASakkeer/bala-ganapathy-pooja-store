import "server-only";

import ExcelJS from "exceljs";
import { HOME_RITUAL_TILES } from "@/content/home-rituals";
import {
  PRODUCT_SHEET_CATEGORIES_NAME,
  PRODUCT_SHEET_COLUMNS,
  PRODUCT_SHEET_EXAMPLE_ROWS,
  PRODUCT_SHEET_INSTRUCTIONS_NAME,
  PRODUCT_SHEET_MAX_ROWS,
  PRODUCT_SHEET_NAME,
  cellToText,
  tableToSheetRows,
  type BulkCategoryOption,
  type ProductSheetRow,
} from "@/lib/product-sheet";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF6EDE8" },
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  name: "Calibri",
  size: 11,
  color: { argb: "FF5B0719" },
};
const BODY_FONT: Partial<ExcelJS.Font> = { name: "Calibri", size: 11, color: { argb: "FF241C18" } };
const EXAMPLE_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF8F1" },
};
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE6D5C8" } },
  left: { style: "thin", color: { argb: "FFE6D5C8" } },
  bottom: { style: "thin", color: { argb: "FFE6D5C8" } },
  right: { style: "thin", color: { argb: "FFE6D5C8" } },
};

function columnLetter(index: number) {
  let value = index + 1;
  let letter = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    value = Math.floor((value - 1) / 26);
  }
  return letter;
}

export async function buildProductSheetTemplate(categories: BulkCategoryOption[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bala Ganapathy Pooja Store";
  workbook.created = new Date();

  const instructions = workbook.addWorksheet(PRODUCT_SHEET_INSTRUCTIONS_NAME, {
    properties: { defaultRowHeight: 22 },
    views: [{ showGridLines: false }],
  });
  instructions.getColumn(1).width = 18;
  instructions.getColumn(2).width = 92;
  instructions.mergeCells("B1:B1");
  const title = instructions.getCell("B1");
  title.value = "How to fill this sheet";
  title.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FF5B0719" } };
  instructions.getRow(1).height = 28;

  const lines = [
    ["1", "Keep the Products header row. Do not rename the columns."],
    ["2", "One row is one pack (size). Use the same Name on two rows for 50g and 100g."],
    ["3", "Required: Name and Category. Category must match a name on the Categories sheet."],
    ["4", "Leave URL name, SKU, Status, Pack name, Price, and Stock blank if you are unsure. The shop fills them: draft, 1 pack, price 0, stock 0."],
    ["5", "Search words are extra names people might type, separated by commas: camphor, karpooram, கற்பூரம்."],
    ["6", "Photos are not stored inside Excel. Put the file name in Image, such as karpooram.jpg, then upload those photos on the Bulk upload page."],
    ["7", "Replace the sample rows before you import, or change them to your products."],
    ["8", "Save as Excel (.xlsx). CSV UTF-8 also works. Do not use the old .xls format."],
  ];
  lines.forEach((line, index) => {
    const row = instructions.getRow(index + 3);
    row.height = 36;
    row.getCell(1).value = line[0];
    row.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF5B0719" } };
    row.getCell(1).alignment = { vertical: "top" };
    row.getCell(2).value = line[1];
    row.getCell(2).font = { name: "Calibri", size: 12, color: { argb: "FF241C18" } };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
  });

  const categoriesSheet = workbook.addWorksheet(PRODUCT_SHEET_CATEGORIES_NAME, {
    properties: { defaultRowHeight: 22 },
    views: [{ state: "frozen", ySplit: 1 }],
  });
  categoriesSheet.getColumn(1).width = 32;
  categoriesSheet.getColumn(2).width = 28;
  const categoryHeader = categoriesSheet.getRow(1);
  categoryHeader.height = 28;
  categoryHeader.getCell(1).value = "Category";
  categoryHeader.getCell(2).value = "URL name";
  [1, 2].forEach((index) => {
    const cell = categoryHeader.getCell(index);
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: "middle" };
  });
  const categoryRows = categories.length > 0 ? categories : HOME_RITUAL_TILES.map((tile) => ({ name: tile.name, slug: tile.slug }));
  categoryRows.forEach((category, index) => {
    const row = categoriesSheet.getRow(index + 2);
    row.height = 22;
    row.getCell(1).value = category.name;
    row.getCell(2).value = category.slug;
    row.getCell(1).font = BODY_FONT;
    row.getCell(2).font = BODY_FONT;
  });
  if (categories.length === 0) {
    const note = categoriesSheet.getCell("A12");
    note.value = "These names are the home ritual tiles. Create them under Admin → Home before you import.";
    note.font = { name: "Calibri", size: 11, italic: true, color: { argb: "FF6B5344" } };
    categoriesSheet.mergeCells("A12:B12");
    note.alignment = { wrapText: true };
    categoriesSheet.getRow(12).height = 32;
  }

  const products = workbook.addWorksheet(PRODUCT_SHEET_NAME, {
    properties: { defaultRowHeight: 24 },
    views: [{ state: "frozen", ySplit: 1, showGridLines: true }],
  });
  products.getRow(1).height = 32;
  PRODUCT_SHEET_COLUMNS.forEach((column, index) => {
    const col = products.getColumn(index + 1);
    col.width = column.width;
    col.font = BODY_FONT;
    const header = products.getRow(1).getCell(index + 1);
    header.value = column.header;
    header.font = HEADER_FONT;
    header.fill = HEADER_FILL;
    header.border = THIN_BORDER;
    header.alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
  });

  PRODUCT_SHEET_EXAMPLE_ROWS.forEach((values, rowIndex) => {
    const row = products.getRow(rowIndex + 2);
    row.height = 44;
    values.forEach((value, columnIndex) => {
      const cell = row.getCell(columnIndex + 1);
      cell.value = value;
      cell.font = BODY_FONT;
      cell.fill = EXAMPLE_FILL;
      cell.border = THIN_BORDER;
      cell.alignment = {
        wrapText: PRODUCT_SHEET_COLUMNS[columnIndex]?.wrap ?? false,
        vertical: "top",
      };
    });
  });

  const lastDataRow = PRODUCT_SHEET_MAX_ROWS + 1;
  for (let rowNumber = PRODUCT_SHEET_EXAMPLE_ROWS.length + 2; rowNumber <= lastDataRow; rowNumber += 1) {
    const row = products.getRow(rowNumber);
    row.height = 24;
    PRODUCT_SHEET_COLUMNS.forEach((column, columnIndex) => {
      const cell = row.getCell(columnIndex + 1);
      cell.border = THIN_BORDER;
      cell.alignment = { wrapText: column.wrap, vertical: "top" };
    });
  }

  const categoryCol = columnLetter(PRODUCT_SHEET_COLUMNS.findIndex((column) => column.key === "category"));
  const statusCol = columnLetter(PRODUCT_SHEET_COLUMNS.findIndex((column) => column.key === "status"));
  const featuredCol = columnLetter(PRODUCT_SHEET_COLUMNS.findIndex((column) => column.key === "featured"));
  const categoryCount = Math.max(categoryRows.length, 1);

  function addList(column: string, formulae: string[], errorTitle: string, error: string, allowBlank: boolean) {
    for (let rowNumber = 2; rowNumber <= lastDataRow; rowNumber += 1) {
      products.getCell(`${column}${rowNumber}`).dataValidation = {
        type: "list",
        allowBlank,
        formulae,
        showErrorMessage: true,
        errorTitle,
        error,
      };
    }
  }

  addList(
    categoryCol,
    [`'${PRODUCT_SHEET_CATEGORIES_NAME}'!$A$2:$A$${categoryCount + 1}`],
    "Category",
    "Pick a category from the list.",
    false,
  );
  addList(statusCol, ['"draft,active,archived"'], "Status", "Use draft, active, or archived.", true);
  addList(featuredCol, ['"yes,no"'], "Featured", "Use yes or no.", true);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function worksheetToTable(sheet: ExcelJS.Worksheet) {
  const table: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    let lastFilled = 0;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const text = cellToText(cell.value);
      cells[colNumber - 1] = text;
      if (text) {
        lastFilled = colNumber;
      }
    });
    if (lastFilled === 0) {
      return;
    }
    table.push(Array.from({ length: lastFilled }, (_, index) => cells[index] ?? ""));
  });
  return table;
}

export async function parseProductWorkbook(bytes: Buffer, filename: string): Promise<{ rows: ProductSheetRow[]; errors: ReturnType<typeof tableToSheetRows>["errors"] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as unknown as ArrayBuffer);
  const sheet =
    workbook.getWorksheet(PRODUCT_SHEET_NAME) ??
    workbook.worksheets.find((item) => item.name.toLowerCase() === "products") ??
    workbook.worksheets[0];
  if (!sheet) {
    return {
      rows: [],
      errors: [{ row: null, column: null, message: `Could not read a Products sheet in ${filename}.` }],
    };
  }
  return tableToSheetRows(worksheetToTable(sheet));
}

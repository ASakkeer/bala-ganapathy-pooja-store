import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatListedPhone, listedPhones } from "@/lib/contact";
import { STORE_NAME } from "@/lib/constants";
import { formatInvoiceAmount } from "@/lib/order-invoice";
import { formatOrderDate, formatOrderWhen, orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";
import { isShopDelivery } from "@/lib/order-tracking";
import type { PlacedOrder } from "@/server/checkout";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const GUTTER = 28;
const COL = (CONTENT_WIDTH - GUTTER) / 2;

const BRAND = rgb(91 / 255, 7 / 255, 25 / 255);
const TEXT = rgb(28 / 255, 27 / 255, 27 / 255);
const MUTED = rgb(86 / 255, 66 / 255, 67 / 255);
const BORDER = rgb(220 / 255, 192 / 255, 192 / 255);
const SURFACE = rgb(252 / 255, 249 / 255, 248 / 255);
const BAND = rgb(247 / 255, 241 / 255, 242 / 255);
const SUCCESS = rgb(47 / 255, 93 / 255, 58 / 255);
const SUCCESS_BG = rgb(236 / 255, 242 / 255, 237 / 255);
const WHITE = rgb(1, 1, 1);

function pdfSafe(value: string) {
  return value
    .replaceAll("₹", "Rs.")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("•", "*")
    .replaceAll("×", "x")
    .replaceAll("\u00a0", " ")
    .replace(/[^\u0000-\u00ff]/g, "?");
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const splitWord = (word: string) => {
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      return [word];
    }
    const parts: string[] = [];
    let chunk = "";
    for (const char of word) {
      const next = `${chunk}${char}`;
      if (chunk && font.widthOfTextAtSize(next, size) > maxWidth) {
        parts.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) {
      parts.push(chunk);
    }
    return parts;
  };

  const lines: string[] = [];
  let current = "";
  for (const word of words.flatMap(splitWord)) {
    const next = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(current);
      current = word;
      continue;
    }
    current = next;
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

function deliveredAt(order: PlacedOrder) {
  const events = [...(order.events ?? [])].reverse();
  return events.find((event) => event.status === "delivered")?.at ?? order.createdAt;
}

function invoiceStatusCopy(order: PlacedOrder) {
  const city = order.address.city?.trim();
  if (city) {
    return `This order was delivered in ${city}. Payment was received.`;
  }
  return "This order was delivered. Payment was received.";
}

function deliveryLines(order: PlacedOrder) {
  const lines: string[] = [];
  if (isShopDelivery(order.courierName)) {
    lines.push("Shop delivery");
    if (order.trackingLocation?.trim()) {
      lines.push(order.trackingLocation.trim());
    }
    return lines;
  }
  if (order.courierName?.trim()) {
    lines.push(order.courierName.trim());
  }
  if (order.trackingId?.trim()) {
    lines.push(`Tracking ID ${order.trackingId.trim()}`);
  }
  if (order.trackingLocation?.trim()) {
    lines.push(order.trackingLocation.trim());
  }
  return lines;
}

async function embedStoreLogo(pdf: PDFDocument) {
  try {
    const bytes = await readFile(join(process.cwd(), "public", "assets", "bgps-logo.png"));
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

export async function buildOrderInvoicePdf(
  order: PlacedOrder,
  store: { address?: string | null; phones?: string[] | null },
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await embedStoreLogo(pdf);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN + 28) {
      return;
    }
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawContinuedHeader();
  };

  const text = (
    value: string,
    x: number,
    at: number,
    size: number,
    font: PDFFont,
    color = TEXT,
    target: PDFPage = page,
  ) => {
    const safe = pdfSafe(value);
    if (!safe) {
      return;
    }
    target.drawText(safe, { x, y: at, size, font, color });
  };

  const rightText = (
    value: string,
    right: number,
    at: number,
    size: number,
    font: PDFFont,
    color = TEXT,
  ) => {
    const safe = pdfSafe(value);
    if (!safe) {
      return;
    }
    text(safe, right - font.widthOfTextAtSize(safe, size), at, size, font, color);
  };

  const capsWidth = (value: string, size: number, font: PDFFont, tracking = 1.15) => {
    const upper = pdfSafe(value).toUpperCase();
    if (!upper) {
      return 0;
    }
    return (
      [...upper].reduce((sum, char) => sum + font.widthOfTextAtSize(char, size), 0) +
      Math.max(0, upper.length - 1) * tracking
    );
  };

  const drawCaps = (
    value: string,
    x: number,
    at: number,
    size: number,
    font: PDFFont,
    color = MUTED,
    tracking = 1.15,
    align: "left" | "right" = "left",
  ) => {
    const upper = pdfSafe(value).toUpperCase();
    if (!upper) {
      return;
    }
    let cursor = align === "right" ? x - capsWidth(upper, size, font, tracking) : x;
    for (const char of upper) {
      text(char, cursor, at, size, font, color);
      cursor += font.widthOfTextAtSize(char, size) + tracking;
    }
  };

  const rule = (at: number, thickness = 0.8) => {
    page.drawLine({
      start: { x: MARGIN, y: at },
      end: { x: PAGE_WIDTH - MARGIN, y: at },
      thickness,
      color: BORDER,
    });
  };

  const drawBadge = (label: string, right: number, at: number) => {
    const size = 8;
    const padX = 8;
    const height = 15;
    const width = bold.widthOfTextAtSize(pdfSafe(label), size) + padX * 2;
    const x = right - width;
    page.drawRectangle({
      x,
      y: at - 4,
      width,
      height,
      color: SUCCESS_BG,
      borderColor: rgb(0.82, 0.88, 0.83),
      borderWidth: 0.4,
    });
    text(label, x + padX, at, size, bold, SUCCESS);
    return width + 6;
  };

  const drawWrappedAt = (
    value: string,
    x: number,
    width: number,
    size: number,
    font: PDFFont,
    color = TEXT,
    leading = 14,
  ) => {
    const lines = wrapText(font, value, size, width);
    for (const line of lines) {
      ensureSpace(leading);
      text(line, x, y, size, font, color);
      y -= leading;
    }
    return lines.length;
  };

  function drawContinuedHeader() {
    if (logo) {
      const size = logo.scaleToFit(110, 28);
      page.drawImage(logo, {
        x: MARGIN,
        y: y - size.height,
        width: size.width,
        height: size.height,
      });
    } else {
      text(STORE_NAME, MARGIN, y - 12, 10, bold, BRAND);
    }
    rightText(order.publicNumber, PAGE_WIDTH - MARGIN, y - 14, 11, serifBold, BRAND);
    y -= 40;
    rule(y);
    y -= 18;
  }

  function drawHeader() {
    const headerTop = y;
    const leftWidth = COL;
    const rightX = MARGIN + COL + GUTTER;
    const rightEdge = PAGE_WIDTH - MARGIN;

    let leftY = headerTop;
    if (logo) {
      const size = logo.scaleToFit(168, 52);
      page.drawImage(logo, {
        x: MARGIN,
        y: headerTop - size.height,
        width: size.width,
        height: size.height,
      });
      leftY = headerTop - size.height - 12;
    }

    text(STORE_NAME, MARGIN, leftY, 11, bold, TEXT);
    leftY -= 16;
    if (store.address) {
      const lines = wrapText(regular, store.address, 9, leftWidth);
      for (const line of lines) {
        text(line, MARGIN, leftY, 9, regular, MUTED);
        leftY -= 13;
      }
    }
    const phones = listedPhones(store.phones).map(formatListedPhone);
    if (phones.length > 0) {
      const lines = wrapText(regular, phones.join("  ·  "), 9, leftWidth);
      for (const line of lines) {
        text(line, MARGIN, leftY, 9, regular, MUTED);
        leftY -= 13;
      }
    }

    let rightY = headerTop - 2;
    drawCaps("Order", rightEdge, rightY, 8, bold, MUTED, 1.4, "right");
    rightY -= 22;
    const numberSize = 18;
    const number = pdfSafe(order.publicNumber);
    rightText(number, rightEdge, rightY, numberSize, serifBold, TEXT);
    rightY -= 18;
    const placed = formatOrderWhen(order.createdAt);
    if (placed) {
      rightText(placed, rightEdge, rightY, 9, regular, MUTED);
      rightY -= 18;
    }
    let badgeRight = rightEdge;
    badgeRight -= drawBadge(paymentStatusLabel(order.paymentStatus), badgeRight, rightY);
    drawBadge(orderStatusLabel(order.status), badgeRight, rightY);
    rightY -= 14;

    y = Math.min(leftY, rightY) - 14;
    rule(y, 1);
    y -= 1;
  }

  function drawStatusBand() {
    const copy = invoiceStatusCopy(order);
    const lines = wrapText(regular, copy, 10, CONTENT_WIDTH - 28);
    const height = 18 + lines.length * 14;
    ensureSpace(height + 8);
    page.drawRectangle({
      x: MARGIN,
      y: y - height + 8,
      width: CONTENT_WIDTH,
      height,
      color: BAND,
    });
    let lineY = y - 10;
    for (const line of lines) {
      text(line, MARGIN + 14, lineY, 10, regular, TEXT);
      lineY -= 14;
    }
    y -= height;
    rule(y, 1);
    y -= 18;
  }

  function drawDetails() {
    const rightX = MARGIN + COL + GUTTER;
    const startY = y;

    drawCaps("Deliver to", MARGIN, y, 8, bold, MUTED, 1.3);
    drawCaps("Payment", rightX, y, 8, bold, MUTED, 1.3);
    y -= 18;

    const addressLines = [
      order.address.name,
      order.address.line1,
      order.address.line2,
      `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
      formatListedPhone(order.address.phone),
      ...deliveryLines(order),
    ].filter((line): line is string => Boolean(line?.trim()));

    let leftY = y;
    addressLines.forEach((line, index) => {
      const font = index === 0 ? bold : regular;
      const wrapped = wrapText(font, line, 10, COL);
      for (const part of wrapped) {
        text(part, MARGIN, leftY, 10, font, TEXT);
        leftY -= 14;
      }
    });

    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
    const paymentRows: Array<[string, string, boolean?]> = [
      ["Status", paymentStatusLabel(order.paymentStatus)],
      ["Items", `${itemCount} ${itemCount === 1 ? "item" : "items"}`],
      ["Amount", formatInvoiceAmount(order.grandTotalPaise), true],
      ["Invoice date", formatOrderDate(deliveredAt(order))],
    ];
    if (order.shippedAt) {
      paymentRows.push(["Shipped", formatOrderDate(order.shippedAt)]);
    }

    let rightY = y;
    for (const [label, value, strong] of paymentRows) {
      text(label, rightX, rightY, 9, regular, MUTED);
      rightY -= 13;
      if (strong) {
        text(value, rightX, rightY, 16, serifBold, TEXT);
        rightY -= 20;
      } else {
        text(value, rightX, rightY, 10, bold, TEXT);
        rightY -= 18;
      }
    }

    y = Math.min(leftY, rightY, startY) - 8;
    rule(y, 1);
    y -= 4;
  }

  const qtyX = PAGE_WIDTH - MARGIN - 128;
  const amountRight = PAGE_WIDTH - MARGIN;
  const itemWidth = qtyX - MARGIN - 16;

  const drawTableHeader = () => {
    ensureSpace(28);
    page.drawRectangle({
      x: MARGIN,
      y: y - 10,
      width: CONTENT_WIDTH,
      height: 24,
      color: SURFACE,
    });
    drawCaps("Item", MARGIN, y - 2, 8, bold, MUTED, 1.3);
    drawCaps("Qty", qtyX + 10, y - 2, 8, bold, MUTED, 1.3, "right");
    drawCaps("Amount", amountRight, y - 2, 8, bold, MUTED, 1.3, "right");
    y -= 22;
    rule(y, 0.7);
    y -= 12;
  };

  function drawItems() {
    drawTableHeader();
    for (const item of order.items) {
      const label = `${item.name} x ${item.qty}`;
      const nameLines = wrapText(regular, label, 10, itemWidth);
      const rowHeight = Math.max(20, nameLines.length * 13 + 8);
      if (y - rowHeight < MARGIN + 88) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
        drawContinuedHeader();
        drawTableHeader();
      }
      let lineY = y;
      for (const line of nameLines) {
        text(line, MARGIN, lineY, 10, regular, TEXT);
        lineY -= 13;
      }
      rightText(String(item.qty), qtyX + 10, y, 10, regular, MUTED);
      rightText(formatInvoiceAmount(item.pricePaise), amountRight, y, 10, regular, TEXT);
      y -= rowHeight;
      rule(y + 6, 0.5);
    }
    y -= 6;
  }

  function drawTotals() {
    ensureSpace(92);
    const boxWidth = 220;
    const boxX = PAGE_WIDTH - MARGIN - boxWidth;
    const rows: Array<[string, string, boolean?]> = [
      ["Subtotal", formatInvoiceAmount(order.subtotalPaise)],
      [order.shippingLabel || "Shipping", order.shippingPaise === 0 ? "Free" : formatInvoiceAmount(order.shippingPaise)],
    ];
    let boxY = y;
    for (const [label, value] of rows) {
      text(label, boxX, boxY, 10, regular, MUTED);
      rightText(value, amountRight, boxY, 10, regular, TEXT);
      boxY -= 16;
    }
    boxY -= 4;
    page.drawLine({
      start: { x: boxX, y: boxY + 10 },
      end: { x: amountRight, y: boxY + 10 },
      thickness: 0.9,
      color: BRAND,
    });
    text("Total", boxX, boxY - 4, 11, bold, TEXT);
    rightText(formatInvoiceAmount(order.grandTotalPaise), amountRight, boxY - 6, 18, serifBold, BRAND);
    y = boxY - 28;
  }

  function drawFooter() {
    ensureSpace(36);
    y -= 8;
    rule(y, 0.7);
    y -= 16;
    drawWrappedAt(
      "Computer-generated invoice for a delivered order. This is not a GST tax invoice.",
      MARGIN,
      CONTENT_WIDTH,
      8,
      regular,
      MUTED,
      12,
    );
    text(STORE_NAME, MARGIN, y, 8, bold, MUTED);
  }

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: WHITE,
  });

  drawHeader();
  drawStatusBand();
  drawDetails();
  drawItems();
  drawTotals();
  drawFooter();

  pdf.setTitle(`Invoice ${order.publicNumber}`);
  pdf.setAuthor(STORE_NAME);
  pdf.setSubject(`Invoice for ${order.publicNumber}`);

  return pdf.save();
}

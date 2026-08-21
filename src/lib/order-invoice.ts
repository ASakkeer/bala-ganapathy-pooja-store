import type { OrderStatus } from "@/types";

export function orderInvoiceAvailable(status: OrderStatus) {
  return status === "delivered";
}

export function orderInvoiceFilename(publicNumber: string) {
  const safe = publicNumber.replace(/[^A-Za-z0-9._-]/g, "-");
  return `invoice-${safe}.pdf`;
}

export function formatInvoiceAmount(paise: number) {
  if (!Number.isInteger(paise)) {
    throw new Error("Money amounts in paise must be integers.");
  }

  const rupees = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
  return `Rs. ${rupees}`;
}

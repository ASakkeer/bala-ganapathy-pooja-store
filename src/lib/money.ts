const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function assertIntegerPaise(paise: number): void {
  if (!Number.isInteger(paise)) {
    throw new Error("Money amounts in paise must be integers.");
  }
}

/** Formats an integer paise amount, e.g. `129900` → `₹1,299.00`. */
export function formatPaise(paise: number): string {
  assertIntegerPaise(paise);
  return inrFormatter.format(paise / 100);
}

/** Formats a rupee amount using Indian numbering. */
export function formatInr(rupees: number): string {
  return inrFormatter.format(rupees);
}

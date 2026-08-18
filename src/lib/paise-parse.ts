/** Parse a rupee string such as `129` or `129.50` into integer paise. */
export function rupeesToPaise(raw: string) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)(?:\.(\d{1,2}))?$/);

  if (!match) {
    return null;
  }

  const whole = Number(match[1]);
  const fraction = match[2] ? Number(match[2].padEnd(2, "0")) : 0;
  return whole * 100 + fraction;
}

export function paiseToRupeeInput(paise: number) {
  if (!Number.isInteger(paise)) {
    return "";
  }

  return (paise / 100).toFixed(2);
}

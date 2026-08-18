export function maskIndianPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return "";
  }

  return `******${digits.slice(-4)}`;
}

export function normalizeIndianPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const ten =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;

  if (!/^[6-9]\d{9}$/.test(ten)) {
    return null;
  }

  return ten;
}

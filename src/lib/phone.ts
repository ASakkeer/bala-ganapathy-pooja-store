export function maskIndianPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return "";
  }

  return `******${digits.slice(-4)}`;
}

export function maskEmail(raw: string) {
  const value = raw.trim();
  const at = value.indexOf("@");
  if (at < 1) {
    return "";
  }

  const name = value.slice(0, at);
  const domain = value.slice(at + 1);
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}***@${domain}`;
}

/** Strip spaces, punctuation, and country code while typing. Digits only, max 10. */
export function digitsOnlyPhoneInput(raw: string) {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function phoneInputError(raw: string): string | null {
  const digits = digitsOnlyPhoneInput(raw);

  if (!digits) {
    return "Enter your 10-digit mobile number.";
  }

  if (digits.length !== 10) {
    return "Enter a 10-digit mobile number.";
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return "Indian mobile numbers start with 6, 7, 8, or 9.";
  }

  return null;
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

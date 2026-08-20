export function listedPhones(phones?: string[] | null) {
  return phones?.map((value) => value.trim()).filter(Boolean) ?? [];
}

export function firstPhone(phones?: string[] | null) {
  return listedPhones(phones)[0] ?? null;
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `tel:+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `tel:+${digits}`;
  }
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}

export function formatListedPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return phone;
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function whatsappHref(raw?: string | null) {
  const digits = raw?.replace(/\D/g, "") ?? "";
  if (digits.length < 10) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

export function isHttpsMapUrl(raw?: string | null) {
  if (!raw?.trim()) {
    return false;
  }

  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

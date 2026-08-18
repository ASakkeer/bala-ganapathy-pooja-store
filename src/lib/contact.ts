export function listedPhones(phones?: string[] | null) {
  return phones?.map((value) => value.trim()).filter(Boolean) ?? [];
}

export function firstPhone(phones?: string[] | null) {
  return listedPhones(phones)[0] ?? null;
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

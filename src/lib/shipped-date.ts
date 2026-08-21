/** Calendar dates as YYYY-MM-DD in Asia/Kolkata. */
export function calendarDateInKolkata(value: Date | string = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseShippedDateInput(value: string, createdAtIso: string) {
  const shipped = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shipped)) {
    return { error: "Choose the shipped date." as const, at: null };
  }

  const created = calendarDateInKolkata(createdAtIso);
  const today = calendarDateInKolkata();
  if (created && shipped < created) {
    return { error: "Shipped date cannot be before the order was placed." as const, at: null };
  }
  if (today && shipped > today) {
    return { error: "Shipped date cannot be in the future." as const, at: null };
  }

  return { error: null, at: new Date(`${shipped}T12:00:00+05:30`) };
}

export function shippedDateInputValue(iso?: string | null) {
  if (!iso) {
    return calendarDateInKolkata();
  }
  return calendarDateInKolkata(iso) || calendarDateInKolkata();
}

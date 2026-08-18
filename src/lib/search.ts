const MAX_QUERY_LENGTH = 80;

/** Trim, collapse spaces, drop LIKE wildcards, cap length. Empty means "do not search". */
export function parseSearchQuery(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const collapsed = (value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
  return collapsed.replace(/[%_\\]/g, "").trim();
}

export function searchPattern(query: string) {
  return `%${query}%`;
}

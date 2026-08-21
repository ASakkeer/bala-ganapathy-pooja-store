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

export function parseSearchKeywords(raw: string | string[] | null | undefined) {
  const values = Array.isArray(raw) ? raw : [raw ?? ""];
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const value of values) {
    for (const part of value.split(/[,;\n]+/)) {
      const keyword = part.replace(/\s+/g, " ").trim().slice(0, 80);
      const key = keyword.toLowerCase();
      if (!keyword || seen.has(key)) {
        continue;
      }
      seen.add(key);
      keywords.push(keyword);
      if (keywords.length >= 24) {
        return keywords;
      }
    }
  }

  return keywords;
}

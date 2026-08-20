import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Request memoization plus cross-request Data Cache.
 * Use only for public, non-user-specific payloads.
 */
export function cachedQuery<Args extends unknown[], Result>(
  key: (...args: Args) => string[],
  fn: (...args: Args) => Promise<Result>,
  options: {
    revalidate: number;
    tags: string[] | ((...args: Args) => string[]);
  },
): (...args: Args) => Promise<Result> {
  return cache((...args: Args) => {
    const tags = typeof options.tags === "function" ? options.tags(...args) : options.tags;
    return unstable_cache(async () => fn(...args), key(...args), {
      revalidate: options.revalidate,
      tags,
    })();
  });
}

"use client";

import NextTopLoader from "nextjs-toploader";

/** Store-branded top progress bar. Intercepts `<Link>` clicks automatically. */
export function AppProgress() {
  return (
    <NextTopLoader
      color="#7a1f2b"
      height={3}
      crawl
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #7a1f2b,0 0 5px #c4922a"
      zIndex={1600}
    />
  );
}

import type { MetadataRoute } from "next";
import {
  STORE_BACKGROUND_COLOR,
  STORE_FAVICON_SRC,
  STORE_NAME,
  STORE_SEO_DESCRIPTION,
  STORE_THEME_COLOR,
} from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: STORE_NAME,
    short_name: "BGPS",
    description: STORE_SEO_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: STORE_BACKGROUND_COLOR,
    theme_color: STORE_THEME_COLOR,
    lang: "en-IN",
    icons: [
      {
        src: STORE_FAVICON_SRC,
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

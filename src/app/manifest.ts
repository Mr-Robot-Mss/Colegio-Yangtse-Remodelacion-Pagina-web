import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf9",
    theme_color: siteConfig.themeColor,
    lang: "es-CL",
    icons: [
      {
        src: "/images/logo-colegio-yangtse.png",
        sizes: "333x334",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

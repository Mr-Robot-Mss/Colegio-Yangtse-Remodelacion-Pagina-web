const fallbackUrl =
  "https://colegio-yangtse-remodelacion-pagina.vercel.app";

export const siteConfig = {
  name: "Colegio Yangtsé",
  shortName: "Yangtsé",
  description:
    "Información institucional, admisión, comunicados, reglamentos y contacto del Colegio Yangtsé de La Reina.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl).replace(
    /\/$/,
    "",
  ),
  locale: "es_CL",
  themeColor: "#741316",
  allowIndexing:
    process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
} as const;

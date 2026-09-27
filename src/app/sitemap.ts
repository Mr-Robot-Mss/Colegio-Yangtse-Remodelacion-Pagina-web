import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { publicContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { noticias } = await publicContent();
  const routes = [
    "",
    "/admision",
    "/calendario",
    "/contacto",
    "/documentos",
    "/noticias",
  ];

  const staticPages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const newsPages: MetadataRoute.Sitemap = noticias.map((noticia) => ({
    url: `${siteConfig.url}/noticias/${noticia.slug}`,
    lastModified: new Date(noticia.fechaISO),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages];
}

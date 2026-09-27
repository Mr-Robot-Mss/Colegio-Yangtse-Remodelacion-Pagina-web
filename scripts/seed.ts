import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
const { noticias, documentos } = await import("../src/data/siteData");
const { emptyContent, listContent, saveContent } = await import("../src/lib/content");
const { access } = await import("node:fs/promises");
const { resolve } = await import("node:path");
const existing = new Set((await listContent()).map(i => i.slug));
let count = 0;
for (const noticia of noticias) {
  if (existing.has(noticia.slug)) continue;
  const item = { ...emptyContent("noticia"), ...noticia, id: "legacy-news-" + noticia.id,
    published: true, destacada: !!noticia.destacada };
  await saveContent(item); count++;
}
for (const doc of documentos) {
  const slug = "legacy-document-" + doc.id;
  if (existing.has(slug)) continue;
  try { await access(resolve("public", doc.enlace.slice(1))); } catch { console.log("PDF ausente, omitido:", doc.enlace); continue; }
  await saveContent({ ...emptyContent("documento"), ...doc, id: slug, slug, published: true }); count++;
}
console.log("Contenidos importados:", count);
process.exit(0);


}
main().catch(error => { console.error(error); process.exit(1); });

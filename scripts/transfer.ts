import { loadEnvConfig } from "@next/env";
import { readFile, writeFile } from "node:fs/promises";
loadEnvConfig(process.cwd());
async function main() {
const { listContent, saveContent, isKind } = await import("../src/lib/content");
const [mode, file] = process.argv.slice(2);
if (!file || !["export","import"].includes(mode)) throw new Error("Uso: transfer.ts export|import archivo.json");
if (mode === "export") {
  await writeFile(file, JSON.stringify({ version: 1, items: await listContent() }, null, 2), { flag: "wx" });
  console.log("Respaldo creado.");
} else {
  const data = JSON.parse(await readFile(file,"utf8"));
  if (data.version !== 1 || !Array.isArray(data.items) || data.items.some((i: {kind: string; id: string; slug: string}) => !isKind(i.kind) || !i.id || !i.slug)) throw new Error("Respaldo inválido.");
  if ((await listContent()).length) throw new Error("La base destino debe estar vacía.");
  for (const item of data.items) await saveContent(item);
  console.log("Importados:", data.items.length);
}
process.exit(0);


}
main().catch(error => { console.error(error); process.exit(1); });

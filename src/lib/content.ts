import { randomUUID } from "node:crypto";
import { initDb, query } from "./db";

export type Kind = "noticia" | "evento" | "documento";
export type Content = {
  id: string; kind: Kind; slug: string; titulo: string; categoria: string;
  published: boolean; fechaISO: string; descripcion: string; contenido: string[];
  destacada: boolean; tipoArte: "red" | "gold" | "ink";
  hora: string; lugar: string; fechaFin: string;
  enlace: string; fileKey: string; storage: "local" | "supabase" | "";
  tipo: "PDF"; updatedAt: string;
};
export const kinds: Kind[] = ["noticia", "evento", "documento"];
export function isKind(value: string): value is Kind { return kinds.includes(value as Kind); }
export function decodeContent(row: Record<string, unknown>): Content {
  return { ...JSON.parse(String(row.data)), id: String(row.id), slug: String(row.slug),
    kind: row.kind as Kind, published: Number(row.published) === 1, updatedAt: String(row.updated_at) };
}
export async function listContent(kind?: Kind, publicOnly = false): Promise<Content[]> {
  await initDb();
  const rows = await query("SELECT * FROM cms_content");
  return rows.map(decodeContent).filter(item => (!kind || item.kind === kind) && (!publicOnly || item.published))
    .sort((a, b) => b.fechaISO.localeCompare(a.fechaISO) || b.updatedAt.localeCompare(a.updatedAt));
}
export async function getContent(id: string): Promise<Content | undefined> {
  await initDb();
  const rows = await query("SELECT * FROM cms_content WHERE id = $1", [id]);
  return rows[0] ? decodeContent(rows[0]) : undefined;
}
export async function saveContent(item: Content) {
  await initDb();
  await query(`INSERT INTO cms_content (id, kind, slug, published, data, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET
    slug=excluded.slug, published=excluded.published, data=excluded.data, updated_at=excluded.updated_at`,
    [item.id, item.kind, item.slug, item.published ? 1 : 0, JSON.stringify(item), new Date().toISOString()]);
}
export async function deleteContent(id: string) {
  await initDb(); await query("DELETE FROM cms_content WHERE id=$1", [id]);
}
export function emptyContent(kind: Kind): Content {
  return { id: randomUUID(), kind, slug: "", titulo: "", categoria: "", published: false,
    fechaISO: new Date().toISOString().slice(0, 10), descripcion: "", contenido: [],
    destacada: false, tipoArte: "red", hora: "", lugar: "", fechaFin: "", enlace: "",
    fileKey: "", storage: "", tipo: "PDF", updatedAt: "" };
}
const months = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
export async function publicContent() {
  const items = await listContent(undefined, true);
  return {
    noticias: items.filter(i => i.kind === "noticia").map(i => ({
      ...i, fecha: new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" }).format(new Date(i.fechaISO + "T12:00:00Z")),
      enlace: "/noticias/" + i.slug
    })),
    documentos: items.filter(i => i.kind === "documento").map(i => ({ ...i, enlace: "/archivos/" + i.id })),
    eventos: items.filter(i => i.kind === "evento").sort((a,b) => a.fechaISO.localeCompare(b.fechaISO) || a.hora.localeCompare(b.hora)).map(i => ({
      ...i, dia: i.fechaISO.slice(8,10), mes: months[Number(i.fechaISO.slice(5,7)) - 1]
    }))
  };
}



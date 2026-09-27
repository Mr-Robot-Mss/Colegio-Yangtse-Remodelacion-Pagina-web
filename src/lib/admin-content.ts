import { initDb, query } from "./db";
import { decodeContent, type Content, isKind } from "./content";
import { ConflictError } from "./errors";

export type AdminParams = { kind?: string; q?: string; state?: string; sort?: string; page?: string; size?: string; status?: string };
export function filtersFrom(params: AdminParams) {
  params = Object.fromEntries(Object.entries(params).filter(([,value]) => typeof value === "string"));
  return {
    kind: params.kind && isKind(params.kind) ? params.kind : "",
    q: (params.q || "").trim().slice(0, 120),
    state: ["published", "draft"].includes(params.state || "") ? params.state! : "",
    sort: ["oldest", "title", "date"].includes(params.sort || "") ? params.sort! : "recent",
    page: Math.min(1000000, Math.max(1, Number.parseInt(params.page || "1", 10) || 1)),
    size: [5, 10, 20, 50].includes(Number(params.size)) ? Number(params.size) : 10,
  };
}
export async function adminContent(params: AdminParams) {
  await initDb();
  const filters = filtersFrom(params);
  const pg = process.env.DATABASE_URL?.startsWith("postgres");
  const title = pg ? "(data::jsonb ->> 'titulo')" : "json_extract(data, '$.titulo')";
  const category = pg ? "(data::jsonb ->> 'categoria')" : "json_extract(data, '$.categoria')";
  const date = pg ? "(data::jsonb ->> 'fechaISO')" : "json_extract(data, '$.fechaISO')";
  const values: (string | number)[] = [];
  const conditions: string[] = [];
  if (filters.kind) { values.push(filters.kind); conditions.push("kind=$" + values.length); }
  if (filters.state) { values.push(filters.state === "published" ? 1 : 0); conditions.push("published=$" + values.length); }
  if (filters.q) {
    values.push("%" + filters.q.toLowerCase().replace(/[\\%_]/g, "\\$&") + "%");
    conditions.push("LOWER(" + title + " || ' ' || " + category + ") LIKE $" + values.length + " ESCAPE '\\'");
  }
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const [count] = await query("SELECT COUNT(*) AS total FROM cms_content" + where, values);
  const total = Number(count.total);
  const pages = Math.max(1, Math.ceil(total / filters.size));
  const page = Math.min(filters.page, pages);
  const order = filters.sort === "oldest" ? "updated_at ASC" : filters.sort === "title" ?
    title + " ASC" : filters.sort === "date" ? date + " DESC" : "updated_at DESC";
  const rows = await query("SELECT * FROM cms_content" + where + " ORDER BY " + order +
    ", id ASC LIMIT $" + (values.length + 1) + " OFFSET $" + (values.length + 2),
    [...values, filters.size, (page - 1) * filters.size]);
  const counts = await query("SELECT kind, COUNT(*) AS total, SUM(published) AS published FROM cms_content GROUP BY kind");
  return { items: rows.map(decodeContent), total, pages, page, filters, counts };
}
export async function slugExists(slug: string, exceptId: string) {
  await initDb();
  return (await query("SELECT id FROM cms_content WHERE slug=$1 AND id<>$2", [slug, exceptId])).length > 0;
}
export async function saveVersion(item: Content, expected?: string) {
  await initDb();
  const updatedAt = new Date(Math.max(Date.now(), expected ? Date.parse(expected) + 1 : 0)).toISOString();
  if (expected) {
    const rows = await query(`UPDATE cms_content SET slug=$1, published=$2, data=$3, updated_at=$4
      WHERE id=$5 AND updated_at=$6 RETURNING id`,
      [item.slug, item.published ? 1 : 0, JSON.stringify(item), updatedAt, item.id, expected]);
    if (!rows.length) throw new ConflictError();
  } else {
    await query("INSERT INTO cms_content (id,kind,slug,published,data,updated_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [item.id,item.kind,item.slug,item.published ? 1 : 0,JSON.stringify(item),updatedAt]);
  }
}
export async function deleteVersion(id: string, expected: string) {
  await initDb();
  const rows = await query("DELETE FROM cms_content WHERE id=$1 AND updated_at=$2 RETURNING id", [id, expected]);
  if (!rows.length) throw new ConflictError();
}


import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";

type Row = Record<string, unknown>;
const state = globalThis as unknown as {
  cmsSqlite?: DatabaseSync; cmsPool?: Pool; cmsReady?: Promise<void>; cmsSchemaVersion?: number;
};
export async function query(sql: string, values: (string | number)[] = []): Promise<Row[]> {
  if (process.env.DATABASE_URL?.startsWith("postgres")) {
    state.cmsPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    return (await state.cmsPool.query(sql, values)).rows;
  }
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    throw new Error("DATABASE_URL debe usar file: o postgresql://.");
  }
  if (!state.cmsSqlite) {
    const path = resolve(/* turbopackIgnore: true */ process.env.DATABASE_URL?.replace(/^file:/, "") || "./data/cms.sqlite");
    mkdirSync(dirname(path), { recursive: true });
    state.cmsSqlite = new DatabaseSync(path);
    state.cmsSqlite.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  }
  // SQLite positional parameters are bound in their order of appearance.
  const ordered: (string | number)[] = [];
  const statement = state.cmsSqlite.prepare(sql.replace(/\$(\d+)/g, (_, n) => {
    ordered.push(values[Number(n) - 1]); return "?";
  }));
  if (/^\s*(SELECT|WITH)/i.test(sql) || /RETURNING/i.test(sql)) return statement.all(...ordered) as Row[];
  statement.run(...ordered);
  return [];
}
export async function initDb() {
  if (state.cmsSchemaVersion !== 2) { state.cmsReady = undefined; state.cmsSchemaVersion = 2; }
  state.cmsReady ??= (async () => {
    await query(`CREATE TABLE IF NOT EXISTS cms_content (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      published INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, updated_at TEXT NOT NULL
    )`);
    await query(`CREATE TABLE IF NOT EXISTS cms_login_attempts (
      id TEXT PRIMARY KEY, attempts INTEGER NOT NULL, resets_at BIGINT NOT NULL
    )`);
    await query("CREATE TABLE IF NOT EXISTS cms_sessions (id TEXT PRIMARY KEY, version TEXT NOT NULL, expires_at BIGINT NOT NULL, last_seen BIGINT NOT NULL)");
    await query("CREATE TABLE IF NOT EXISTS cms_audit (id TEXT PRIMARY KEY, event TEXT NOT NULL, content_id TEXT NOT NULL, detail TEXT NOT NULL, created_at BIGINT NOT NULL)");
    await query("CREATE INDEX IF NOT EXISTS cms_content_listing ON cms_content (kind,published,updated_at)");
    await query("CREATE INDEX IF NOT EXISTS cms_sessions_expiry ON cms_sessions (expires_at)");
    await query("CREATE INDEX IF NOT EXISTS cms_audit_date ON cms_audit (created_at)");
  })().catch(error => { state.cmsReady = undefined; throw error; });
  await state.cmsReady;
}



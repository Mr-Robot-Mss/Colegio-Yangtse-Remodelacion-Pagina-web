import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { initDb, query } from "./db";

export const SESSION_LIFETIME = 8 * 60 * 60 * 1000;
export const SESSION_IDLE = 30 * 60 * 1000;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
    (error, key) => error ? reject(error) : resolve(key)));
}
export function validPasswordHash(value: string) {
  return /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(value);
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return "scrypt:" + salt + ":" + (await derive(password, salt)).toString("hex");
}
export async function verifyPassword(password: string, hash: string) {
  if (!validPasswordHash(hash) || password.length > 1024) return false;
  const [, salt, key] = hash.split(":");
  return timingSafeEqual(await derive(password, salt), Buffer.from(key, "hex"));
}
export async function audit(event: string, contentId = "", detail = "") {
  await initDb();
  await query("INSERT INTO cms_audit (id, event, content_id, detail, created_at) VALUES ($1,$2,$3,$4,$5)",
    [randomBytes(16).toString("hex"), event, contentId, detail.slice(0, 180), Date.now()]);
  await query("DELETE FROM cms_audit WHERE created_at < $1", [Date.now() - 90 * 86400000]);
}
export async function recordAudit(event: string, contentId = "", detail = "") {
  // Do not report a successful content mutation as failed if audit storage is unavailable.
  await audit(event, contentId, detail).catch(error => console.error("No se pudo registrar auditoría", event, error));
}
export async function newSession(version: string, now = Date.now()) {
  await initDb();
  await query("DELETE FROM cms_sessions WHERE expires_at <= $1 OR last_seen <= $2 OR version <> $3", [now, now - SESSION_IDLE, version]);
  const token = randomBytes(32).toString("hex");
  await query("INSERT INTO cms_sessions (id, version, expires_at, last_seen) VALUES ($1,$2,$3,$4)",
    [digest(token), version, now + SESSION_LIFETIME, now]);
  return token;
}
export async function checkSession(token: string, version: string, now = Date.now()) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  await initDb();
  const rows = await query("UPDATE cms_sessions SET last_seen=$1 WHERE id=$2 AND version=$3 AND expires_at>$1 AND last_seen>$4 RETURNING id",
    [now, digest(token), version, now - SESSION_IDLE]);
  return rows.length === 1;
}
export async function revokeSession(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return;
  await initDb();
  await query("DELETE FROM cms_sessions WHERE id=$1", [digest(token)]);
}
export async function revokeAllSessions() {
  await initDb(); await query("DELETE FROM cms_sessions");
}
export async function consumeLoginAttempt(now = Date.now()) {
  await initDb();
  const rows = await query(`INSERT INTO cms_login_attempts (id, attempts, resets_at) VALUES ($1,1,$2)
    ON CONFLICT(id) DO UPDATE SET
    attempts=CASE WHEN cms_login_attempts.resets_at <= $3 THEN 1 ELSE cms_login_attempts.attempts+1 END,
    resets_at=CASE WHEN cms_login_attempts.resets_at <= $3 THEN $2 ELSE cms_login_attempts.resets_at END
    RETURNING attempts`, ["admin", now + 15 * 60 * 1000, now]);
  return Number(rows[0].attempts) <= 10;
}


export async function securityOverview() {
  await initDb();
  const now = Date.now();
  const events = await query("SELECT event,detail,created_at FROM cms_audit ORDER BY created_at DESC LIMIT 30");
  const [sessions] = await query("SELECT COUNT(*) AS total FROM cms_sessions WHERE expires_at>$1 AND last_seen>$2", [now, now - SESSION_IDLE]);
  return { events, sessionCount: Number(sessions.total) };
}


import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import { UserInputError } from "./errors";
import { checkSession, consumeLoginAttempt, newSession, recordAudit, revokeSession, validPasswordHash, verifyPassword, SESSION_LIFETIME } from "./security";

const cookieName = "yangtse_admin";
export function authConfigured() {
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  const developmentPassword = process.env.NODE_ENV === "development" && (process.env.ADMIN_PASSWORD?.length ?? 0) >= 8;
  return !!process.env.ADMIN_EMAIL && (validPasswordHash(hash) || developmentPassword) &&
    (process.env.SESSION_SECRET?.length ?? 0) >= 32;
}
function fingerprint() {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(
    process.env.ADMIN_EMAIL + ":" + (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD)
  ).digest("hex");
}
function equal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
export async function authenticated() {
  if (!authConfigured()) return false;
  const value = (await cookies()).get(cookieName)?.value;
  return value ? checkSession(value, fingerprint()) : false;
}
export async function requireAdmin() {
  if (!await authenticated()) {
    const hadSession = (await cookies()).has(cookieName);
    redirect(hadSession ? "/admin/login?expired=1" : "/admin/login");
  }
}
export async function assertMutationOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const configured = process.env.ADMIN_ORIGIN;
  try {
    const expected = configured ? new URL(configured).origin : undefined;
    const parsed = new URL(origin || "");
    if (!["http:", "https:"].includes(parsed.protocol) ||
      (expected ? parsed.origin !== expected : parsed.host !== requestHeaders.get("host"))) throw new Error();
  } catch {
    throw new UserInputError("No se pudo validar el origen de la solicitud. Recarga la página.");
  }
}
export async function login(email: string, password: string) {
  if (!authConfigured() || password.length > 1024) return false;
  if (!await consumeLoginAttempt()) return false;
  const validEmail = equal(email.toLowerCase().trim(), process.env.ADMIN_EMAIL!.toLowerCase().trim());
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const validPassword = hash ? await verifyPassword(password, hash) :
    process.env.NODE_ENV === "development" && equal(password, process.env.ADMIN_PASSWORD || "");
  if (!validEmail || !validPassword) { await recordAudit("login_failed"); return false; }
  await query("DELETE FROM cms_login_attempts WHERE id=$1", ["admin"]);
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(cookieName)?.value || "");
  const token = await newSession(fingerprint());
  cookieStore.set(cookieName, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: SESSION_LIFETIME / 1000
  });
  await recordAudit("login");
  return true;
}
export async function logout() {
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(cookieName)?.value || "");
  cookieStore.delete(cookieName);
  await recordAudit("logout");
}


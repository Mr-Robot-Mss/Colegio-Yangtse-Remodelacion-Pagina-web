import { UserInputError } from "./errors";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Content } from "./content";

export const maxFileSize = 5 * 1024 * 1024;
function localPath(key: string) {
  if (!/^[a-f0-9-]{36}\.pdf$/.test(key)) throw new Error("Archivo inválido.");
  return resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./data/uploads", key);
}
function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) throw new Error("Falta configurar Supabase Storage.");
  if (!url.startsWith("https://")) throw new Error("SUPABASE_URL debe usar HTTPS.");
  return { base: url.replace(/\/$/, "") + "/storage/v1/object/" + encodeURIComponent(bucket),
    headers: { apikey: key, Authorization: "Bearer " + key } };
}
export async function uploadPdf(file: File): Promise<Pick<Content, "fileKey" | "storage">> {
  if (!file.size || file.size > maxFileSize) throw new UserInputError("El PDF debe pesar entre 1 byte y 5 MB.");
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    throw new UserInputError("Solo se aceptan documentos PDF.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0,5).toString() !== "%PDF-") throw new UserInputError("El archivo no tiene un formato PDF válido.");
  const fileKey = randomUUID() + ".pdf";
  const provider = process.env.STORAGE_PROVIDER || "local";
  if (provider !== "local" && provider !== "supabase") throw new Error("STORAGE_PROVIDER inválido.");
  if (provider === "supabase") {
    const config = supabase();
    const response = await fetch(config.base + "/" + fileKey, {
      method: "POST", headers: { ...config.headers, "Content-Type": "application/pdf" },
      body: new Uint8Array(bytes), signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error("No se pudo guardar el archivo en Supabase.");
    return { fileKey, storage: "supabase" };
  }
  await mkdir(resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./data/uploads"), { recursive: true });
  await writeFile(localPath(fileKey), bytes, { flag: "wx" });
  return { fileKey, storage: "local" };
}
export async function removeFile(item: Pick<Content, "fileKey" | "storage">) {
  if (!item.fileKey) return;
  if (item.storage === "supabase") {
    const config = supabase();
    const response = await fetch(config.base + "/" + item.fileKey, {
      method: "DELETE", headers: config.headers, signal: AbortSignal.timeout(30000)
    });
    if (!response.ok && response.status !== 404) throw new Error("No se pudo eliminar el archivo de Supabase.");
  } else if (item.storage === "local") {
    await unlink(localPath(item.fileKey)).catch(error => { if (error.code !== "ENOENT") throw error; });
  }
}
export async function downloadFile(item: Content): Promise<Uint8Array> {
  if (item.storage === "supabase") {
    const config = supabase();
    const response = await fetch(config.base + "/" + item.fileKey, {
      headers: config.headers, cache: "no-store", signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error("No se pudo recuperar el archivo.");
    return new Uint8Array(await response.arrayBuffer());
  }
  if (item.storage === "local") return new Uint8Array(await readFile(/* turbopackIgnore: true */ localPath(item.fileKey)));
  if (/^\/documents\/[a-zA-Z0-9._-]+\.pdf$/.test(item.enlace)) {
    return new Uint8Array(await readFile(resolve("public", item.enlace.slice(1))));
  }
  throw new Error("Documento no disponible.");
}



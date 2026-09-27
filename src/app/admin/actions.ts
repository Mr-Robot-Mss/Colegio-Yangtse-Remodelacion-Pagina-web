"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertMutationOrigin, login, logout, requireAdmin } from "@/lib/auth";
import { getContent, isKind } from "@/lib/content";
import { deleteVersion, saveVersion, slugExists } from "@/lib/admin-content";
import { parseContent } from "@/lib/validation";
import { removeFile, uploadPdf } from "@/lib/storage";
import { ConflictError, UserInputError } from "@/lib/errors";
import { recordAudit, revokeAllSessions } from "@/lib/security";

export type Result = { error?: string };
function friendlyError(error: unknown) {
  if (error instanceof UserInputError) return error.message;
  if (error && typeof error === "object" && "code" in error && ["23505","SQLITE_CONSTRAINT_UNIQUE"].includes(String(error.code))) {
    return "Ya existe un contenido con esa URL. Elige otra.";
  }
  return "No se pudo completar la operación. Intenta nuevamente; tus datos siguen en el formulario.";
}
export async function loginAction(_state: Result, form: FormData): Promise<Result> {
  try {
    await assertMutationOrigin();
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    if (email.length > 254 || password.length > 1024 || !await login(email, password)) {
      return { error: "No se pudo iniciar sesión. Revisa tus credenciales; si hubo varios intentos, espera 15 minutos." };
    }
  } catch (error) {
    console.error("No se pudo iniciar sesión", error);
    return { error: "No se pudo iniciar sesión. Intenta nuevamente en unos minutos." };
  }
  redirect("/admin");
}
export async function logoutAction() {
  await assertMutationOrigin(); await logout(); redirect("/admin/login");
}
export async function revokeAllAction(form: FormData) {
  await requireAdmin(); await assertMutationOrigin();
  if (form.get("confirm") !== "on") throw new UserInputError("Confirma el cierre de sesiones.");
  await revokeAllSessions(); await logout(); redirect("/admin/login?revoked=1");
}
function refresh() {
  for (const path of ["/", "/noticias", "/documentos", "/calendario", "/sitemap.xml", "/admin"]) revalidatePath(path);
}
export async function saveAction(_state: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  let uploaded: Awaited<ReturnType<typeof uploadPdf>> | undefined;
  let previous;
  let item: ReturnType<typeof parseContent>;
  try {
    await assertMutationOrigin();
    const id = String(form.get("id") || "");
    const kind = String(form.get("kind") || "");
    if (!isKind(kind)) throw new UserInputError("Tipo de contenido inválido.");
    previous = id ? await getContent(id) : undefined;
    if (id && (!previous || previous.kind !== kind)) throw new UserInputError("No se encontró el contenido.");
    const expected = String(form.get("version") || "");
    if (previous && expected !== previous.updatedAt) throw new ConflictError();
    item = parseContent(form, kind, previous);
    if (await slugExists(item.slug, item.id)) throw new UserInputError("Ya existe una noticia con esa URL.");
    const file = form.get("archivo");
    if (kind === "documento" && file instanceof File && file.size) {
      uploaded = await uploadPdf(file);
      Object.assign(item, uploaded); item.enlace = "";
    }
    if (kind === "documento" && !item.fileKey && !item.enlace) throw new UserInputError("Selecciona un archivo PDF.");
    await saveVersion(item, previous?.updatedAt);
  } catch (error) {
    if (uploaded) await removeFile(uploaded).catch(cleanup => console.error("Archivo pendiente de limpieza", uploaded?.fileKey, cleanup));
    console.error("No se pudo guardar contenido", error);
    return { error: friendlyError(error) };
  }
  let warning = false;
  if (uploaded && previous?.fileKey) {
    await removeFile(previous).catch(error => { warning = true; console.error("Archivo anterior pendiente de limpieza", previous.fileKey, error); });
  }
  await recordAudit(previous ? "updated" : "created", item.id, item.titulo);
  refresh();
  if (previous?.kind === "noticia") revalidatePath("/noticias/" + previous.slug);
  if (item.kind === "noticia") revalidatePath("/noticias/" + item.slug);
  redirect("/admin?status=" + (warning ? "cleanup" : "saved"));
}
export async function deleteAction(_state: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  let item;
  try {
    await assertMutationOrigin();
    if (form.get("confirm") !== "on") throw new UserInputError("Confirma la eliminación.");
    item = await getContent(String(form.get("id") || ""));
    if (!item) throw new UserInputError("El contenido ya no existe.");
    await deleteVersion(item.id, String(form.get("version") || ""));
  } catch (error) {
    return { error: friendlyError(error) };
  }
  let warning = false;
  await removeFile(item).catch(error => { warning = true; console.error("Archivo pendiente de limpieza", item.fileKey, error); });
  await recordAudit("deleted", item.id, item.titulo);
  refresh();
  if (item.kind === "noticia") revalidatePath("/noticias/" + item.slug);
  redirect("/admin?status=" + (warning ? "cleanup" : "deleted"));
}


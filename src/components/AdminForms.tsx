"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAction, loginAction, revokeAllAction, saveAction } from "@/app/admin/actions";
import type { Content, Kind } from "@/lib/content";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="button button--primary" disabled={pending}>{pending ? "Procesando…" : children}</button>;
}
function PendingFields({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <fieldset className="cms-fields" disabled={pending} aria-busy={pending}>{children}</fieldset>;
}
function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const followLink = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (!window.confirm("Hay cambios sin guardar. ¿Quieres salir y descartarlos?")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", followLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", followLink, true); };
  }, [dirty]);
}
export function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  const [visible, setVisible] = useState(false);
  return <form action={action} className="cms-form"><PendingFields>
    <label>Correo electrónico<input name="email" type="email" autoComplete="username" required maxLength={254} autoCapitalize="none" spellCheck={false} /></label>
    <label htmlFor="admin-password">Contraseña</label>
    <div className="cms-password"><input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required maxLength={1024} /><button className="cms-button" type="button" onClick={() => setVisible(!visible)} aria-pressed={visible}>{visible ? "Ocultar" : "Mostrar"}</button></div>
    {state.error && <p className="cms-error" role="alert">{state.error}</p>}
    <Submit>Ingresar al mantenedor</Submit>
  </PendingFields></form>;
}
export function ContentForm({ kind, item }: { kind: Kind; item?: Content }) {
  const [dirty, setDirty] = useState(false);
  const [fields, setFields] = useState({
    titulo: item?.titulo || "", categoria: item?.categoria || "", fechaISO: item?.fechaISO || new Date().toISOString().slice(0,10),
    descripcion: item?.descripcion || "", slug: item?.slug || "", contenido: item?.contenido.join("\n\n") || "",
    tipoArte: item?.tipoArte || "red", hora: item?.hora || "", lugar: item?.lugar || "", fechaFin: item?.fechaFin || "",
  });
  const [published, setPublished] = useState(!!item?.published);
  const [featured, setFeatured] = useState(!!item?.destacada);
  const [slugEdited, setSlugEdited] = useState(!!item);
  const [fileName, setFileName] = useState("");
  const file = useRef<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const errorBox = useRef<HTMLParagraphElement>(null);
  const [state, action] = useActionState(async (previous: { error?: string }, data: FormData) => {
    if (file.current) data.set("archivo", file.current);
    const result = await saveAction(previous, data);
    if (result?.error) setDirty(true);
    return result;
  }, {});
  useUnsavedChanges(dirty);
  useEffect(() => {
    if (state?.error) errorBox.current?.focus();
  }, [state]);
  function update(name: keyof typeof fields, value: string) {
    setDirty(true);
    setFields(previous => ({ ...previous, [name]: value,
      ...(name === "titulo" && kind === "noticia" && !slugEdited
        ? { slug: value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,180) } : {})
    }));
  }
  function input(name: keyof typeof fields, label: string, type = "text", required = false, max = 180) {
    return <label htmlFor={"cms-" + name}>{label}<input id={"cms-" + name} name={name} type={type} value={fields[name]} required={required} maxLength={max} onChange={e => {
      if (name === "slug") setSlugEdited(true);
      update(name,e.target.value);
    }} {...(name === "slug" ? { pattern: "[a-z0-9]+(-[a-z0-9]+)*", autoCapitalize: "none" } : {})} /></label>;
  }
  return <form action={action} className="cms-form" onSubmit={() => setDirty(false)}>
    <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={item?.id || ""} /><input type="hidden" name="version" value={item?.updatedAt || ""} />
    <div className="cms-editor-state"><span className={published ? "cms-badge cms-badge-live" : "cms-badge"}>{published ? "Publicado al guardar" : "Borrador"}</span><span role="status">{dirty ? "Tienes cambios sin guardar" : item ? "Editando contenido guardado" : "Nuevo contenido"}</span></div>
    <PendingFields>
      <div className="cms-two">
        {input("titulo","Título","text",true)}
        {input("categoria","Categoría","text",true,80)}
        {input("fechaISO",kind === "evento" ? "Fecha de inicio" : "Fecha","date",true)}
        {kind === "evento" && input("fechaFin","Fecha de término (opcional)","date")}
      </div>
      {kind !== "documento" && <><label htmlFor="cms-description">{kind === "noticia" ? "Resumen" : "Descripción del anuncio"}<textarea id="cms-description" name="descripcion" value={fields.descripcion} onChange={e => update("descripcion",e.target.value)} maxLength={600} rows={3} aria-describedby="cms-description-count" /></label><small id="cms-description-count">{fields.descripcion.length}/600 caracteres</small></>}
      {kind === "noticia" && <>
        {input("slug","URL de la noticia","text",true)}
        <p className="cms-hint">/noticias/{fields.slug || "url-de-la-noticia"} · Se genera a partir del título; puedes personalizarla.</p>
        <label htmlFor="cms-content">Contenido<textarea id="cms-content" name="contenido" value={fields.contenido} onChange={e => update("contenido",e.target.value)} rows={12} required maxLength={50000} /></label><p className="cms-hint">Separa los párrafos con una línea en blanco.</p>
        <label>Estilo de portada<select name="tipoArte" value={fields.tipoArte} onChange={e => update("tipoArte",e.target.value)}><option value="red">Rojo institucional</option><option value="gold">Dorado · Fecha</option><option value="ink">Tinta</option></select></label>
        <label className="cms-check"><input name="destacada" type="checkbox" checked={featured} onChange={e => { setFeatured(e.target.checked); setDirty(true); }} />Noticia destacada</label>
      </>}
      {kind === "evento" && <div className="cms-two">{input("hora","Hora (opcional)","time")}{input("lugar","Lugar (opcional)")}</div>}
      {kind === "documento" && <div className="cms-file-box">
        <label htmlFor="cms-file">{item ? "Reemplazar PDF (opcional)" : "Archivo PDF"}</label>
        <input id="cms-file" name="archivo" type="file" ref={fileInput} accept=".pdf,application/pdf" required={!item && !fileName} onChange={e => {
          const selected = e.target.files?.[0];
          const error = selected && (selected.size > 5 * 1024 * 1024 || !selected.name.toLowerCase().endsWith(".pdf")) ? "Selecciona un PDF de hasta 5 MB." : "";
          e.target.setCustomValidity(error); e.target.reportValidity();
          file.current = error ? null : selected || null; setFileName(selected?.name || ""); setDirty(true);
        }} />
        <small>PDF de hasta 5 MB. {item ? "Si no eliges otro archivo, se conserva el actual." : "El archivo solo será público cuando publiques el contenido."}</small>
        {fileName && <p role="status">Seleccionado: {fileName}</p>}
        {item && <a className="text-link" href={"/archivos/" + item.id} target="_blank" rel="noreferrer">Ver archivo actual ↗</a>}
      </div>}
      {kind !== "documento" && <details className="cms-preview"><summary>Vista previa del contenido</summary><article><small>{fields.categoria || "Categoría"} · {fields.fechaISO}</small><h2>{fields.titulo || "Título del contenido"}</h2><p>{fields.descripcion}</p>{kind === "noticia" ? fields.contenido.split(/\n\s*\n/).map((p,i) => <p key={i}>{p}</p>) : <p>{fields.hora} {fields.lugar}</p>}</article></details>}
      <label className="cms-check"><input name="published" type="checkbox" checked={published} onChange={e => { setPublished(e.target.checked); setDirty(true); }} />Publicado: visible en el sitio web</label>
      <p className="cms-hint">Desmarca “Publicado” para guardar como borrador. Publicar hace visible el contenido inmediatamente.</p>
      {state?.error && <p className="cms-error" ref={errorBox} tabIndex={-1} role="alert">{state.error}</p>}
      <div className="cms-form-footer"><Submit>{item ? "Guardar cambios" : "Crear contenido"}</Submit><Link className="cms-button" href="/admin">Cancelar</Link></div>
    </PendingFields>
  </form>;
}
export function DeleteForm({ id, version }: { id: string; version: string }) {
  const [state, action] = useActionState(deleteAction, {});
  return <details className="cms-danger"><summary>Eliminar contenido</summary><form action={action} className="cms-form"><PendingFields>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="version" value={version} />
    <p>Se eliminará la publicación y su archivo asociado. Esta acción no se puede deshacer.</p>
    <label className="cms-check"><input type="checkbox" name="confirm" required />Confirmo eliminar este contenido y su archivo.</label>
    {state.error && <p className="cms-error" role="alert">{state.error}</p>}
    <Submit>Eliminar definitivamente</Submit>
  </PendingFields></form></details>;
}
export function RevokeSessionsForm() {
  return <form action={revokeAllAction} className="cms-form"><PendingFields>
    <label className="cms-check"><input type="checkbox" name="confirm" required />Confirmo cerrar todas las sesiones, incluida esta.</label>
    <Submit>Cerrar todas las sesiones</Submit>
  </PendingFields></form>;
}


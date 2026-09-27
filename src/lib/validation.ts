import { UserInputError } from "./errors";
import { emptyContent, type Content, type Kind } from "./content";
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0,10) === value;
}
export function parseContent(form: FormData, kind: Kind, previous?: Content): Content {
  const text = (key: string, max: number, required = false) => {
    const value = String(form.get(key) || "").trim();
    if ((required && !value) || value.length > max) throw new UserInputError("Revisa el campo " + key + ".");
    return value;
  };
  const item = { ...(previous || emptyContent(kind)), titulo: text("titulo",180,true),
    categoria: text("categoria",80,true), fechaISO: text("fechaISO",10,true),
    descripcion: text("descripcion",600), published: form.get("published") === "on" };
  if (!validDate(item.fechaISO)) throw new UserInputError("Ingresa una fecha válida.");
  if (kind === "noticia") {
    item.slug = text("slug",180,true);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new UserInputError("La URL solo admite minúsculas, números y guiones.");
    item.contenido = text("contenido",50000,true).split(/\r?\n\s*\r?\n/).filter(Boolean);
    item.destacada = form.get("destacada") === "on";
    const art = text("tipoArte",10);
    item.tipoArte = art === "gold" || art === "ink" ? art : "red";
  } else {
    item.slug = previous?.slug || kind + "-" + item.id;
  }
  if (kind === "evento") {
    item.hora = text("hora",5); item.lugar = text("lugar",180);
    item.fechaFin = text("fechaFin",10);
    if (item.hora && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.hora)) throw new UserInputError("Hora inválida.");
    if (item.fechaFin && (!validDate(item.fechaFin) || item.fechaFin < item.fechaISO)) {
      throw new UserInputError("La fecha final debe ser igual o posterior al inicio.");
    }
  }
  return item;
}


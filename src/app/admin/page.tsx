import Link from "next/link";
import { CalendarDays, FileText, Newspaper, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { adminContent, type AdminParams } from "@/lib/admin-content";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";
const labels = { noticia: "Noticias", documento: "Documentos", evento: "Calendario" };
const icons = { noticia: Newspaper, documento: FileText, evento: CalendarDays };
const notices: Record<string, string> = {
  saved: "Contenido guardado correctamente.",
  deleted: "Contenido eliminado.",
  cleanup: "Contenido actualizado. Un archivo anterior quedó pendiente de limpieza; revisa los registros del servidor.",
};
export default async function AdminPage({ searchParams }: { searchParams: Promise<AdminParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { items, total, pages, page, filters, counts } = await adminContent(params);
  const totalContents = counts.reduce((sum, row) => sum + Number(row.total), 0);
  function href(changes: Record<string, string | number> = {}) {
    const values = { ...filters, page, ...changes };
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) if (value !== "") query.set(key, String(value));
    return "/admin?" + query;
  }
  const numberedPages = [...new Set([1, ...Array.from({ length: 5 }, (_, i) => page + i - 2).filter(p => p > 1 && p < pages), pages])];
  return <>
    <div className="cms-heading">
      <div><p className="eyebrow eyebrow--red">Panel de contenidos</p><h1>Tu colegio, al día</h1><p>Publica, organiza y mantén informada a tu comunidad.</p></div>
      <div className="cms-heading-actions"><Link className="cms-button" href="/admin/seguridad"><ShieldCheck size={18} />Seguridad</Link><form action={logoutAction}><button className="cms-button">Cerrar sesión</button></form></div>
    </div>
    {notices[params.status || ""] && <div className="cms-notice" role="status"><span>{notices[params.status!]}</span><Link href={href()} aria-label="Cerrar aviso">×</Link></div>}
    <div className="cms-stats">
      {(["noticia","documento","evento"] as const).map(kind => {
        const count = counts.find(row => row.kind === kind);
        const Icon = icons[kind];
        return <Link className={"cms-card" + (filters.kind === kind ? " cms-stat-selected" : "")} href={href({ kind, page: 1 })} key={kind} aria-current={filters.kind === kind ? "page" : undefined}>
          <span className="cms-stat-label"><Icon size={21} />{labels[kind]}</span><strong>{Number(count?.total || 0)}</strong>
          <small>{Number(count?.published || 0)} en el sitio · {Number(count?.total || 0) - Number(count?.published || 0)} borradores</small>
        </Link>;
      })}
    </div>
    <div className="cms-actions"><Link className="button button--primary" href="/admin/nuevo/noticia">+ Crear noticia</Link><Link className="cms-button" href="/admin/nuevo/documento">+ Cargar documento</Link><Link className="cms-button" href="/admin/nuevo/evento">+ Agregar actividad</Link></div>
    <section className="cms-card">
      <div className="cms-heading"><div><h2>Biblioteca de contenidos</h2><p className="cms-hint">Busca por título o categoría y controla qué se muestra en la landing.</p></div><span className="cms-badge">{totalContents} contenidos</span></div>
      <form className="cms-filter-grid" key={JSON.stringify(filters)}>
        <label className="cms-search-field">Buscar<input name="q" defaultValue={filters.q} maxLength={120} placeholder="Título o categoría…" type="search" /></label>
        <label>Tipo<select name="kind" defaultValue={filters.kind}><option value="">Todos</option><option value="noticia">Noticias</option><option value="documento">Documentos</option><option value="evento">Calendario</option></select></label>
        <label>Estado<select name="state" defaultValue={filters.state}><option value="">Todos</option><option value="published">Publicados</option><option value="draft">Borradores</option></select></label>
        <label>Ordenar por<select name="sort" defaultValue={filters.sort}><option value="recent">Últimos cambios</option><option value="oldest">Más antiguos</option><option value="title">Título A–Z</option><option value="date">Fecha del contenido</option></select></label>
        <label>Por página<select name="size" defaultValue={filters.size}><option value="5">5</option><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label>
        <div className="cms-filter-actions"><button className="button button--primary">Aplicar filtros</button><Link className="cms-button" href="/admin">Limpiar</Link></div>
      </form>
      <p className="cms-results" role="status">{total ? `Mostrando ${(page - 1) * filters.size + 1}–${Math.min(page * filters.size, total)} de ${total} resultados` : "Sin resultados"}</p>
      {!!items.length && <div className="cms-table-wrap"><table className="cms-table"><caption className="sr-only">Contenidos administrables, página {page} de {pages}</caption><thead><tr><th scope="col">Título</th><th scope="col">Tipo</th><th scope="col">Fecha</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead><tbody>
        {items.map(i => <tr key={i.id}><td><strong>{i.titulo}</strong><small>{i.categoria}</small></td><td data-label="Tipo">{labels[i.kind]}</td><td data-label="Fecha"><time dateTime={i.fechaISO}>{i.fechaISO.split("-").reverse().join("/")}</time></td><td data-label="Estado"><span className={i.published ? "cms-badge cms-badge-live" : "cms-badge"}>{i.published ? "Publicado" : "Borrador"}</span></td>
          <td><div className="cms-row-actions"><Link className="text-link" href={"/admin/editar/" + i.id}>Editar<span className="sr-only"> {i.titulo}</span> →</Link>
            {(i.published || i.kind === "documento") && <Link className="cms-view-link" href={i.kind === "noticia" ? "/noticias/" + i.slug : i.kind === "evento" ? "/calendario?mes=" + i.fechaISO.slice(0,7) : "/archivos/" + i.id} target="_blank" rel="noopener noreferrer">Ver<span className="sr-only"> {i.titulo}</span> ↗</Link>}
          </div></td></tr>)}
      </tbody></table></div>}
      {!items.length && <div className="cms-empty"><FileText size={32} aria-hidden="true" /><h3>{totalContents ? "No encontramos contenidos con estos filtros" : "Comienza con tu primera publicación"}</h3><p>{totalContents ? "Prueba con otro término o limpia los filtros." : "Crea una noticia, carga un documento o agrega una fecha al calendario."}</p><Link className="cms-button" href={totalContents ? "/admin" : "/admin/nuevo/noticia"}>{totalContents ? "Mostrar todos" : "Crear primera noticia"}</Link></div>}
      <nav className="cms-pagination" aria-label="Paginación de contenidos">
        <span>Página {page} de {pages}</span>
        <div className="cms-pagination-links">
          {page > 1 ? <Link href={href({ page: page - 1 })} aria-label="Página anterior">← Anterior</Link> : <span aria-disabled="true">← Anterior</span>}
          {numberedPages.map((number, index) => <span className="cms-page-slot" key={number}>{index > 0 && number - numberedPages[index - 1] > 1 && <span aria-hidden="true">…</span>}<Link href={href({ page: number })} aria-label={"Ir a página " + number} aria-current={number === page ? "page" : undefined}>{number}</Link></span>)}
          {page < pages ? <Link href={href({ page: page + 1 })} aria-label="Página siguiente">Siguiente →</Link> : <span aria-disabled="true">Siguiente →</span>}
        </div>
      </nav>
    </section>
  </>;
}


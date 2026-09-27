import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { publicContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendario académico", description: "Fechas, anuncios y actividades del Colegio Yangtsé." };
export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { eventos } = await publicContent();
  const { mes } = await searchParams;
  const month = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : "";
  const selected = eventos.filter(e => !month || (e.fechaISO.slice(0,7) <= month && (e.fechaFin || e.fechaISO).slice(0,7) >= month));
  return <><Header /><main id="contenido">
    <section className="calendar-page-hero"><div className="container">
      <Link className="documents-back" href="/"><ArrowLeft size={18} />Volver al inicio</Link>
      <p className="eyebrow">Comunidad educativa</p><h1>Calendario académico</h1>
      <p className="calendar-page-hero__description">Consulta los anuncios, actividades y fechas importantes de nuestra comunidad.</p>
    </div></section>
    <section className="calendar-page-content"><div className="container">
      <div className="all-documents__header"><div><p className="eyebrow eyebrow--red">Actividades publicadas</p><h2>Agenda del colegio</h2></div><p>{selected.length} actividades{month ? " en el período seleccionado" : ""}.</p></div>
      <form className="calendar-filter"><label htmlFor="mes">Mes y año</label><input id="mes" name="mes" type="month" defaultValue={month} /><button className="button button--primary">Filtrar</button><Link className="text-link" href="/calendario">Ver todas</Link></form>
      <p className="calendar-timezone">Horarios de Chile continental.</p>
      <div className="calendar-list">{selected.map(evento => <article className="calendar-card" key={evento.id}>
        <time className="calendar-card__date" dateTime={evento.fechaISO}><b>{evento.dia}</b><span>{evento.mes}</span><small>{evento.fechaISO.slice(0,4)}</small></time>
        <div className="calendar-card__content"><span className="calendar-card__category">{evento.categoria}</span><h2>{evento.titulo}</h2>
          {evento.descripcion && <p>{evento.descripcion}</p>}
          {evento.fechaFin && <p>Hasta el <time dateTime={evento.fechaFin}>{evento.fechaFin.split("-").reverse().join("/")}</time></p>}
          <div className="calendar-card__details"><span><Clock size={17} aria-hidden="true" />{evento.hora || "Horario por confirmar"}</span><span><MapPin size={17} aria-hidden="true" />{evento.lugar || "Colegio Yangtsé"}</span></div>
        </div>
      </article>)}</div>
      {!selected.length && <div className="news-empty"><p>No hay actividades publicadas para este período.</p></div>}
    </div></section>
  </main></>;
}

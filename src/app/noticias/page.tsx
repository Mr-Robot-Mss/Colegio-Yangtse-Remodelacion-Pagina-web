import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { publicContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Noticias y comunicados",
  description:
    "Noticias, comunicados y actividades de la comunidad educativa del Colegio Yangtsé.",
};

export const dynamic = "force-dynamic";
export default async function NoticiasPage() {
  const { noticias } = await publicContent();
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="news-page-hero">
          <div className="container">
            <Link
              className="documents-back"
              href="/"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </Link>

            <p className="eyebrow">
              Actualidad escolar
            </p>

            <h1>Noticias y comunicados</h1>

            <p className="news-page-hero__description">
              Conoce las actividades, novedades e información
              importante de nuestra comunidad educativa.
            </p>
          </div>
        </section>

        <section className="news-page-content">
          <div className="container">
            <div className="all-documents__header">
              <div>
                <p className="eyebrow eyebrow--red">
                  Publicaciones
                </p>

                <h2>Últimas noticias</h2>
              </div>

              <p>
                Actualmente hay {noticias.length} publicaciones.
              </p>
            </div>

            {noticias.length > 0 ? (
              <div className="news-grid">
                {noticias.map((noticia) => (
                  <NewsCard
                    key={noticia.id}
                    slug={noticia.slug}
                    featured={noticia.destacada}
                    art={noticia.tipoArte}
                    category={noticia.categoria}
                    date={noticia.fecha}
                    dateISO={noticia.fechaISO}
                    title={noticia.titulo}
                    description={noticia.descripcion}
                  />
                ))}
              </div>
            ) : (
              <div className="news-empty">
                <p>
                  No hay noticias publicadas actualmente.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

type NewsCardProps = {
  slug: string;
  featured?: boolean;
  art: "red" | "gold" | "ink";
  category: string;
  date: string;
  dateISO: string;
  title: string;
  description: string;
};

function NewsCard({
  slug,
  featured,
  art,
  category,
  date,
  dateISO,
  title,
  description,
}: NewsCardProps) {
  const [, monthNumber, day] = dateISO.split("-");

  const months = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];

  const month =
    months[Number(monthNumber) - 1] ?? "";

  return (
    <article
      className={`news-card ${
        featured ? "news-card--featured" : ""
      }`}
    >
      <div
        className={`news-card__art news-card__art--${art}`}
      >
        {art === "red" && (
          <span className="news-card__monogram">
            楊
          </span>
        )}

        {art === "gold" && (
          <span className="news-card__date">
            <b>{day}</b>
            {month}
          </span>
        )}

        {art === "ink" && (
          <span className="news-card__lines" />
        )}

        <span className="news-card__tag">
          {category}
        </span>
      </div>

      <div className="news-card__body">
        <time dateTime={dateISO}>
          {date}
        </time>

        <h3>{title}</h3>

        <p>{description}</p>

        <Link
          href={`/noticias/${slug}`}
          aria-label={`Leer publicación: ${title}`}
        >
          Leer publicación
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  );
}

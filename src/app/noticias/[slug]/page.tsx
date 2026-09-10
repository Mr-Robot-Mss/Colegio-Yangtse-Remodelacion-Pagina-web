import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import {
  noticias,
  obtenerNoticiaPorSlug,
} from "@/data/siteData";

type NoticiaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return noticias.map((noticia) => ({
    slug: noticia.slug,
  }));
}

export async function generateMetadata({
  params,
}: NoticiaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const noticia = obtenerNoticiaPorSlug(slug);

  if (!noticia) {
    return {
      title: "Noticia no encontrada | Colegio Yangtsé",
    };
  }

  return {
    title: `${noticia.titulo} | Colegio Yangtsé`,
    description: noticia.descripcion,
  };
}

export default async function NoticiaPage({
  params,
}: NoticiaPageProps) {
  const { slug } = await params;
  const noticia = obtenerNoticiaPorSlug(slug);

  if (!noticia) {
    notFound();
  }

  return (
    <>
      <Header />

      <main id="contenido">
        <article>
          <header className="article-hero">
            <div className="container article-hero__content">
              <Link
                className="documents-back"
                href="/noticias"
              >
                <ArrowLeft size={18} />
                Volver a noticias
              </Link>

              <span className="article-category">
                {noticia.categoria}
              </span>

              <h1>{noticia.titulo}</h1>

              <p className="article-summary">
                {noticia.descripcion}
              </p>

              <div className="article-date">
                <CalendarDays
                  size={18}
                  aria-hidden="true"
                />

                <time dateTime={noticia.fechaISO}>
                  {noticia.fecha}
                </time>
              </div>
            </div>
          </header>

          <section className="article-content">
            <div className="article-container">
              <div className="article-decoration">
                <span aria-hidden="true">
                  楊
                </span>
              </div>

              <div className="article-text">
                {noticia.contenido.map(
                  (parrafo, index) => (
                    <p key={index}>
                      {parrafo}
                    </p>
                  ),
                )}
              </div>

              <aside className="article-resources">
                <div className="article-resources__icon">
                  <FileText
                    size={25}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <strong>
                    ¿Buscas documentos relacionados?
                  </strong>

                  <p>
                    Revisa reglamentos, listas de útiles y
                    documentación institucional.
                  </p>
                </div>

                <Link
                  className="button button--primary"
                  href="/documentos"
                >
                  Ver documentos
                </Link>
              </aside>

              <div className="article-navigation">
                <Link
                  className="text-link"
                  href="/noticias"
                >
                  <span aria-hidden="true">←</span>
                  Ver todas las publicaciones
                </Link>

                <Link
                  className="text-link"
                  href="/"
                >
                  Volver al inicio
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import { documentos } from "@/data/siteData";

export const metadata: Metadata = {
  title: "Documentos",
  description:
    "Documentos oficiales, reglamentos e información institucional del Colegio Yangtsé.",
};

export default function DocumentosPage() {
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="documents-hero">
          <div className="container">
            <Link
              className="documents-back"
              href="/"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </Link>

            <p className="eyebrow">
              Centro de recursos
            </p>

            <h1>
              Documentos institucionales
            </h1>

            <p className="documents-hero__description">
              Encuentra reglamentos, documentos académicos e
              información oficial del Colegio Yangtsé.
            </p>
          </div>
        </section>

        <section className="all-documents">
          <div className="container">
            <div className="all-documents__header">
              <div>
                <p className="eyebrow eyebrow--red">
                  Información oficial
                </p>

                <h2>
                  Documentos disponibles
                </h2>
              </div>

              <p>
                Actualmente hay {documentos.length} documentos
                publicados.
              </p>
            </div>

            <div className="all-documents__grid">
              {documentos.map((documento) => (
                <article
                  className="document-card"
                  key={documento.id}
                >
                  <div className="document-card__icon">
                    <FileText
                      size={28}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="document-card__content">
                    <span className="document-card__type">
                      {documento.tipo}
                    </span>

                    <h2>{documento.titulo}</h2>

                    <p>{documento.categoria}</p>
                  </div>

                  <a
                    className="document-card__button"
                    href={documento.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir documento
                    <ExternalLink size={17} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

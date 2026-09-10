import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import { eventos } from "@/data/siteData";

export const metadata: Metadata = {
  title: "Calendario escolar",
  description:
    "Fechas y actividades importantes de la comunidad educativa del Colegio Yangtsé.",
};

export default function CalendarioPage() {
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="calendar-page-hero">
          <div className="container">
            <Link
              className="documents-back"
              href="/"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </Link>

            <p className="eyebrow">
              Comunidad educativa
            </p>

            <h1>Calendario escolar</h1>

            <p className="calendar-page-hero__description">
              Consulta las actividades y fechas importantes de
              nuestra comunidad educativa.
            </p>
          </div>
        </section>

        <section className="calendar-page-content">
          <div className="container">
            <div className="all-documents__header">
              <div>
                <p className="eyebrow eyebrow--red">
                  Próximas actividades
                </p>

                <h2>Agenda del colegio</h2>
              </div>

              <p>
                Actualmente hay {eventos.length} actividades
                publicadas.
              </p>
            </div>

            <div className="calendar-list">
              {eventos.map((evento) => (
                <article
                  className="calendar-card"
                  key={evento.id}
                >
                  <time className="calendar-card__date">
                    <b>{evento.dia}</b>
                    <span>{evento.mes}</span>
                  </time>

                  <div className="calendar-card__content">
                    <span className="calendar-card__category">
                      {evento.categoria}
                    </span>

                    <h2>{evento.titulo}</h2>

                    <div className="calendar-card__details">
                      <span>
                        <Clock
                          size={17}
                          aria-hidden="true"
                        />
                        Horario por confirmar
                      </span>

                      <span>
                        <MapPin
                          size={17}
                          aria-hidden="true"
                        />
                        Colegio Yangtsé
                      </span>
                    </div>
                  </div>

                  <div
                    className="calendar-card__icon"
                    aria-hidden="true"
                  >
                    <CalendarDays size={28} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
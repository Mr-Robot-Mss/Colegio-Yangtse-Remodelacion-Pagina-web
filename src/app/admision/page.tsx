import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSearch,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Admisión",
  description:
    "Información y orientación sobre el proceso de admisión al Colegio Yangtsé.",
};

const etapasAdmision = [
  {
    id: 1,
    titulo: "Infórmate",
    descripcion:
      "Conoce nuestro proyecto educativo, reglamentos y características del establecimiento.",
    icono: FileSearch,
  },
  {
    id: 2,
    titulo: "Revisa las fechas",
    descripcion:
      "Consulta el calendario oficial y los periodos habilitados para realizar la postulación.",
    icono: CalendarCheck,
  },
  {
    id: 3,
    titulo: "Realiza la postulación",
    descripcion:
      "Completa el proceso mediante la plataforma oficial del Sistema de Admisión Escolar.",
    icono: ClipboardList,
  },
  {
    id: 4,
    titulo: "Revisa los resultados",
    descripcion:
      "Consulta el resultado de la postulación y continúa con el proceso de matrícula.",
    icono: CheckCircle2,
  },
];

export default function AdmisionPage() {
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="admission-page-hero">
          <div className="container admission-page-hero__grid">
            <div>
              <Link
                className="documents-back"
                href="/"
              >
                <ArrowLeft size={18} />
                Volver al inicio
              </Link>

              <p className="eyebrow">
                Admisión escolar
              </p>

              <h1>
                Forma parte de nuestra comunidad educativa
              </h1>

              <p className="admission-page-hero__description">
                Conoce las etapas generales del proceso y encuentra
                la información necesaria para realizar tu
                postulación.
              </p>

              <a
                className="button button--light"
                href="https://www.sistemadeadmisionescolar.cl/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir al Sistema de Admisión Escolar
                <ArrowUpRight size={18} />
              </a>
            </div>

            <div
              className="admission-page-hero__seal"
              aria-hidden="true"
            >
              <div className="admission-page-hero__orbit" />

              <img
                src="/images/logo-colegio-yangtse.png"
                alt=""
                width="220"
                height="220"
              />
            </div>
          </div>
        </section>

        <section className="admission-process">
          <div className="container">
            <div className="admission-process__heading">
              <p className="eyebrow eyebrow--red">
                Proceso de postulación
              </p>

              <h2>
                Etapas de admisión
              </h2>

              <p>
                El proceso se realiza mediante los canales oficiales
                establecidos por el Ministerio de Educación.
              </p>
            </div>

            <div className="admission-steps">
              {etapasAdmision.map((etapa) => {
                const Icono = etapa.icono;

                return (
                  <article
                    className="admission-step"
                    key={etapa.id}
                  >
                    <div className="admission-step__number">
                      {String(etapa.id).padStart(2, "0")}
                    </div>

                    <div className="admission-step__icon">
                      <Icono
                        size={27}
                        aria-hidden="true"
                      />
                    </div>

                    <h3>{etapa.titulo}</h3>
                    <p>{etapa.descripcion}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="admission-information">
          <div className="container admission-information__grid">
            <div className="admission-information__content">
              <p className="eyebrow eyebrow--red">
                Antes de postular
              </p>

              <h2>
                Conoce nuestro proyecto educativo
              </h2>

              <p>
                Te invitamos a revisar la información institucional,
                nuestros reglamentos y los principios que orientan el
                trabajo de la comunidad educativa.
              </p>

              <ul>
                <li>
                  <CheckCircle2
                    size={19}
                    aria-hidden="true"
                  />
                  Proyecto Educativo Institucional
                </li>

                <li>
                  <CheckCircle2
                    size={19}
                    aria-hidden="true"
                  />
                  Reglamento Interno y de Convivencia
                </li>

                <li>
                  <CheckCircle2
                    size={19}
                    aria-hidden="true"
                  />
                  Información académica del establecimiento
                </li>

                <li>
                  <CheckCircle2
                    size={19}
                    aria-hidden="true"
                  />
                  Canales de contacto y orientación
                </li>
              </ul>

              <Link
                className="button button--primary"
                href="/documentos"
              >
                Revisar documentos
                <ExternalLink size={17} />
              </Link>
            </div>

            <aside className="admission-help">
              <div className="admission-help__icon">
                <HelpCircle
                  size={30}
                  aria-hidden="true"
                />
              </div>

              <p className="eyebrow eyebrow--red">
                ¿Necesitas orientación?
              </p>

              <h2>
                Comunícate con el colegio
              </h2>

              <p>
                Nuestro equipo puede ayudarte a resolver dudas
                generales relacionadas con el establecimiento y el
                proceso de matrícula.
              </p>

              <div className="admission-help__contact">
                <span>Secretaría</span>

                <a href="tel:+56225201346">
                  2 2520 1346
                </a>
              </div>

              <div className="admission-help__contact">
                <span>Dirección</span>

                <p>
                  Av. Alcalde Fernando Castillo Velasco 7631,
                  La Reina
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="admission-final">
          <div className="container admission-final__panel">
            <div
              className="admission-final__icon"
              aria-hidden="true"
            >
              <GraduationCap size={38} />
            </div>

            <div>
              <p className="eyebrow">
                Postulación oficial
              </p>

              <h2>
                Inicia el proceso de admisión
              </h2>

              <p>
                La postulación debe realizarse directamente en la
                plataforma oficial.
              </p>
            </div>

            <a
              className="button button--light"
              href="https://www.sistemadeadmisionescolar.cl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comenzar postulación
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
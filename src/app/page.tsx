import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  documentos,
  eventos,
  noticias,
} from "@/data/siteData";

const logo = "/images/logo-colegio-yangtse.png";

export default function Home() {
  return (
    <>
      <Header />

      <main id="contenido">
        {/* Portada */}

        <section
          className="hero"
          aria-labelledby="hero-title"
        >
          <div
            className="hero__pattern"
            aria-hidden="true"
          />

          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">
                Comunidad educativa de La Reina
              </p>

              <h1 id="hero-title">
                Educar con amor por el sendero de la excelencia.
              </h1>

              <p className="hero__lead">
                Un espacio de aprendizaje cercano, respetuoso y
                comprometido con el desarrollo integral de cada
                estudiante.
              </p>

              <div className="hero__actions">
                <Link
                  className="button button--light"
                  href="#admision"
                >
                  Conoce Admisión
                </Link>

                <Link
                  className="button button--ghost"
                  href="/noticias"
                >
                  Ver comunicados
                </Link>
              </div>
            </div>

            <div
              className="hero__seal"
              aria-hidden="true"
            >
              <div className="seal__orbit seal__orbit--one" />
              <div className="seal__orbit seal__orbit--two" />

              <img
                src={logo}
                alt=""
                width="248"
                height="248"
              />
            </div>
          </div>

          <div
            className="hero__curve"
            aria-hidden="true"
          />
        </section>

        {/* Accesos rápidos */}

        <section
          className="quick-section"
          aria-labelledby="quick-title"
        >
          <div className="container">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow eyebrow--red">
                  Accesos rápidos
                </p>

                <h2 id="quick-title">
                  Todo lo importante, a un clic
                </h2>
              </div>

              <p>
                Encuentra la información más consultada por familias y
                estudiantes.
              </p>
            </div>

            <div className="quick-grid">
              <QuickCard
                href="#admision"
                title="Admisión"
                subtitle="Proceso y requisitos"
                icon="graduation"
              />

              <QuickCard
                href="/documentos"
                title="Documentos"
                subtitle="Reglamentos y PEI"
                icon="document"
              />

              <QuickCard
                href="/calendario"
                title="Calendario"
                subtitle="Fechas y actividades"
                icon="calendar"
              />

              <QuickCard
                href="#contacto"
                title="Contacto"
                subtitle="Teléfonos y ubicación"
                icon="contact"
              />
            </div>
          </div>
        </section>

        {/* Información destacada */}

        <section
          className="notice"
          aria-label="Información destacada"
        >
          <div className="container notice__inner">
            <div className="notice__badge">
              Importante
            </div>

            <div className="notice__copy">
              <strong>
                Información para el inicio del año escolar
              </strong>

              <span>
                Consulta listas de útiles, horarios y documentación
                vigente.
              </span>
            </div>

            <Link href="/documentos">
              Revisar información{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Nuestro colegio */}

        <section
          className="about section"
          id="colegio"
          aria-labelledby="about-title"
        >
          <div className="container about__grid">
            <div
              className="about__visual"
              aria-hidden="true"
            >
              <div className="about__number">
                +
              </div>

              <div className="about__quote">
                Respeto, solidaridad y excelencia
              </div>

              <div className="about__stamp">
                Formación
                <br />
                integral
              </div>
            </div>

            <div className="about__copy">
              <p className="eyebrow eyebrow--red">
                Nuestro propósito
              </p>

              <h2 id="about-title">
                Formamos personas preparadas para aportar a su
                comunidad.
              </h2>

              <p>
                Promovemos una educación integral que combina
                aprendizajes significativos con valores, convivencia
                respetuosa y participación activa de las familias.
              </p>

              <div
                className="pillars"
                id="comunidad"
              >
                <Pillar
                  number="01"
                  title="Aprendizaje"
                >
                  Experiencias que despiertan la curiosidad y
                  desarrollan habilidades para la vida.
                </Pillar>

                <Pillar
                  number="02"
                  title="Convivencia"
                >
                  Una comunidad segura, inclusiva y basada en el
                  respeto mutuo.
                </Pillar>

                <Pillar
                  number="03"
                  title="Identidad"
                >
                  Tradiciones y valores que conectan nuestra historia
                  con el futuro.
                </Pillar>
              </div>

              <a
                className="text-link"
                href="https://www.colegioyangtse.cl/?page_id=20295"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conocer nuestro proyecto educativo
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Noticias */}

        <section
          className="news section section--soft"
          id="noticias"
          aria-labelledby="news-title"
        >
          <div className="container">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow eyebrow--red">
                  Actualidad escolar
                </p>

                <h2 id="news-title">
                  Noticias y comunicados
                </h2>
              </div>

              <Link
                className="text-link"
                href="/noticias"
              >
                Ver todas las publicaciones
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="news-grid">
              {noticias.map((noticia) => (
                <NewsCard
                  key={noticia.id}
                  featured={noticia.destacada}
                  art={noticia.tipoArte}
                  tag={noticia.categoria}
                  date={noticia.fecha}
                  dateISO={noticia.fechaISO}
                  title={noticia.titulo}
                  description={noticia.descripcion}
                  href={noticia.enlace}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Documentos */}

        <section
          className="resources section"
          id="documentos"
          aria-labelledby="resources-title"
        >
          <div className="container resources__grid">
            <div className="resources__intro">
              <p className="eyebrow eyebrow--red">
                Centro de recursos
              </p>

              <h2 id="resources-title">
                Documentos claros y ordenados
              </h2>

              <p>
                Accede rápidamente a la información oficial del
                establecimiento.
              </p>

              <Link
                className="button button--primary"
                href="/documentos"
              >
                Ver todos los documentos
              </Link>
            </div>

            <div className="document-list">
              {documentos.map((documento) => (
                <DocumentLink
                  key={documento.id}
                  href={documento.enlace}
                  title={documento.titulo}
                  detail={documento.categoria}
                  fileType={documento.tipo}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Agenda */}

        <section
          className="agenda section"
          id="agenda"
          aria-labelledby="agenda-title"
        >
          <div className="container">
            <div className="agenda__panel">
              <div className="agenda__intro">
                <p className="eyebrow">
                  Próximas fechas
                </p>

                <h2 id="agenda-title">
                  Agenda escolar
                </h2>

                <p>
                  Actividades y fechas relevantes para nuestra
                  comunidad.
                </p>
              </div>

              <div className="agenda__events">
                {eventos.map((evento) => (
                  <Event
                    key={evento.id}
                    day={evento.dia}
                    month={evento.mes}
                    category={evento.categoria}
                    title={evento.titulo}
                  />
                ))}
              </div>

              <Link
                className="button button--light agenda__button"
                href="/calendario"
              >
                Ver calendario completo
              </Link>
            </div>
          </div>
        </section>

        {/* Admisión */}

        <section
          className="admission section"
          id="admision"
          aria-labelledby="admission-title"
        >
          <div className="container admission__panel">
            <div
              className="admission__mark"
              aria-hidden="true"
            >
              <img
                src={logo}
                alt=""
                width="142"
                height="142"
              />
            </div>

            <div>
              <p className="eyebrow eyebrow--red">
                Admisión
              </p>

              <h2 id="admission-title">
                ¿Quieres formar parte del Colegio Yangtsé?
              </h2>

              <p>
                Conoce el proceso de admisión, revisa las fechas
                importantes y encuentra orientación para realizar tu
                postulación.
              </p>
            </div>

            <div className="admission__actions">
              <a
                className="button button--primary"
                href="https://www.colegioyangtse.cl/?page_id=17311"
                target="_blank"
                rel="noopener noreferrer"
              >
                Información de admisión
              </a>

              <a
                className="text-link"
                href="https://www.sistemadeadmisionescolar.cl/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir al Sistema de Admisión Escolar
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}

      <footer
        className="footer"
        id="contacto"
      >
        <div className="container footer__grid">
          <div className="footer__brand">
            <img
              src={logo}
              alt="Emblema del Colegio Yangtsé"
              width="72"
              height="72"
            />

            <div>
              <strong>Colegio Yangtsé</strong>

              <p>
                Educar con amor por el sendero de la excelencia.
              </p>
            </div>
          </div>

          <div>
            <h2>Contacto</h2>

            <address>
              Av. Alcalde Fernando Castillo Velasco 7631
              <br />
              La Reina, Santiago
            </address>
          </div>

          <div>
            <h2>Teléfonos</h2>

            <a href="tel:+56225201346">
              Secretaría: 2 2520 1346
            </a>

            <a href="tel:+56225201351">
              Inspectoría: 2 2520 1351
            </a>

            <a href="tel:+56225201344">
              Dirección: 2 2520 1344
            </a>
          </div>

          <div>
            <h2>Horario</h2>

            <p>
              Lunes a viernes
              <br />
              08:30 a 16:30 hrs.
            </p>
          </div>
        </div>

        <div className="container footer__bottom">
          <p>
            © {new Date().getFullYear()} Colegio Yangtsé
          </p>

          <div>
            <a href="#inicio">
              Volver arriba
            </a>

            <a href="#contacto">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* Componente de accesos rápidos */

type QuickCardProps = {
  href: string;
  title: string;
  subtitle: string;
  icon: "graduation" | "document" | "calendar" | "contact";
};

function QuickCard({
  href,
  title,
  subtitle,
  icon,
}: QuickCardProps) {
  const icons = {
    graduation: (
      <>
        <path d="M12 3 2 8l10 5 10-5-10-5Z" />
        <path d="m6 10v5c3 3 9 3 12 0v-5" />
      </>
    ),

    document: (
      <>
        <path d="M6 2h9l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h6" />
      </>
    ),

    calendar: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),

    contact: (
      <>
        <path d="M4 4h16v13H7l-3 3z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  };

  return (
    <Link
      className="quick-card"
      href={href}
    >
      <span
        className="quick-card__icon"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </span>

      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>

      <span
        className="arrow"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}

/* Componente de pilares */

type PillarProps = {
  number: string;
  title: string;
  children: ReactNode;
};

function Pillar({
  number,
  title,
  children,
}: PillarProps) {
  return (
    <article>
      <span>{number}</span>

      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}

/* Componente de noticias */

type NewsCardProps = {
  featured?: boolean;
  art: "red" | "gold" | "ink";
  tag: string;
  date: string;
  dateISO: string;
  title: string;
  description: string;
  href: string;
};

function NewsCard({
  featured,
  art,
  tag,
  date,
  dateISO,
  title,
  description,
  href,
}: NewsCardProps) {
  const [, monthNumber, day] = dateISO.split("-");

  const monthNames = [
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
    monthNames[Number(monthNumber) - 1] ?? "";

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
          {tag}
        </span>
      </div>

      <div className="news-card__body">
        <time dateTime={dateISO}>
          {date}
        </time>

        <h3>{title}</h3>
        <p>{description}</p>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Leer{" "}
          {tag === "Comunicado"
            ? "comunicado"
            : "noticia"}

          <span aria-hidden="true"> →</span>
        </a>
      </div>
    </article>
  );
}

/* Componente de documentos */

type DocumentLinkProps = {
  href: string;
  title: string;
  detail: string;
  fileType: string;
};

function DocumentLink({
  href,
  title,
  detail,
  fileType,
}: DocumentLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="document-list__type">
        {fileType}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>

      <span
        className="download"
        aria-hidden="true"
      >
        ↓
      </span>
    </a>
  );
}

/* Componente de eventos */

type EventProps = {
  day: string;
  month: string;
  category: string;
  title: string;
};

function Event({
  day,
  month,
  category,
  title,
}: EventProps) {
  return (
    <article>
      <time>
        <b>{day}</b>
        <span>{month}</span>
      </time>

      <div>
        <small>{category}</small>
        <h3>{title}</h3>
      </div>
    </article>
  );
}
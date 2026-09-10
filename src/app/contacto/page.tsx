import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Clock3,
  MapPin,
  Phone,
} from "lucide-react";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Dirección, teléfonos y horarios de atención del Colegio Yangtsé de La Reina.",
};

const telefonos = [
  {
    id: 1,
    area: "Secretaría",
    numeroVisible: "2 2520 1346",
    numeroEnlace: "+56225201346",
  },
  {
    id: 2,
    area: "Inspectoría",
    numeroVisible: "2 2520 1351",
    numeroEnlace: "+56225201351",
  },
  {
    id: 3,
    area: "Dirección",
    numeroVisible: "2 2520 1344",
    numeroEnlace: "+56225201344",
  },
];

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Av.+Alcalde+Fernando+Castillo+Velasco+7631,+La+Reina,+Santiago";

export default function ContactoPage() {
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="contact-page-hero">
          <div className="container">
            <Link
              className="documents-back"
              href="/"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </Link>

            <p className="eyebrow">
              Estamos para ayudarte
            </p>

            <h1>Contacto</h1>

            <p className="contact-page-hero__description">
              Encuentra nuestros teléfonos, horarios de atención y
              ubicación.
            </p>
          </div>
        </section>

        <section className="contact-page-content">
          <div className="container">
            <div className="contact-cards">
              <article className="contact-card">
                <div className="contact-card__icon">
                  <Building2
                    size={29}
                    aria-hidden="true"
                  />
                </div>

                <p className="eyebrow eyebrow--red">
                  Establecimiento
                </p>

                <h2>Colegio Yangtsé</h2>

                <p>
                  Comunidad educativa ubicada en la comuna de La
                  Reina, Santiago.
                </p>
              </article>

              <article className="contact-card">
                <div className="contact-card__icon">
                  <MapPin
                    size={29}
                    aria-hidden="true"
                  />
                </div>

                <p className="eyebrow eyebrow--red">
                  Dirección
                </p>

                <h2>Visítanos</h2>

                <address>
                  Av. Alcalde Fernando Castillo Velasco 7631
                  <br />
                  La Reina, Santiago
                </address>

                <a
                  className="contact-card__link"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Google Maps
                  <ArrowUpRight size={17} />
                </a>
              </article>

              <article className="contact-card">
                <div className="contact-card__icon">
                  <Clock3
                    size={29}
                    aria-hidden="true"
                  />
                </div>

                <p className="eyebrow eyebrow--red">
                  Horario
                </p>

                <h2>Atención</h2>

                <p>
                  Lunes a viernes
                  <br />
                  08:30 a 16:30 hrs.
                </p>
              </article>
            </div>

            <div className="contact-main">
              <section className="contact-phones">
                <p className="eyebrow eyebrow--red">
                  Atención telefónica
                </p>

                <h2>
                  Comunícate con nosotros
                </h2>

                <p className="contact-phones__description">
                  Selecciona el área con la que necesitas
                  comunicarte.
                </p>

                <div className="contact-phone-list">
                  {telefonos.map((telefono) => (
                    <a
                      key={telefono.id}
                      href={`tel:${telefono.numeroEnlace}`}
                    >
                      <span className="contact-phone-list__icon">
                        <Phone
                          size={21}
                          aria-hidden="true"
                        />
                      </span>

                      <span>
                        <small>{telefono.area}</small>
                        <strong>
                          {telefono.numeroVisible}
                        </strong>
                      </span>

                      <span
                        className="arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </section>

              <aside className="contact-location">
                <div
                  className="contact-location__pattern"
                  aria-hidden="true"
                />

                <div className="contact-location__content">
                  <MapPin
                    size={45}
                    aria-hidden="true"
                  />

                  <p className="eyebrow">
                    Nuestra ubicación
                  </p>

                  <h2>
                    La Reina, Santiago
                  </h2>

                  <p>
                    Av. Alcalde Fernando Castillo Velasco 7631
                  </p>

                  <a
                    className="button button--light"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver cómo llegar
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
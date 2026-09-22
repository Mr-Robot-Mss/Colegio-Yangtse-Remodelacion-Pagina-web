import type { Metadata } from "next";
import {
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import ContactForm from "@/components/ContactForm";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Información de contacto, ubicación y formulario del Colegio Yangtsé.",
};

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Colegio+Yangtse+La+Reina+Chile";

export default function ContactoPage() {
  return (
    <>
      <Header />

      <main>
        <section className="contacto-hero">
          <div className="container">
            <span className="eyebrow">Contacto</span>

            <h1>Estamos para ayudarte</h1>

            <p>
              Comunícate con nuestro equipo para resolver consultas sobre
              admisión, documentos, actividades o información académica.
            </p>
          </div>
        </section>

        <section className="contacto-section">
          <div className="container">
            <div className="contacto-info-grid">
              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <MapPin size={23} />
                </div>

                <div>
                  <h2>Dirección</h2>
                  <p>La Reina, Santiago, Región Metropolitana.</p>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ubicación
                    <ExternalLink size={15} />
                  </a>
                </div>
              </article>

              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <Phone size={23} />
                </div>

                <div>
                  <h2>Teléfono</h2>
                  <p>Secretaría y atención general.</p>

                  <span>Información por confirmar</span>
                </div>
              </article>

              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <Mail size={23} />
                </div>

                <div>
                  <h2>Correo electrónico</h2>
                  <p>Consultas generales del establecimiento.</p>

                  <a href="mailto:contacto@colegioyangtse.cl">
                    contacto@colegioyangtse.cl
                  </a>
                </div>
              </article>

              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <Clock3 size={23} />
                </div>

                <div>
                  <h2>Horario de atención</h2>
                  <p>Lunes a viernes.</p>

                  <span>Horario por confirmar</span>
                </div>
              </article>
            </div>

            <div className="contacto-main-grid">
              <ContactForm />

              <aside className="contacto-location">
                <span className="eyebrow">Ubicación</span>
                <h2>Encuéntranos en La Reina</h2>

                <p>
                  Revisa la ubicación del establecimiento y planifica tu
                  recorrido antes de visitarnos.
                </p>

                <div className="contacto-map-placeholder">
                  <MapPin size={44} />

                  <div>
                    <strong>Colegio Yangtsé</strong>
                    <span>La Reina, Santiago</span>
                  </div>
                </div>

                <a
                  className="contacto-map-button"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir en Google Maps
                  <ExternalLink size={17} />
                </a>

                <div className="contacto-note">
                  <strong>Antes de publicar</strong>

                  <p>
                    Debemos confirmar con el colegio su dirección exacta,
                    teléfono, correo y horario oficial.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
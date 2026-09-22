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
import { institutionData } from "@/data/institutionData";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Información de contacto, ubicación y atención del Colegio Yangtsé.",
};

export default function ContactoPage() {
  return (
    <>
      <Header />

      <main id="contenido">
        <section className="contacto-hero">
          <div className="container">
            <span className="eyebrow">Contacto</span>

            <h1>Estamos para ayudarte</h1>

            <p>
              Comunícate con nuestro equipo para resolver consultas
              sobre admisión, documentos, actividades o información
              académica.
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

                  <p>
                    {institutionData.location.address}
                    <br />
                    {institutionData.location.commune},{" "}
                    {institutionData.location.city}
                  </p>

                  <a
                    href={institutionData.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
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
                  <h2>Teléfonos</h2>

                  <p>
                    Consultas y atención general del establecimiento.
                  </p>

                  <div className="contacto-contact-list">
                    {institutionData.phones.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                      >
                        {phone.display}
                      </a>
                    ))}
                  </div>
                </div>
              </article>

              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <Mail size={23} />
                </div>

                <div>
                  <h2>Correos electrónicos</h2>

                  <p>
                    Contacto institucional y dirección del colegio.
                  </p>

                  <div className="contacto-contact-list">
                    {institutionData.emails.map((email) => (
                      <a
                        key={email.address}
                        href={email.href}
                      >
                        {email.address}
                      </a>
                    ))}
                  </div>
                </div>
              </article>

              <article className="contacto-info-card">
                <div className="contacto-info-icon">
                  <Clock3 size={23} />
                </div>

                <div>
                  <h2>Horario de atención</h2>

                  <p>{institutionData.publicHours.days}</p>

                  <span>
                    {institutionData.publicHours.hours}
                  </span>
                </div>
              </article>
            </div>

            <div className="contacto-main-grid">
              <ContactForm />

              <aside className="contacto-location">
                <span className="eyebrow">Ubicación</span>

                <h2>Encuéntranos en La Reina</h2>

                <p>
                  Revisa la ubicación del establecimiento y planifica
                  tu recorrido antes de visitarnos.
                </p>

                <div className="contacto-map-placeholder">
                  <MapPin size={44} />

                  <div>
                    <strong>{institutionData.name}</strong>

                    <span>
                      {institutionData.location.address}
                    </span>
                  </div>
                </div>

                <a
                  className="contacto-map-button"
                  href={institutionData.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Google Maps
                  <ExternalLink size={17} />
                </a>

                <div className="contacto-school-data">
                  <h3>Información institucional</h3>

                  <dl>
                    <div>
                      <dt>Directora</dt>
                      <dd>{institutionData.principal}</dd>
                    </div>

                    <div>
                      <dt>Total de alumnos</dt>
                      <dd>
                        {institutionData.statistics.students}
                      </dd>
                    </div>

                    <div>
                      <dt>Docentes</dt>
                      <dd>
                        {institutionData.statistics.teachers}
                      </dd>
                    </div>

                    <div>
                      <dt>Jornada</dt>
                      <dd>
                        {institutionData.academicSchedule}
                      </dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
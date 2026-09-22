import Image from "next/image";
import Link from "next/link";

import { institutionData } from "@/data/institutionData";

const logo = "/images/logo-colegio-yangtse.png";

export default function GlobalFooter() {
  return (
    <footer
      className="footer"
      id="contacto"
    >
      <div className="container footer__grid">
        <div className="footer__brand">
          <Image
            src={logo}
            alt={`Emblema del ${institutionData.name}`}
            width={72}
            height={72}
          />

          <div>
            <strong>{institutionData.name}</strong>
            <p>{institutionData.slogan}</p>
          </div>
        </div>

        <div>
          <h2>Ubicación</h2>

          <address>
            {institutionData.location.address}
            <br />
            {institutionData.location.commune},{" "}
            {institutionData.location.city}
          </address>

          <a
            href={institutionData.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Google Maps
          </a>
        </div>

        <div>
          <h2>Teléfonos</h2>

          {institutionData.phones.map((phone) => (
            <a
              key={phone.href}
              href={phone.href}
            >
              {phone.display}
            </a>
          ))}

          <p>
            {institutionData.publicHours.days}
            <br />
            {institutionData.publicHours.hours}
          </p>
        </div>

        <div>
          <h2>Correos</h2>

          {institutionData.emails.map((email) => (
            <a
              key={email.address}
              href={email.href}
            >
              {email.address}
            </a>
          ))}

          <Link href="/contacto">
            Formulario de contacto
          </Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          {institutionData.name}
        </p>

        <div>
          <Link href="/">Inicio</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
      </div>
    </footer>
  );
}

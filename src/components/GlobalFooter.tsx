"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const logo = "/images/logo-colegio-yangtse.png";

export default function GlobalFooter() {
  const pathname = usePathname();

  /*
   * La portada ya tiene su propio footer.
   * Por eso evitamos mostrarlo dos veces en "/".
   */
  if (pathname === "/") {
    return null;
  }

  return (
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
            <strong>
              Colegio Yangtsé
            </strong>

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

          <Link href="/contacto">
            Ver información de contacto
          </Link>
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
          <h2>Enlaces</h2>

          <Link href="/admision">
            Admisión
          </Link>

          <Link href="/noticias">
            Noticias
          </Link>

          <Link href="/documentos">
            Documentos
          </Link>

          <Link href="/calendario">
            Calendario
          </Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © {new Date().getFullYear()} Colegio Yangtsé
        </p>

        <div>
          <Link href="/">
            Inicio
          </Link>

          <Link href="/contacto">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
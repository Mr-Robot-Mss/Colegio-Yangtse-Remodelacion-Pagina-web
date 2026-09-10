"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    nombre: "El colegio",
    enlace: "/#colegio",
  },
  {
    nombre: "Comunidad",
    enlace: "/#comunidad",
  },
  {
    nombre: "Noticias",
    enlace: "/noticias",
  },
  {
    nombre: "Calendario",
    enlace: "/calendario",
  },
  {
    nombre: "Documentos",
    enlace: "/documentos",
  },
  {
    nombre: "Contacto",
    enlace: "/contacto",
  },
];

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuAbierto(false);
      }
    }

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        cerrarConEscape,
      );
    };
  }, []);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function esRutaActiva(enlace: string) {
    if (enlace.startsWith("/#")) {
      return false;
    }

    return pathname === enlace;
  }

  return (
    <>
      <a
        className="skip-link"
        href="#contenido"
      >
        Ir al contenido principal
      </a>

      <div className="topbar">
        <div className="container topbar__inner">
          <p>
            Lunes a viernes · 08:30 a 16:30 hrs.
          </p>

          <div className="topbar__links">
            <a href="tel:+56225201346">
              Secretaría: 2 2520 1346
            </a>

            <span aria-hidden="true">
              •
            </span>

            <Link href="/contacto">
              Cómo llegar
            </Link>
          </div>
        </div>
      </div>

      <header
        className="site-header"
        id="inicio"
      >
        <div className="container header__inner">
          <Link
            className="brand"
            href="/"
            aria-label="Colegio Yangtsé, inicio"
            onClick={cerrarMenu}
          >
            <img
              src="/images/logo-colegio-yangtse.png"
              alt="Emblema del Colegio Yangtsé"
              width="58"
              height="58"
            />

            <span className="brand__text">
              <strong>
                Colegio Yangtsé
              </strong>

              <small>
                La Reina · Santiago
              </small>
            </span>
          </Link>

          <button
            className={`menu-button ${
              menuAbierto ? "is-open" : ""
            }`}
            type="button"
            aria-label={
              menuAbierto
                ? "Cerrar menú de navegación"
                : "Abrir menú de navegación"
            }
            aria-expanded={menuAbierto}
            aria-controls="main-menu"
            onClick={() =>
              setMenuAbierto(!menuAbierto)
            }
          >
            <span className="menu-button__label">
              {menuAbierto ? "Cerrar" : "Menú"}
            </span>

            <span
              className="menu-button__icon"
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </span>
          </button>

          <nav
            id="main-menu"
            className={`main-nav ${
              menuAbierto ? "is-open" : ""
            }`}
            aria-label="Navegación principal"
          >
            {menuItems.map((item) => (
              <Link
                key={item.nombre}
                href={item.enlace}
                onClick={cerrarMenu}
                aria-current={
                  esRutaActiva(item.enlace)
                    ? "page"
                    : undefined
                }
              >
                {item.nombre}
              </Link>
            ))}

            <Link
              className="nav-cta"
              href="/admision"
              onClick={cerrarMenu}
              aria-current={
                pathname === "/admision"
                  ? "page"
                  : undefined
              }
            >
              Admisión
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { institutionData } from "@/data/institutionData";

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

  const telefonoPrincipal = institutionData.phones[0];
  const telefonoAlternativo = institutionData.phones[1];

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
          <p>{institutionData.publicHours.short}</p>

          <div className="topbar__links">
            <a href={telefonoPrincipal.href}>
              {telefonoPrincipal.display}
            </a>

            <span aria-hidden="true">•</span>

            <a href={telefonoAlternativo.href}>
              {telefonoAlternativo.display}
            </a>

            <span aria-hidden="true">•</span>

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
            aria-label={`${institutionData.name}, inicio`}
            onClick={cerrarMenu}
          >
            <img
              src="/images/logo-colegio-yangtse.png"
              alt={`Emblema del ${institutionData.name}`}
              width="58"
              height="58"
            />

            <span className="brand__text">
              <strong>{institutionData.name}</strong>

              <small>
                {institutionData.location.commune} ·{" "}
                {institutionData.location.city}
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
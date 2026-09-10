import Link from "next/link";
import {
  ArrowLeft,
  FileQuestion,
  Home,
} from "lucide-react";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />

      <main
        id="contenido"
        className="not-found-page"
      >
        <div className="container not-found-page__content">
          <div
            className="not-found-page__icon"
            aria-hidden="true"
          >
            <FileQuestion size={52} />
          </div>

          <p className="not-found-page__number">
            404
          </p>

          <h1>Página no encontrada</h1>

          <p className="not-found-page__description">
            La página que intentas visitar no existe, fue movida o ya
            no se encuentra disponible.
          </p>

          <div className="not-found-page__actions">
            <Link
              className="button button--primary"
              href="/"
            >
              <Home size={18} />
              Volver al inicio
            </Link>

            <Link
              className="text-link"
              href="/noticias"
            >
              <ArrowLeft size={18} />
              Revisar noticias
            </Link>
          </div>
        </div>

        <div
          className="not-found-page__circle not-found-page__circle--one"
          aria-hidden="true"
        />

        <div
          className="not-found-page__circle not-found-page__circle--two"
          aria-hidden="true"
        />
      </main>
    </>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";

type EstadoFormulario = "inicial" | "enviando" | "exito" | "error";

export default function ContactForm() {
  const [estado, setEstado] = useState<EstadoFormulario>("inicial");
  const [mensajeEstado, setMensajeEstado] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formulario = event.currentTarget;
    const datosFormulario = new FormData(formulario);

    setEstado("enviando");
    setMensajeEstado("");

    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: datosFormulario.get("nombre"),
          email: datosFormulario.get("email"),
          telefono: datosFormulario.get("telefono"),
          asunto: datosFormulario.get("asunto"),
          mensaje: datosFormulario.get("mensaje"),
          website: datosFormulario.get("website"),
          turnstileToken,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No fue posible enviar el mensaje.");
      }

      formulario.reset();
      setTurnstileToken("");
      setCaptchaReset((valor) => valor + 1);
      setEstado("exito");
      setMensajeEstado("Tu mensaje fue enviado correctamente.");
    } catch (error) {
      setTurnstileToken("");
      setCaptchaReset((valor) => valor + 1);
      setEstado("error");
      setMensajeEstado(
        error instanceof Error
          ? error.message
          : "Ocurrió un problema al enviar el mensaje.",
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={enviarFormulario}>
      <div className="contact-form-heading">
        <span className="eyebrow">Escríbenos</span>
        <h2>¿En qué podemos ayudarte?</h2>
        <p>
          Completa el formulario y el equipo del colegio se pondrá en contacto
          contigo.
        </p>
      </div>

      <div className="contact-form-grid">
        <div className="contact-field">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            minLength={3}
            maxLength={80}
            required
            placeholder="Ejemplo: María González"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            required
            placeholder="nombre@correo.cl"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="asunto">Motivo del contacto</label>
          <select id="asunto" name="asunto" required defaultValue="">
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="Admisión">Admisión</option>
            <option value="Información académica">
              Información académica
            </option>
            <option value="Documentos">Documentos</option>
            <option value="Convivencia escolar">Convivencia escolar</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="contact-field contact-field-full">
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={6}
            minLength={10}
            maxLength={1500}
            required
            placeholder="Escribe aquí tu consulta..."
          />
          <small>Máximo 1.500 caracteres.</small>
        </div>

        {/* Campo invisible para detectar bots */}
        <div className="contact-honeypot" aria-hidden="true">
          <label htmlFor="website">Sitio web</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      </div>

      <TurnstileWidget
        onTokenChange={setTurnstileToken}
        resetSignal={captchaReset}
      />

      <button
        className="contact-submit"
        type="submit"
        disabled={estado === "enviando" || !turnstileToken}
      >
        {estado === "enviando" ? (
          <>
            <LoaderCircle className="contact-spinner" size={19} />
            Enviando...
          </>
        ) : (
          <>
            Enviar mensaje
            <Send size={18} />
          </>
        )}
      </button>

      {mensajeEstado && (
        <div
          className={`contact-form-status contact-form-status-${estado}`}
          role="status"
          aria-live="polite"
        >
          {estado === "exito" && <CheckCircle2 size={19} />}
          {mensajeEstado}
        </div>
      )}
    </form>
  );
}

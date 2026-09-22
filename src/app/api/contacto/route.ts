import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type DatosContacto = {
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  asunto?: unknown;
  mensaje?: unknown;
  website?: unknown;
};

const intentos = new Map<string, { cantidad: number; vence: number }>();

const LIMITE_INTENTOS = 3;
const DURACION_LIMITE = 10 * 60 * 1000;
const TAMANO_MAXIMO_SOLICITUD = 20_000;

const ASUNTOS_PERMITIDOS = new Set([
  "Admisión",
  "Información académica",
  "Documentos",
  "Convivencia escolar",
  "Otro",
]);

function responder(mensaje: string, status = 200) {
  return NextResponse.json(
    { mensaje },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

function obtenerTexto(valor: unknown): string {
  return typeof valor === "string"
    ? valor
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim()
    : "";
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function telefonoValido(telefono: string): boolean {
  return !telefono || /^[+\d\s()-]{7,20}$/.test(telefono);
}

function escaparHtml(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerIp(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for");

  if (reenviada) {
    return reenviada.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "desconocida";
}

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();

  if (intentos.size > 500) {
    for (const [clave, valor] of intentos) {
      if (valor.vence < ahora) {
        intentos.delete(clave);
      }
    }
  }

  const registro = intentos.get(ip);

  if (!registro || registro.vence < ahora) {
    intentos.set(ip, {
      cantidad: 1,
      vence: ahora + DURACION_LIMITE,
    });

    return false;
  }

  if (registro.cantidad >= LIMITE_INTENTOS) {
    return true;
  }

  registro.cantidad += 1;
  intentos.set(ip, registro);

  return false;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const originEsperado = new URL(request.url).origin;

    if (origin && origin !== originEsperado) {
      return responder("Solicitud no autorizada.", 403);
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return responder("El formato de la solicitud no es válido.", 415);
    }

    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > TAMANO_MAXIMO_SOLICITUD) {
      return responder("La solicitud es demasiado grande.", 413);
    }

    const cuerpo = await request.text();

    if (cuerpo.length > TAMANO_MAXIMO_SOLICITUD) {
      return responder("La solicitud es demasiado grande.", 413);
    }

    let datos: DatosContacto;

    try {
      datos = JSON.parse(cuerpo) as DatosContacto;
    } catch {
      return responder("El contenido de la solicitud no es válido.", 400);
    }

    const nombre = obtenerTexto(datos.nombre);
    const email = obtenerTexto(datos.email).toLowerCase();
    const telefono = obtenerTexto(datos.telefono);
    const asunto = obtenerTexto(datos.asunto);
    const mensaje = obtenerTexto(datos.mensaje);
    const website = obtenerTexto(datos.website);

    // Los visitantes reales nunca completan este campo.
    if (website) {
      return responder("Tu mensaje fue enviado correctamente.");
    }

    if (
      nombre.length < 3 ||
      nombre.length > 80 ||
      !emailValido(email) ||
      email.length > 120 ||
      telefono.length > 20 ||
      !telefonoValido(telefono) ||
      !ASUNTOS_PERMITIDOS.has(asunto) ||
      mensaje.length < 10 ||
      mensaje.length > 1500
    ) {
      return responder("Revisa los datos ingresados en el formulario.", 400);
    }

    const ip = obtenerIp(request);

    if (excedeLimite(ip)) {
      return responder(
        "Has enviado demasiados mensajes. Inténtalo nuevamente más tarde.",
        429,
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const correoDestino = process.env.CONTACT_TO_EMAIL;
    const correoRemitente = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !correoDestino || !correoRemitente) {
      console.error("Faltan variables de entorno para el formulario.");

      return responder(
        "El servicio de contacto todavía no está configurado.",
        503,
      );
    }

    const resend = new Resend(apiKey);

    const contenidoTexto = [
      "Nuevo mensaje desde el sitio web del Colegio Yangtsé",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      `Teléfono: ${telefono || "No informado"}`,
      `Asunto: ${asunto}`,
      "",
      "Mensaje:",
      mensaje,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: correoRemitente,
      to: [correoDestino],
      replyTo: email,
      subject: `Contacto web: ${asunto}`,
      text: contenidoTexto,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#252525">
          <h2 style="color:#7d1723">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${escaparHtml(nombre)}</p>
          <p><strong>Correo:</strong> ${escaparHtml(email)}</p>
          <p><strong>Teléfono:</strong> ${
            escaparHtml(telefono) || "No informado"
          }</p>
          <p><strong>Asunto:</strong> ${escaparHtml(asunto)}</p>
          <hr style="border:0;border-top:1px solid #dddddd" />
          <p><strong>Mensaje:</strong></p>
          <p>${escaparHtml(mensaje).replaceAll("\n", "<br />")}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);

      return responder(
        "No fue posible enviar el mensaje. Inténtalo nuevamente.",
        502,
      );
    }

    return responder("Tu mensaje fue enviado correctamente.");
  } catch (error) {
    console.error("Error procesando el formulario:", error);

    return responder(
      "Ocurrió un error inesperado al procesar el mensaje.",
      500,
    );
  }
}

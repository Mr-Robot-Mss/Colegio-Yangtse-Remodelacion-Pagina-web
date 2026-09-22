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

function obtenerTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > 20_000) {
      return NextResponse.json(
        { mensaje: "La solicitud es demasiado grande." },
        { status: 413 },
      );
    }

    const datos = (await request.json()) as DatosContacto;

    const nombre = obtenerTexto(datos.nombre);
    const email = obtenerTexto(datos.email).toLowerCase();
    const telefono = obtenerTexto(datos.telefono);
    const asunto = obtenerTexto(datos.asunto);
    const mensaje = obtenerTexto(datos.mensaje);
    const website = obtenerTexto(datos.website);

    // Los visitantes reales nunca completan este campo.
    if (website) {
      return NextResponse.json({
        mensaje: "Tu mensaje fue enviado correctamente.",
      });
    }

    if (
      nombre.length < 3 ||
      nombre.length > 80 ||
      !emailValido(email) ||
      email.length > 120 ||
      telefono.length > 20 ||
      asunto.length < 2 ||
      asunto.length > 80 ||
      mensaje.length < 10 ||
      mensaje.length > 1500
    ) {
      return NextResponse.json(
        { mensaje: "Revisa los datos ingresados en el formulario." },
        { status: 400 },
      );
    }

    const ip = obtenerIp(request);

    if (excedeLimite(ip)) {
      return NextResponse.json(
        {
          mensaje:
            "Has enviado demasiados mensajes. Inténtalo nuevamente más tarde.",
        },
        { status: 429 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const correoDestino = process.env.CONTACT_TO_EMAIL;
    const correoRemitente = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !correoDestino || !correoRemitente) {
      console.error("Faltan variables de entorno para el formulario.");

      return NextResponse.json(
        { mensaje: "El servicio de contacto todavía no está configurado." },
        { status: 503 },
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

      return NextResponse.json(
        { mensaje: "No fue posible enviar el mensaje. Inténtalo nuevamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      mensaje: "Tu mensaje fue enviado correctamente.",
    });
  } catch (error) {
    console.error("Error procesando el formulario:", error);

    return NextResponse.json(
      { mensaje: "Ocurrió un error inesperado al procesar el mensaje." },
      { status: 500 },
    );
  }
}
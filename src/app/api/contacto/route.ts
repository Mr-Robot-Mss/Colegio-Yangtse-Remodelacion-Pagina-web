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
  turnstileToken?: unknown;
};

type ResultadoTurnstile = {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

const intentos = new Map<
  string,
  { cantidad: number; vence: number }
>();

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
        .replace(
          /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
          "",
        )
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

async function validarTurnstile(
  token: string,
  ip: string,
  secret: string,
): Promise<boolean> {
  try {
    const respuesta = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip === "desconocida" ? undefined : ip,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!respuesta.ok) {
      return false;
    }

    const resultado =
      (await respuesta.json()) as ResultadoTurnstile;

    return resultado.success === true;
  } catch (error) {
    console.error("Error validando Turnstile:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const originEsperado = new URL(request.url).origin;

    if (origin && origin !== originEsperado) {
      return responder("Solicitud no autorizada.", 403);
    }

    const contentType =
      request.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      return responder(
        "El formato de la solicitud no es válido.",
        415,
      );
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0,
    );

    if (contentLength > TAMANO_MAXIMO_SOLICITUD) {
      return responder(
        "La solicitud es demasiado grande.",
        413,
      );
    }

    const cuerpo = await request.text();

    if (cuerpo.length > TAMANO_MAXIMO_SOLICITUD) {
      return responder(
        "La solicitud es demasiado grande.",
        413,
      );
    }

    let datos: DatosContacto;

    try {
      datos = JSON.parse(cuerpo) as DatosContacto;
    } catch {
      return responder(
        "El contenido de la solicitud no es válido.",
        400,
      );
    }

    const nombre = obtenerTexto(datos.nombre);
    const email = obtenerTexto(datos.email).toLowerCase();
    const telefono = obtenerTexto(datos.telefono);
    const asunto = obtenerTexto(datos.asunto);
    const mensaje = obtenerTexto(datos.mensaje);
    const website = obtenerTexto(datos.website);
    const turnstileToken = obtenerTexto(
      datos.turnstileToken,
    );

    // Campo invisible utilizado para detectar bots.
    if (website) {
      return responder(
        "Tu mensaje fue enviado correctamente.",
      );
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
      mensaje.length > 1500 ||
      !turnstileToken ||
      turnstileToken.length > 2048
    ) {
      return responder(
        "Revisa los datos ingresados en el formulario.",
        400,
      );
    }

    const ip = obtenerIp(request);

    if (excedeLimite(ip)) {
      return responder(
        "Has enviado demasiados mensajes. Inténtalo nuevamente más tarde.",
        429,
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const correoDestino =
      process.env.CONTACT_TO_EMAIL;
    const correoRemitente =
      process.env.CONTACT_FROM_EMAIL;
    const turnstileSecret =
      process.env.TURNSTILE_SECRET_KEY;

    if (
      !apiKey ||
      !correoDestino ||
      !correoRemitente ||
      !turnstileSecret
    ) {
      console.error(
        "Faltan variables de entorno para el formulario.",
      );

      return responder(
        "El servicio de contacto todavía no está configurado.",
        503,
      );
    }

    const captchaValido = await validarTurnstile(
      turnstileToken,
      ip,
      turnstileSecret,
    );

    if (!captchaValido) {
      return responder(
        "No fue posible validar la verificación de seguridad. Inténtalo nuevamente.",
        400,
      );
    }

    const resend = new Resend(apiKey);

    const nombreSeguro = escaparHtml(nombre);
    const emailSeguro = escaparHtml(email);
    const telefonoSeguro =
      escaparHtml(telefono) || "No informado";
    const asuntoSeguro = escaparHtml(asunto);
    const mensajeSeguro = escaparHtml(
      mensaje,
    ).replaceAll("\n", "<br />");

    const fechaRecepcion = new Intl.DateTimeFormat(
      "es-CL",
      {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Santiago",
      },
    ).format(new Date());

    const fechaSegura = escaparHtml(fechaRecepcion);

    const enlaceRespuesta =
      `mailto:${encodeURIComponent(email)}` +
      `?subject=${encodeURIComponent(
        `Respuesta del Colegio Yangtsé: ${asunto}`,
      )}`;

    const contenidoTexto = [
      "Nuevo mensaje desde el sitio web del Colegio Yangtsé",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      `Teléfono: ${telefono || "No informado"}`,
      `Motivo: ${asunto}`,
      `Fecha: ${fechaRecepcion}`,
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
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <title>Nuevo mensaje de contacto</title>
          </head>

          <body style="margin:0;padding:0;background:#f4f1ed;font-family:Arial,Helvetica,sans-serif;color:#282322;">
            <div
              style="display:none;max-height:0;overflow:hidden;opacity:0;"
            >
              ${nombreSeguro} envió una consulta sobre
              ${asuntoSeguro}.
            </div>

            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="width:100%;background:#f4f1ed;"
            >
              <tr>
                <td
                  align="center"
                  style="padding:28px 12px;"
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="width:100%;max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(70,22,28,.10);"
                  >
                    <tr>
                      <td
                        style="padding:30px 34px;background:#7d1723;"
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                        >
                          <tr>
                            <td
                              width="58"
                              valign="middle"
                            >
                              <div
                                style="width:50px;height:50px;line-height:50px;text-align:center;border-radius:50%;background:#ffffff;color:#7d1723;font-size:17px;font-weight:700;"
                              >
                                CY
                              </div>
                            </td>

                            <td
                              valign="middle"
                              style="padding-left:12px;color:#ffffff;"
                            >
                              <div
                                style="font-size:20px;font-weight:700;"
                              >
                                Colegio Yangtsé
                              </div>

                              <div
                                style="margin-top:5px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#f4ced3;"
                              >
                                Formulario de contacto
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:34px;">
                        <div
                          style="display:inline-block;padding:7px 12px;border-radius:999px;background:#f9e8ea;color:#7d1723;font-size:12px;font-weight:700;text-transform:uppercase;"
                        >
                          ${asuntoSeguro}
                        </div>

                        <h1
                          style="margin:18px 0 8px;font-size:27px;line-height:1.25;color:#4f1018;"
                        >
                          Nuevo mensaje de contacto
                        </h1>

                        <p
                          style="margin:0 0 26px;font-size:14px;line-height:1.6;color:#746a67;"
                        >
                          Recibido el ${fechaSegura} desde el
                          sitio web institucional.
                        </p>

                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          style="width:100%;border:1px solid #eadfe0;border-radius:12px;border-collapse:separate;overflow:hidden;"
                        >
                          <tr>
                            <td
                              style="width:110px;padding:14px 16px;border-bottom:1px solid #eadfe0;background:#fbf8f5;font-size:13px;font-weight:700;color:#7d1723;"
                            >
                              Nombre
                            </td>

                            <td
                              style="padding:14px 16px;border-bottom:1px solid #eadfe0;font-size:14px;"
                            >
                              ${nombreSeguro}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="width:110px;padding:14px 16px;border-bottom:1px solid #eadfe0;background:#fbf8f5;font-size:13px;font-weight:700;color:#7d1723;"
                            >
                              Correo
                            </td>

                            <td
                              style="padding:14px 16px;border-bottom:1px solid #eadfe0;font-size:14px;"
                            >
                              <a
                                href="mailto:${emailSeguro}"
                                style="color:#7d1723;"
                              >
                                ${emailSeguro}
                              </a>
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="width:110px;padding:14px 16px;border-bottom:1px solid #eadfe0;background:#fbf8f5;font-size:13px;font-weight:700;color:#7d1723;"
                            >
                              Teléfono
                            </td>

                            <td
                              style="padding:14px 16px;border-bottom:1px solid #eadfe0;font-size:14px;"
                            >
                              ${telefonoSeguro}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="width:110px;padding:14px 16px;background:#fbf8f5;font-size:13px;font-weight:700;color:#7d1723;"
                            >
                              Motivo
                            </td>

                            <td
                              style="padding:14px 16px;font-size:14px;"
                            >
                              ${asuntoSeguro}
                            </td>
                          </tr>
                        </table>

                        <div style="margin-top:26px;">
                          <div
                            style="margin-bottom:10px;font-size:13px;font-weight:700;text-transform:uppercase;color:#7d1723;"
                          >
                            Mensaje
                          </div>

                          <div
                            style="padding:20px;border-left:4px solid #b88a3b;border-radius:4px 12px 12px 4px;background:#fbf8f5;font-size:15px;line-height:1.7;word-break:break-word;"
                          >
                            ${mensajeSeguro}
                          </div>
                        </div>

                        <table
                          role="presentation"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          style="margin-top:28px;"
                        >
                          <tr>
                            <td
                              align="center"
                              bgcolor="#7d1723"
                              style="border-radius:10px;"
                            >
                              <a
                                href="${enlaceRespuesta}"
                                style="display:inline-block;padding:14px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;"
                              >
                                Responder a ${nombreSeguro}
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p
                          style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#827875;"
                        >
                          También puedes utilizar “Responder” en
                          tu aplicación de correo.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="padding:18px 34px;background:#f7f2ef;border-top:1px solid #eadfe0;text-align:center;font-size:11px;line-height:1.6;color:#827875;"
                      >
                        Mensaje enviado desde el sitio del
                        Colegio Yangtsé
                        <br />
                        Formulario protegido mediante Cloudflare
                        Turnstile
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);

      return responder(
        "No fue posible enviar el mensaje. Inténtalo nuevamente.",
        502,
      );
    }

    return responder(
      "Tu mensaje fue enviado correctamente.",
    );
  } catch (error) {
    console.error(
      "Error procesando el formulario:",
      error,
    );

    return responder(
      "Ocurrió un error inesperado al procesar el mensaje.",
      500,
    );
  }
}
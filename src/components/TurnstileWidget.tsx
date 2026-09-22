"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => boolean;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  resetSignal: number;
};

export default function TurnstileWidget({
  onTokenChange,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [mensaje, setMensaje] = useState(
    "Cargando verificación de seguridad...",
  );

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    if (
      !scriptReady ||
      !siteKey ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(
      containerRef.current,
      {
        sitekey: siteKey,
        theme: "auto",
        size: "flexible",
        callback: (token) => {
          onTokenChange(token);
          setMensaje("Verificación completada.");
        },
        "expired-callback": () => {
          onTokenChange("");
          setMensaje("La verificación expiró. Inténtalo nuevamente.");
        },
        "error-callback": () => {
          onTokenChange("");
          setMensaje(
            "No fue posible realizar la verificación. Recarga la página.",
          );
          return true;
        },
      },
    );

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, scriptReady, siteKey]);

  useEffect(() => {
    if (
      resetSignal > 0 &&
      widgetIdRef.current &&
      window.turnstile
    ) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenChange("");
      setMensaje("Completa nuevamente la verificación de seguridad.");
    }
  }, [onTokenChange, resetSignal]);

  if (!siteKey) {
    return (
      <div className="turnstile-status turnstile-status--error" role="alert">
        La verificación de seguridad todavía no está configurada.
      </div>
    );
  }

  return (
    <div className="turnstile-wrapper">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() =>
          setMensaje(
            "No se pudo cargar la verificación. Revisa tu conexión.",
          )
        }
      />

      <div ref={containerRef} className="turnstile-widget" />

      <p className="turnstile-status" aria-live="polite">
        {mensaje}
      </p>
    </div>
  );
}

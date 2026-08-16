"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptCaricato: Promise<void> | null = null;

function caricaScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptCaricato) {
    scriptCaricato = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Impossibile caricare la verifica anti-spam."));
      document.head.appendChild(script);
    });
  }
  return scriptCaricato;
}

/**
 * Widget Cloudflare Turnstile per il form di registrazione. Usa l'API
 * esplicita (render/remove) invece di quella implicita perché il token va
 * in uno stato React, non letto da un campo nascosto al momento del submit.
 */
export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const contenitore = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Evita di dover elencare onToken tra le dipendenze: l'effect va montato
  // una volta sola, il callback più recente arriva comunque tramite il ref.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let attivo = true;

    caricaScript().then(() => {
      if (!attivo || !contenitore.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(contenitore.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    });

    return () => {
      attivo = false;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  return <div ref={contenitore} />;
}

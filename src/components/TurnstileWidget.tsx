"use client";

import { useEffect, useRef, useState } from "react";

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
/**
 * I codici che Cloudflare restituisce più spesso, tradotti in una frase utile.
 * Senza questo, un fallimento appare solo come "Verifica non riuscita" e non
 * si capisce se la colpa sia della configurazione o del browser di chi visita.
 */
function spiegaErrore(codice: string): string {
  if (codice.startsWith("1102")) {
    return "Questo indirizzo del sito non è fra quelli autorizzati per la verifica anti-spam.";
  }
  if (codice.startsWith("1100") || codice.startsWith("1101")) {
    return "La chiave della verifica anti-spam non è valida.";
  }
  if (codice.startsWith("3") || codice.startsWith("6")) {
    return "La verifica non è andata a buon fine. Ricarica la pagina e riprova.";
  }
  return "La verifica anti-spam non è riuscita.";
}

export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const contenitore = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [errore, setErrore] = useState<{ testo: string; codice: string } | null>(null);
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
        callback: (token: string) => {
          setErrore(null);
          onTokenRef.current(token);
        },
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": (codice: string) => {
          const c = String(codice ?? "");
          // Il codice distingue un problema di configurazione da uno del
          // visitatore: senza, restano solo tentativi alla cieca.
          console.error("[Turnstile] verifica fallita, codice:", c);
          setErrore({ testo: spiegaErrore(c), codice: c });
          onTokenRef.current(null);
        },
      });
    });

    return () => {
      attivo = false;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  return (
    <div>
      <div ref={contenitore} />
      {errore && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {errore.testo}{" "}
          <span className="text-xs opacity-70">(codice {errore.codice})</span>
        </p>
      )}
    </div>
  );
}

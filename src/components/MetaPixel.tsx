"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const PIXEL_ID = "1546955526432141";
const CHIAVE_CONSENSO = "rc-consenso-meta";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

/**
 * Il codice ufficiale Meta traccia una PageView al caricamento del
 * documento: in un'app Next.js con navigazione lato client (App Router)
 * il documento si carica una sola volta per sessione, quindi da sola
 * quella riga vedrebbe una sola pagina per tutta la visita. Per questo
 * si ritraccia manualmente a ogni cambio di pathname (non al primo
 * montaggio, già coperto dallo script).
 */
function TracciaNavigazione() {
  const pathname = usePathname();
  const primoRendering = useRef(true);

  useEffect(() => {
    if (primoRendering.current) {
      primoRendering.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}

/**
 * Meta Pixel è uno strumento di misurazione pubblicitaria: condivide dati
 * di navigazione con Meta. Per questo non parte da solo al primo
 * caricamento, ma solo dopo che il visitatore ha accettato dal banner qui
 * sotto — coerente con quanto dichiarato nell'informativa privacy.
 */
export default function MetaPixel() {
  const [consenso, setConsenso] = useState<"in_attesa" | "accettato" | "rifiutato">("in_attesa");

  useEffect(() => {
    const salvato = localStorage.getItem(CHIAVE_CONSENSO);
    if (salvato === "accettato" || salvato === "rifiutato") {
      setConsenso(salvato);
    }
  }, []);

  function rispondi(scelta: "accettato" | "rifiutato") {
    localStorage.setItem(CHIAVE_CONSENSO, scelta);
    setConsenso(scelta);
  }

  return (
    <>
      {consenso === "accettato" && (
        <>
          {/* Codice Meta Pixel, invariato salvo il caricamento tramite next/script */}
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
              `,
            }}
          />
          <TracciaNavigazione />
        </>
      )}

      {consenso === "in_attesa" && (
        <div
          role="dialog"
          aria-label="Consenso ai cookie di misurazione"
          className="fixed bottom-0 inset-x-0 z-[60] bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
              Usiamo un pixel di misurazione pubblicitaria (Meta) per capire come funzionano le
              nostre campagne. Si attiva solo se accetti. Vedi l&apos;
              <a
                href="/privacy"
                className="underline underline-offset-2 text-primary-600 dark:text-primary-400"
              >
                informativa privacy
              </a>
              .
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => rispondi("rifiutato")}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Rifiuta
              </button>
              <button
                onClick={() => rispondi("accettato")}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Accetta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Figurine dei segnaposto, come stringhe SVG.
 *
 * Servono in due posti diversi che non possono condividere componenti React:
 * l'anteprima disegnata della pagina iniziale e i segnaposto della mappa vera,
 * che Leaflet costruisce a partire da HTML grezzo. Tenerle qui evita di
 * disegnarle due volte e di farle divergere.
 */

/** Fisioterapista in camice bianco. */
export function svgFisioCamice(dimensione = 34): string {
  return `<svg width="${dimensione}" height="${dimensione}" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#ffffff"/>
    <path d="M6 40c0-8 6.3-12.5 14-12.5S34 32 34 40Z" fill="#f1f5f9"/>
    <path d="M20 27.5 14.5 40h11Z" fill="#ffffff"/>
    <path d="M20 27.5 16 33l4 3 4-3Z" fill="#e2e8f0"/>
    <path d="M15.5 28.5c0 4 2 6 4.5 6s4.5-2 4.5-6" stroke="#14b8a6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="24.5" cy="34.5" r="1.8" fill="#14b8a6"/>
    <circle cx="20" cy="17" r="7.5" fill="#f3c9a6"/>
    <path d="M12.5 15.5c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 7c-1.6-1.4-4.2-2.3-7.5-2.3s-5.9.9-7.5 2.3Z" fill="#4b3b32"/>
  </svg>`;
}

/** Fisioterapista in camicia azzurra. */
export function svgFisioCamicia(dimensione = 34): string {
  return `<svg width="${dimensione}" height="${dimensione}" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#ffffff"/>
    <path d="M6 40c0-8 6.3-12.5 14-12.5S34 32 34 40Z" fill="#7dd3fc"/>
    <path d="M20 27.5 15 30l3 3.5Z" fill="#ffffff"/>
    <path d="M20 27.5 25 30l-3 3.5Z" fill="#ffffff"/>
    <path d="M19.4 33h1.2v7h-1.2Z" fill="#38bdf8"/>
    <circle cx="20" cy="36.5" r="0.8" fill="#0284c7"/>
    <circle cx="20" cy="17" r="7.5" fill="#e8b78f"/>
    <path d="M12.5 15.8c0-4.5 3.4-7.3 7.5-7.3s7.5 2.8 7.5 7.3c-1.1-2.2-3.9-3.4-7.5-3.4s-6.4 1.2-7.5 3.4Z" fill="#2f2a26"/>
  </svg>`;
}

/**
 * Segnaposto del Fisioterapista: la figurina dice chi è, la targhetta quanto dista.
 * `colore` distingue chi arriva fino a casa (verde acqua) da chi no (ambra)
 * e da chi non è disponibile (grigio).
 */
export function htmlSegnaposto(
  distanza: string,
  colore: string,
  figura: "camice" | "camicia"
): string {
  const svg = figura === "camice" ? svgFisioCamice(34) : svgFisioCamicia(34);
  return `<div class="rc-fig">
    <span class="rc-fig-tondo" style="border-color:${colore}">${svg}</span>
    <span class="rc-fig-targa" style="background:${colore}">${distanza}</span>
  </div>`;
}

/**
 * Freccina "Tu sei qui" con il pallino che segna il punto esatto.
 * L'ordine conta: l'alone sta prima del pallino così gli finisce dietro.
 */
export function htmlTuSeiQui(): string {
  return `<div class="rc-qui">
    <span class="rc-qui-testo">Tu sei qui</span>
    <span class="rc-qui-freccia"></span>
    <span class="rc-qui-alone"></span>
    <span class="rc-qui-punto"></span>
  </div>`;
}

/**
 * Misure del segnaposto "Tu sei qui", in pixel. Servono a Leaflet per far
 * cadere il centro del pallino esattamente sulle coordinate, e all'anteprima
 * disegnata per allinearlo allo stesso modo. Se cambiano gli stili in
 * globals.css vanno riviste anche queste.
 */
export const MISURE_TU_SEI_QUI = {
  larghezza: 100,
  altezza: 46,
  /** Distanza dal bordo superiore al centro del pallino. */
  centroPallino: 38,
};

/**
 * Alterna camice e camicia in modo stabile: lo stesso professionista deve
 * comparire sempre con lo stesso vestito, anche cambiando città o filtri.
 */
export function figuraPer(id: string): "camice" | "camicia" {
  let somma = 0;
  for (let i = 0; i < id.length; i++) somma += id.charCodeAt(i);
  return somma % 2 === 0 ? "camice" : "camicia";
}

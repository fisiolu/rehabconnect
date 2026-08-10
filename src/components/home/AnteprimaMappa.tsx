import { Phone, Star } from "lucide-react";

const SEGNAPOSTO = [
  { x: 30, y: 30, etichetta: "800 m", tono: "teal" as const, ritardo: "0s" },
  { x: 68, y: 22, etichetta: "2,4 km", tono: "teal" as const, ritardo: "0.4s" },
  { x: 78, y: 62, etichetta: "5,1 km", tono: "teal" as const, ritardo: "0.8s" },
  { x: 22, y: 70, etichetta: "9 km", tono: "ambra" as const, ritardo: "1.2s" },
];

/**
 * Riproduzione statica della schermata di ricerca, per la pagina iniziale.
 * Non è la mappa vera: serve a far capire in un colpo d'occhio cosa si otterrà,
 * senza chiedere il permesso di geolocalizzazione a chi sta solo guardando.
 */
export default function AnteprimaMappa() {
  return (
    <div className="relative" aria-hidden="true">
      {/* Alone colorato dietro al riquadro */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-primary-200/50 via-teal-200/40 to-transparent dark:from-primary-900/30 dark:via-teal-900/20 blur-2xl rounded-[2.5rem]" />

      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800">
        {/* Barra superiore, come l'app vera */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-gray-700">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-gray-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-gray-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-gray-600" />
          <span className="ml-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Fisioterapisti vicino a te
          </span>
        </div>

        {/* Mappa stilizzata */}
        <div className="relative h-56 sm:h-64 bg-[#eef4f2] dark:bg-gray-900">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Isolati */}
            <g className="fill-white/70 dark:fill-white/5">
              <rect x="4" y="6" width="26" height="22" rx="2" />
              <rect x="36" y="4" width="30" height="18" rx="2" />
              <rect x="72" y="8" width="24" height="26" rx="2" />
              <rect x="6" y="36" width="22" height="26" rx="2" />
              <rect x="34" y="30" width="28" height="30" rx="2" />
              <rect x="70" y="42" width="26" height="22" rx="2" />
              <rect x="8" y="70" width="28" height="24" rx="2" />
              <rect x="44" y="68" width="24" height="26" rx="2" />
              <rect x="76" y="72" width="20" height="22" rx="2" />
            </g>
            {/* Strade principali */}
            <g className="stroke-white dark:stroke-white/10" strokeWidth="3" fill="none">
              <path d="M0 32 H100" />
              <path d="M0 65 H100" />
              <path d="M32 0 V100" />
              <path d="M68 0 V100" />
            </g>
            {/* Corso d'acqua */}
            <path
              d="M-2 84 Q 26 74 48 88 T 102 78"
              className="stroke-sky-200/80 dark:stroke-sky-900/40"
              strokeWidth="6"
              fill="none"
            />
          </svg>

          {/* Il punto "sei qui" */}
          <div className="absolute" style={{ left: "48%", top: "46%" }}>
            <span className="absolute -inset-3 rounded-full bg-primary-500/25 rc-anteprima-alone" />
            <span className="relative block w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-md" />
          </div>

          {/* Segnaposto dei fisioterapisti */}
          {SEGNAPOSTO.map((s) => (
            <span
              key={s.etichetta}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rc-anteprima-pin px-2.5 py-1 rounded-full text-[11px] font-bold text-white border-2 border-white shadow-lg whitespace-nowrap ${
                s.tono === "teal" ? "bg-teal-500" : "bg-amber-500"
              }`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: s.ritardo }}
            >
              {s.etichetta}
            </span>
          ))}
        </div>

        {/* Scheda del fisioterapista, come nell'app vera */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-notte dark:text-white leading-tight">Giulia De Santis</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Riabilitazione ortopedica · Geriatrica
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-teal-600 dark:text-teal-400">
              800 m
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              4,9 · 14 anni di esperienza
            </span>
            <span className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg">
              <Phone size={13} />
              Chiama
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

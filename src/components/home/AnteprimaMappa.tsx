import { Phone, Star } from "lucide-react";
import { FisioCamice, FisioCamicia } from "./Figurine";

const SEGNAPOSTO = [
  { x: 28, y: 26, etichetta: "800 m", tono: "teal" as const, ritardo: "0s", figura: "camice" },
  { x: 70, y: 20, etichetta: "2,4 km", tono: "teal" as const, ritardo: "0.4s", figura: "camicia" },
  { x: 80, y: 60, etichetta: "5,1 km", tono: "teal" as const, ritardo: "0.8s", figura: "camice" },
  { x: 20, y: 68, etichetta: "9 km", tono: "ambra" as const, ritardo: "1.2s", figura: "camicia" },
] as const;

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
          <div
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: "48%", top: "50%" }}
          >
            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-6 -mb-3 rounded-full bg-primary-500/25 rc-anteprima-alone" />
            <span className="relative rc-qui">
              <span className="rc-qui-testo">Tu sei qui</span>
              <span className="rc-qui-freccia" />
            </span>
          </div>

          {/* Segnaposto dei Fisioterapisti: la figurina dice chi è, la targhetta quanto dista */}
          {SEGNAPOSTO.map((s) => (
            <span
              key={s.etichetta}
              className="absolute -translate-x-1/2 -translate-y-1/2 rc-anteprima-pin flex flex-col items-center"
              style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: s.ritardo }}
            >
              <span
                className={`block rounded-full border-2 shadow-lg overflow-hidden ${
                  s.tono === "teal" ? "border-teal-500" : "border-amber-500"
                }`}
              >
                {s.figura === "camice" ? (
                  <FisioCamice dimensione={34} />
                ) : (
                  <FisioCamicia dimensione={34} />
                )}
              </span>
              <span
                className={`-mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white border-2 border-white shadow whitespace-nowrap ${
                  s.tono === "teal" ? "bg-teal-500" : "bg-amber-500"
                }`}
              >
                {s.etichetta}
              </span>
            </span>
          ))}
        </div>

        {/* Scheda del Fisioterapista, come nell'app vera */}
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

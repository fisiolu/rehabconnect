"use client";

import { Appuntamento, Valutazione } from "@/lib/demoData";

interface Props {
  appuntamenti: Appuntamento[];
  valutazioni: Valutazione[];
}

export default function GraficoRiabilitazione({ appuntamenti, valutazioni }: Props) {
  const totale = appuntamenti.length;
  const completate = appuntamenti.filter((a) => a.completato).length;
  const percentuale = totale > 0 ? Math.round((completate / totale) * 100) : 0;

  const mediaStelle =
    valutazioni.length > 0
      ? valutazioni.reduce((s, v) => s + v.stelle, 0) / valutazioni.length
      : 0;

  const r = 44;
  const circ = 2 * Math.PI * r;
  const arco = (percentuale / 100) * circ;
  const offset = circ - arco;

  const ultime = [...appuntamenti]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  return (
    <div className="card">
      <h3 className="text-base font-semibold mb-4">📊 Progresso riabilitazione</h3>

      <div className="flex items-center gap-6 mb-5">
        {/* Anello SVG */}
        <div className="shrink-0">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:[stroke:#374151]" />
            <circle
              cx="55" cy="55" r={r} fill="none"
              stroke={percentuale >= 80 ? "#16a34a" : percentuale >= 50 ? "#2563eb" : "#f59e0b"}
              strokeWidth="10"
              strokeDasharray={`${arco} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor" className="fill-gray-800 dark:fill-gray-100">
              {percentuale}%
            </text>
            <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#6b7280">
              completato
            </text>
          </svg>
        </div>

        {/* Statistiche */}
        <div className="flex-1 space-y-2.5">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sedute effettuate</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${percentuale}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                {completate}/{totale}
              </span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rimanenti</p>
              <p className="font-bold text-orange-500">{totale - completate}</p>
            </div>
            {mediaStelle > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Valutazione media</p>
                <p className="font-bold text-yellow-500">
                  {"★".repeat(Math.round(mediaStelle))}{"☆".repeat(5 - Math.round(mediaStelle))}{" "}
                  <span className="text-gray-600 dark:text-gray-400 text-xs font-normal">
                    ({mediaStelle.toFixed(1)})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline ultime sedute */}
      {ultime.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Ultime sedute</p>
          <div className="space-y-1.5">
            {ultime.map((a) => {
              const val = valutazioni.find((v) => v.appuntamentoId === a.id);
              return (
                <div key={a.id} className="flex items-center gap-3 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${a.completato ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                  <span className={`flex-1 ${a.completato ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                    {new Date(a.data).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} ore {a.ora}
                  </span>
                  {a.completato && val && (
                    <span className="text-yellow-500 shrink-0">
                      {"★".repeat(val.stelle)}
                    </span>
                  )}
                  {a.completato && !val && (
                    <span className="text-gray-300 dark:text-gray-600 shrink-0 text-xs">✓</span>
                  )}
                  {!a.completato && (
                    <span className="text-blue-400 dark:text-blue-500 shrink-0">programmata</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

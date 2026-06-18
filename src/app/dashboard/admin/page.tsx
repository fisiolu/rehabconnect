"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatoBadge from "@/components/StatoBadge";
import Link from "next/link";
import { pazienti, medici, fisioterapisti, StatoRichiesta, statoLabel } from "@/lib/demoData";

type Sezione = "panoramica" | "richieste" | "utenti";

export default function DashboardAdmin() {
  const { utente, richieste } = useApp();
  const router = useRouter();
  const [sezione, setSezione] = useState<Sezione>("panoramica");
  const [filtroStato, setFiltroStato] = useState<StatoRichiesta | "tutte">("tutte");

  useEffect(() => {
    if (!utente || utente.ruolo !== "admin") router.push("/");
  }, [utente, router]);

  if (!utente || utente.ruolo !== "admin") return null;

  const stati: StatoRichiesta[] = [
    "in_attesa", "in_valutazione", "assegnata", "in_corso", "completata", "rifiutata",
  ];

  const richiestaFiltrate =
    filtroStato === "tutte"
      ? richieste
      : richieste.filter((r) => r.stato === filtroStato);

  const kpi = {
    richiesteTotali: richieste.length,
    richiesteAttive: richieste.filter((r) =>
      ["in_attesa", "in_valutazione", "assegnata", "in_corso"].includes(r.stato)
    ).length,
    pazientiTotali: pazienti.length,
    fisDisponibili: fisioterapisti.filter((f) => f.disponibile).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Intestazione */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              ⚙️
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">Pannello Amministratore</h1>
              <p className="text-gray-500 text-sm">Supervisione piattaforma RehabConnect</p>
            </div>
            <Link
              href="/mappa"
              className="shrink-0 btn-secondary text-sm py-2 flex items-center gap-1.5"
            >
              🗺️ Mappa
            </Link>
          </div>
        </div>

        {/* Navigazione sezioni */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { id: "panoramica", label: "📊 Panoramica" },
            { id: "richieste", label: "📋 Richieste" },
            { id: "utenti", label: "👥 Utenti" },
          ] as { id: Sezione; label: string }[]).map((s) => (
            <button
              key={s.id}
              onClick={() => setSezione(s.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                sezione === s.id
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Panoramica */}
        {sezione === "panoramica" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Richieste totali", valore: kpi.richiesteTotali, icona: "📋", colore: "text-blue-600" },
                { label: "Richieste attive", valore: kpi.richiesteAttive, icona: "⏳", colore: "text-yellow-600" },
                { label: "Pazienti registrati", valore: kpi.pazientiTotali, icona: "🧑‍🦽", colore: "text-green-600" },
                { label: "Fisio disponibili", valore: kpi.fisDisponibili, icona: "🏥", colore: "text-purple-600" },
              ].map((k) => (
                <div key={k.label} className="card text-center">
                  <div className="text-2xl mb-1">{k.icona}</div>
                  <div className={`text-2xl font-bold ${k.colore}`}>{k.valore}</div>
                  <div className="text-xs text-gray-500 mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-3">Distribuzione per stato</h2>
              <div className="card space-y-3">
                {stati.map((s) => {
                  const n = richieste.filter((r) => r.stato === s).length;
                  const perc = richieste.length ? Math.round((n / richieste.length) * 100) : 0;
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{statoLabel[s]}</span>
                        <span className="font-medium">{n}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-3">Ultime richieste</h2>
              <div className="space-y-2">
                {[...richieste]
                  .sort((a, b) => (b.dataCreazione > a.dataCreazione ? 1 : -1))
                  .slice(0, 5)
                  .map((r) => {
                    const paz = pazienti.find((p) => p.id === r.pazienteId);
                    return (
                      <div key={r.id} className="card flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {paz?.nome} {paz?.cognome} — {r.patologia}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(r.dataCreazione).toLocaleDateString("it-IT")}
                          </p>
                        </div>
                        <StatoBadge stato={r.stato} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Tutte le richieste */}
        {sezione === "richieste" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroStato("tutte")}
                className={`badge cursor-pointer transition-colors ${
                  filtroStato === "tutte"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tutte ({richieste.length})
              </button>
              {stati.map((s) => {
                const n = richieste.filter((r) => r.stato === s).length;
                if (n === 0) return null;
                return (
                  <button
                    key={s}
                    onClick={() => setFiltroStato(s)}
                    className={`badge cursor-pointer transition-colors ${
                      filtroStato === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {statoLabel[s]} ({n})
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {richiestaFiltrate.map((r) => {
                const paz = pazienti.find((p) => p.id === r.pazienteId);
                const med = medici.find((m) => m.id === r.medicoId);
                const fis = fisioterapisti.find((f) => f.id === r.fisioterapistaId);
                return (
                  <div key={r.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">
                            {paz?.nome} {paz?.cognome}
                          </span>
                          {r.urgenza === "urgente" && (
                            <span className="badge bg-red-100 text-red-700 text-xs">Urgente</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{r.patologia}</p>
                        <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                          <p>Medico: Dr.ssa {med?.cognome}</p>
                          {fis && <p>Fisio: {fis.nome} {fis.cognome}</p>}
                          <p>
                            {r.tipoIntervento} ·{" "}
                            {new Date(r.dataCreazione).toLocaleDateString("it-IT")}
                          </p>
                        </div>
                      </div>
                      <StatoBadge stato={r.stato} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gestione utenti */}
        {sezione === "utenti" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3">Pazienti ({pazienti.length})</h2>
              <div className="space-y-2">
                {pazienti.map((p) => {
                  const med = medici.find((m) => m.id === p.medicoId);
                  const nRichieste = richieste.filter((r) => r.pazienteId === p.id).length;
                  return (
                    <div key={p.id} className="card flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        🧑‍🦽
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {p.nome} {p.cognome}
                        </p>
                        <p className="text-xs text-gray-400">
                          Medico: Dr.ssa {med?.cognome} · {nRichieste} richieste
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-3">Medici ({medici.length})</h2>
              <div className="space-y-2">
                {medici.map((m) => {
                  const nRichieste = richieste.filter((r) => r.medicoId === m.id).length;
                  return (
                    <div key={m.id} className="card flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          Dr.ssa {m.nome} {m.cognome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.ambulatorio} · {nRichieste} richieste gestite
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-3">Fisioterapisti ({fisioterapisti.length})</h2>
              <div className="space-y-2">
                {fisioterapisti.map((f) => {
                  const nIncarichi = richieste.filter(
                    (r) => r.fisioterapistaId === f.id
                  ).length;
                  return (
                    <div key={f.id} className="card flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        🏥
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {f.nome} {f.cognome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {f.specializzazione} · ★{f.valutazione} · {nIncarichi} incarichi
                        </p>
                      </div>
                      <span
                        className={`badge text-xs ${
                          f.disponibile
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {f.disponibile ? "Disponibile" : "Occupato"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

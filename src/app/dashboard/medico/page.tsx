"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatoBadge from "@/components/StatoBadge";
import Link from "next/link";
import { pazienti, fisioterapisti, medici, StatoRichiesta } from "@/lib/demoData";

type Filtro = "tutte" | "da_gestire" | "assegnate";

export default function DashboardMedico() {
  const { utente, richieste, aggiornaRichiesta, addToast } = useApp();
  const router = useRouter();
  const [richiestaAperta, setRichiestaAperta] = useState<string | null>(null);
  const [notaMedico, setNotaMedico] = useState("");
  const [fisSelezionato, setFisSelezionato] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("tutte");
  const [salvataggio, setSalvataggio] = useState(false);

  if (!utente || utente.ruolo !== "medico") {
    router.push("/");
    return null;
  }

  const medico = medici.find((m) => m.id === utente.id);
  const mieRichieste = richieste.filter((r) => r.medicoId === utente.id);
  const fisDisponibili = fisioterapisti.filter((f) => f.disponibile);

  const richiesteFiltrate = mieRichieste.filter((r) => {
    if (filtro === "da_gestire") return ["in_attesa", "in_valutazione"].includes(r.stato);
    if (filtro === "assegnate") return ["assegnata", "in_corso", "completata"].includes(r.stato);
    return true;
  });

  const urgenti = mieRichieste.filter(
    (r) => r.urgenza === "urgente" && ["in_attesa", "in_valutazione"].includes(r.stato)
  );

  const statistiche = {
    totale: mieRichieste.length,
    inAttesa: mieRichieste.filter((r) => r.stato === "in_attesa").length,
    inValutazione: mieRichieste.filter((r) => r.stato === "in_valutazione").length,
    assegnate: mieRichieste.filter((r) => ["assegnata", "in_corso"].includes(r.stato)).length,
  };

  function apriRichiesta(id: string) {
    setRichiestaAperta(id);
    const r = richieste.find((r) => r.id === id);
    setNotaMedico(r?.noteMedico ?? "");
    setFisSelezionato(r?.fisioterapistaId ?? "");
  }

  async function assegna(richiestaId: string) {
    if (!fisSelezionato) return;
    setSalvataggio(true);
    await new Promise((r) => setTimeout(r, 500));
    const fis = fisioterapisti.find((f) => f.id === fisSelezionato);
    aggiornaRichiesta(richiestaId, {
      stato: "assegnata" as StatoRichiesta,
      fisioterapistaId: fisSelezionato,
      noteMedico: notaMedico,
    });
    addToast(`Richiesta assegnata a ${fis?.nome} ${fis?.cognome}`, "successo");
    setSalvataggio(false);
    setRichiestaAperta(null);
  }

  function mettInValutazione(richiestaId: string) {
    aggiornaRichiesta(richiestaId, { stato: "in_valutazione" as StatoRichiesta });
  }

  const richiesta = richieste.find((r) => r.id === richiestaAperta);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Intestazione medico */}
        <div className="card bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              👨‍⚕️
            </div>
            <div>
              <h1 className="text-xl font-bold">Dr.ssa {medico?.cognome}</h1>
              <p className="text-green-100 text-sm">{medico?.ambulatorio}</p>
            </div>
          </div>
        </div>

        {/* Alert urgenze */}
        {urgenti.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="font-semibold text-red-800 mb-2">
              🚨 {urgenti.length} richiesta{urgenti.length > 1 ? "e" : ""} urgente{urgenti.length > 1 ? "i" : ""} da gestire
            </p>
            <div className="space-y-1">
              {urgenti.map((r) => {
                const paz = pazienti.find((p) => p.id === r.pazienteId);
                return (
                  <button
                    key={r.id}
                    onClick={() => { mettInValutazione(r.id); apriRichiesta(r.id); }}
                    className="text-sm text-red-700 hover:text-red-900 font-medium block"
                  >
                    → {paz?.nome} {paz?.cognome} — {r.patologia}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistiche */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Totali", valore: statistiche.totale, colore: "text-gray-700" },
            { label: "In attesa", valore: statistiche.inAttesa, colore: "text-yellow-600" },
            { label: "In valutazione", valore: statistiche.inValutazione, colore: "text-blue-600" },
            { label: "Assegnate", valore: statistiche.assegnate, colore: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="card text-center py-3">
              <div className={`text-2xl font-bold ${s.colore}`}>{s.valore}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pannello dettaglio richiesta */}
        {richiesta && (
          <div className="card border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2>Valutazione richiesta</h2>
              <button
                onClick={() => setRichiestaAperta(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            {(() => {
              const paz = pazienti.find((p) => p.id === richiesta.pazienteId);
              return (
                <div className="space-y-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="font-semibold text-gray-900">
                      {paz?.nome} {paz?.cognome}
                    </p>
                    <p className="text-gray-500 text-xs">{paz?.indirizzo}</p>
                    <p className="text-gray-500 text-xs">{paz?.telefono}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <span className="font-medium text-blue-700">Patologia</span>
                      <p className="text-gray-700 mt-0.5">{richiesta.patologia}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${richiesta.urgenza === "urgente" ? "bg-red-50" : "bg-gray-50"}`}>
                      <span className={`font-medium ${richiesta.urgenza === "urgente" ? "text-red-700" : "text-gray-600"}`}>
                        Urgenza
                      </span>
                      <p className={`mt-0.5 font-semibold ${richiesta.urgenza === "urgente" ? "text-red-800" : "text-gray-700"}`}>
                        {richiesta.urgenza === "urgente" ? "🚨 Urgente" : "Normale"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Descrizione:</span>
                    <p className="text-gray-600 mt-1">{richiesta.descrizione}</p>
                  </div>

                  <div>
                    <label className="label">Note cliniche per il fisioterapista</label>
                    <textarea
                      className="input-field min-h-[70px] resize-none"
                      placeholder="Indicazioni cliniche, controindicazioni, obiettivi riabilitativi..."
                      value={notaMedico}
                      onChange={(e) => setNotaMedico(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">
                      Assegna a fisioterapista{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="input-field"
                      value={fisSelezionato}
                      onChange={(e) => setFisSelezionato(e.target.value)}
                    >
                      <option value="">— Seleziona fisioterapista —</option>
                      {fisDisponibili.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome} {f.cognome} — {f.specializzazione} (★ {f.valutazione})
                        </option>
                      ))}
                    </select>
                    {fisDisponibili.length === 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        Nessun fisioterapista disponibile al momento.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => assegna(richiesta.id)}
                      disabled={!fisSelezionato || salvataggio}
                      className="btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {salvataggio ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Assegnazione...
                        </>
                      ) : (
                        "Assegna"
                      )}
                    </button>
                    <button onClick={() => setRichiestaAperta(null)} className="btn-secondary">
                      Annulla
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Filtri */}
        <div>
          <div className="flex gap-2 mb-4">
            {([
              { id: "tutte", label: "Tutte" },
              { id: "da_gestire", label: "Da gestire" },
              { id: "assegnate", label: "Assegnate" },
            ] as { id: Filtro; label: string }[]).map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Elenco richieste */}
          <div className="space-y-3">
            {richiesteFiltrate.length === 0 ? (
              <div className="card text-center text-gray-400 py-10">
                <div className="text-4xl mb-2">📋</div>
                <p>Nessuna richiesta in questa categoria.</p>
              </div>
            ) : (
              richiesteFiltrate
                .sort((a, b) => {
                  if (a.urgenza === "urgente" && b.urgenza !== "urgente") return -1;
                  if (b.urgenza === "urgente" && a.urgenza !== "urgente") return 1;
                  return b.dataCreazione.localeCompare(a.dataCreazione);
                })
                .map((r) => {
                  const paz = pazienti.find((p) => p.id === r.pazienteId);
                  const fis = fisioterapisti.find((f) => f.id === r.fisioterapistaId);
                  return (
                    <div
                      key={r.id}
                      className={`card hover:shadow-md transition-shadow ${
                        r.urgenza === "urgente" && ["in_attesa","in_valutazione"].includes(r.stato)
                          ? "border-l-4 border-l-red-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold">
                              {paz?.nome} {paz?.cognome}
                            </span>
                            {r.urgenza === "urgente" && (
                              <span className="badge bg-red-100 text-red-700">🚨 Urgente</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{r.patologia}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {r.tipoIntervento === "domiciliare" ? "🏠" : "🏥"}{" "}
                            {r.tipoIntervento} ·{" "}
                            {new Date(r.dataCreazione).toLocaleDateString("it-IT")}
                          </p>
                          {fis && (
                            <p className="text-xs text-blue-600 mt-1">
                              → {fis.nome} {fis.cognome}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <StatoBadge stato={r.stato} />
                          {r.stato === "in_attesa" && (
                            <button
                              onClick={() => { mettInValutazione(r.id); apriRichiesta(r.id); }}
                              className="text-xs btn-primary py-1 px-3"
                            >
                              Valuta
                            </button>
                          )}
                          {r.stato === "in_valutazione" && (
                            <button
                              onClick={() => apriRichiesta(r.id)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg text-xs font-medium transition-colors"
                            >
                              Assegna
                            </button>
                          )}
                          <Link
                            href={`/chat/${r.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            💬 Chat
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

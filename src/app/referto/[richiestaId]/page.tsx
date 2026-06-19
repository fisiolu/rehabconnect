"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter, useParams } from "next/navigation";
import { pazienti, medici, fisioterapisti } from "@/lib/demoData";
import Link from "next/link";

export default function PaginaReferto() {
  const { utente, richieste, valutazioni } = useApp();
  const router = useRouter();
  const params = useParams();
  const richiestaId = params.richiestaId as string;

  useEffect(() => {
    if (!utente) router.push("/");
  }, [utente, router]);

  if (!utente) return null;

  const richiesta = richieste.find((r) => r.id === richiestaId);
  if (!richiesta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Richiesta non trovata.</p>
          <Link href="/" className="text-blue-600 hover:underline">Torna alla home</Link>
        </div>
      </div>
    );
  }

  const paziente = pazienti.find((p) => p.id === richiesta.pazienteId);
  const medico = medici.find((m) => m.id === richiesta.medicoId);
  const fisio = fisioterapisti.find((f) => f.id === richiesta.fisioterapistaId);
  const appCompletati = richiesta.appuntamenti.filter((a) => a.completato);
  const valutazioniRichiesta = valutazioni.filter((v) => v.richiestaId === richiesta.id);
  const mediaStelle = valutazioniRichiesta.length > 0
    ? valutazioniRichiesta.reduce((s, v) => s + v.stelle, 0) / valutazioniRichiesta.length
    : null;

  const oggi = new Date().toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Toolbar stampa (nascosta in stampa) */}
      <div className="no-print max-w-3xl mx-auto px-4 mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1.5 text-sm"
        >
          ← Indietro
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900 dark:text-gray-100">Referto medico</h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Stampa / PDF
        </button>
      </div>

      {/* Documento referto */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 space-y-6">

          {/* Intestazione */}
          <div className="flex items-start justify-between pb-5 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔗</span>
                <span className="text-xl font-bold text-blue-600">RehabConnect</span>
              </div>
              <p className="text-xs text-gray-400">Piattaforma di riabilitazione domiciliare</p>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">REFERTO CLINICO</p>
              <p>Data: {oggi}</p>
              <p>Pratica: {richiesta.id.toUpperCase()}</p>
            </div>
          </div>

          {/* Dati paziente */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Dati paziente
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nome e cognome</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{paziente?.nome} {paziente?.cognome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Data di nascita</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {paziente?.dataNascita ? new Date(paziente.dataNascita).toLocaleDateString("it-IT") : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Codice fiscale</p>
                <p className="font-medium text-gray-700 dark:text-gray-300 font-mono">{paziente?.codiceFiscale}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Indirizzo</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{paziente?.indirizzo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Telefono</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{paziente?.telefono}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{paziente?.email}</p>
              </div>
            </div>
          </section>

          {/* Diagnosi e intervento */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Diagnosi e piano terapeutico
            </h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Patologia</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{richiesta.patologia}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tipo intervento</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {richiesta.tipoIntervento === "domiciliare" ? "🏠 Domiciliare" : "🏥 In studio"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Urgenza</p>
                  <p className={`font-medium ${richiesta.urgenza === "urgente" ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                    {richiesta.urgenza === "urgente" ? "🚨 Urgente" : "Normale"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Data prescrizione</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {new Date(richiesta.dataCreazione).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Descrizione clinica</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{richiesta.descrizione}</p>
              </div>
              {richiesta.noteMedico && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Note cliniche del medico</p>
                  <p className="text-blue-800 dark:text-blue-300 text-sm">{richiesta.noteMedico}</p>
                </div>
              )}
            </div>
          </section>

          {/* Medico prescrittore */}
          {medico && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Medico prescrittore
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Dr.ssa {medico.cognome} {medico.nome}</p>
                  <p className="text-gray-500 dark:text-gray-400">{medico.specializzazione} · {medico.ambulatorio}</p>
                </div>
              </div>
            </section>
          )}

          {/* Fisioterapista */}
          {fisio && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Fisioterapista assegnato
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{fisio.nome} {fisio.cognome}</p>
                  <p className="text-gray-500 dark:text-gray-400">{fisio.specializzazione} · ★ {fisio.valutazione}</p>
                </div>
              </div>
              {richiesta.noteFisioterapista && (
                <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">Note del fisioterapista</p>
                  <p className="text-purple-800 dark:text-purple-300 text-sm">{richiesta.noteFisioterapista}</p>
                </div>
              )}
            </section>
          )}

          {/* Storico sedute */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Sedute effettuate ({appCompletati.length} / {richiesta.appuntamenti.length})
            </h2>
            {appCompletati.length === 0 ? (
              <p className="text-sm text-gray-400">Nessuna seduta completata.</p>
            ) : (
              <div className="space-y-1.5">
                {appCompletati.map((a, i) => {
                  const val = valutazioniRichiesta.find((v) => v.appuntamentoId === a.id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-gray-400 dark:text-gray-500 text-xs tabular-nums w-5 text-right">{i + 1}.</span>
                      <span className="flex-1 text-gray-700 dark:text-gray-300">
                        {new Date(a.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — ore {a.ora} ({a.durata} min)
                      </span>
                      {val && (
                        <span className="text-yellow-500 shrink-0 text-xs">
                          {"★".repeat(val.stelle)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {mediaStelle !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Valutazione media paziente: <span className="font-semibold text-yellow-500">★ {mediaStelle.toFixed(1)}/5</span>
              </p>
            )}
          </section>

          {/* Firma */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end text-xs text-gray-400">
            <div>
              <p>Documento generato da RehabConnect</p>
              <p>Solo per uso dimostrativo — nessun dato reale</p>
            </div>
            <div className="text-right">
              <p className="mb-4">Firma del medico</p>
              <div className="w-32 border-b border-gray-400" />
              {medico && <p className="mt-1">Dr.ssa {medico.cognome}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

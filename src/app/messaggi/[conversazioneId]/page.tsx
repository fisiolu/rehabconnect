"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fisioterapisti, pazienti } from "@/lib/demoData";

export default function ConversazionePage() {
  const { conversazioneId } = useParams<{ conversazioneId: string }>();
  const router = useRouter();
  const {
    utente,
    conversazioni,
    messaggiDiretti,
    inviaMessaggioDiretto,
    segnaConversazioneLetta,
  } = useApp();

  const [bozza, setBozza] = useState("");
  const fondo = useRef<HTMLDivElement>(null);

  const conversazione = conversazioni.find((c) => c.id === conversazioneId);

  const messaggi = useMemo(
    () =>
      messaggiDiretti
        .filter((m) => m.conversazioneId === conversazioneId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [messaggiDiretti, conversazioneId]
  );

  // Chi non c'entra con questa conversazione non deve poterla leggere.
  const autorizzato =
    !!utente &&
    !!conversazione &&
    ((utente.ruolo === "paziente" && utente.id === conversazione.pazienteId) ||
      (utente.ruolo === "fisioterapista" && utente.id === conversazione.fisioterapistaId));

  useEffect(() => {
    if (!utente) router.replace("/");
  }, [utente, router]);

  useEffect(() => {
    if (autorizzato && utente) segnaConversazioneLetta(conversazioneId, utente.id);
  }, [autorizzato, utente, conversazioneId, segnaConversazioneLetta]);

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi.length]);

  if (!utente) return null;

  if (!conversazione || !autorizzato) {
    return (
      <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-notte dark:text-white mb-2">
            Conversazione non disponibile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Questa conversazione non esiste, oppure non è tua.
          </p>
          <Link
            href="/messaggi"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Torna ai messaggi
          </Link>
        </div>
      </div>
    );
  }

  const fisio = fisioterapisti.find((f) => f.id === conversazione.fisioterapistaId);
  const paziente = pazienti.find((p) => p.id === conversazione.pazienteId);
  const sonoPaziente = utente.ruolo === "paziente";

  // Il paziente vede il fisioterapista, e viceversa.
  const controparte = sonoPaziente
    ? { nome: fisio ? `${fisio.nome} ${fisio.cognome}` : "Fisioterapista", sottotitolo: fisio?.specializzazioni.join(" · ") ?? "", telefono: fisio?.telefono }
    : { nome: paziente ? `${paziente.nome} ${paziente.cognome}` : "Paziente", sottotitolo: paziente?.indirizzo ?? "", telefono: paziente?.telefono };

  function invia(e: React.FormEvent) {
    e.preventDefault();
    const testo = bozza.trim();
    if (!testo || !utente) return;
    inviaMessaggioDiretto(
      conversazioneId,
      utente.id,
      sonoPaziente ? "paziente" : "fisioterapista",
      testo
    );
    setBozza("");
  }

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/messaggi"
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-notte hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Torna all'elenco dei messaggi"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-notte dark:text-white leading-tight truncate">
              {controparte.nome}
            </h1>
            {controparte.sottotitolo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {controparte.sottotitolo}
              </p>
            )}
          </div>
          {controparte.telefono && (
            <a
              href={`tel:${controparte.telefono.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary-100 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Phone size={16} aria-hidden="true" />
              Chiama
            </a>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
          {messaggi.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">
              Nessun messaggio. Scrivi tu il primo.
            </p>
          )}

          {messaggi.map((m) => {
            const mio = m.mittenteId === utente.id;
            return (
              <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                    mio
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-gray-700 rounded-bl-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.testo}</p>
                  <p
                    className={`text-[11px] mt-1.5 ${
                      mio ? "text-primary-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={fondo} />
        </div>
      </div>

      <form
        onSubmit={invia}
        className="bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 sticky bottom-0"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-end gap-2">
          <label htmlFor="messaggio" className="sr-only">
            Scrivi un messaggio
          </label>
          <textarea
            id="messaggio"
            value={bozza}
            onChange={(e) => setBozza(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                invia(e);
              }
            }}
            rows={1}
            placeholder="Scrivi un messaggio…"
            className="input-field flex-1 py-3 resize-none max-h-32"
          />
          <button
            type="submit"
            disabled={!bozza.trim()}
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Send size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Invia</span>
          </button>
        </div>
      </form>
    </div>
  );
}

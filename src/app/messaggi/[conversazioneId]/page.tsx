"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { risposteFor } from "@/lib/risposteRapide";
import DettaturaVocale from "@/components/DettaturaVocale";
import { createClient } from "@/lib/supabase/client";
import {
  caricaControparte,
  caricaMessaggi,
  inviaMessaggioDiretto,
  segnaConversazioneLetta,
  type Controparte,
  type MessaggioDirettoRiga,
} from "@/lib/supabase/conversazioni";

export default function ConversazionePage() {
  const { conversazioneId } = useParams<{ conversazioneId: string }>();
  const router = useRouter();
  const { utente } = useApp();

  const [bozza, setBozza] = useState("");
  const fondo = useRef<HTMLDivElement>(null);

  const [caricato, setCaricato] = useState(false);
  const [controparte, setControparte] = useState<Controparte | null>(null);
  const [messaggi, setMessaggi] = useState<MessaggioDirettoRiga[]>([]);

  useEffect(() => {
    if (!utente) router.replace("/");
  }, [utente, router]);

  const sonoPaziente = utente?.ruolo === "paziente";

  const ricarica = useCallback(async () => {
    if (!utente || (utente.ruolo !== "paziente" && utente.ruolo !== "fisioterapista")) return;
    const supabase = createClient();

    // La RLS restituisce la riga solo se sei uno dei due partecipanti:
    // niente trovata = non esiste, oppure non è tua. Stessa schermata per
    // entrambi i casi, senza doverli distinguere.
    const { data: conversazione } = await supabase
      .from("conversazioni")
      .select("id, paziente_id, fisioterapista_id")
      .eq("id", conversazioneId)
      .maybeSingle();

    if (!conversazione) {
      setCaricato(true);
      return;
    }

    const controparteId = sonoPaziente
      ? conversazione.fisioterapista_id
      : conversazione.paziente_id;

    const [c, m] = await Promise.all([
      caricaControparte(supabase, !!sonoPaziente, controparteId),
      caricaMessaggi(supabase, conversazioneId),
    ]);
    setControparte(c);
    setMessaggi(m);
    setCaricato(true);

    if (m.some((msg) => !msg.letto && msg.mittente_id !== utente.id)) {
      await segnaConversazioneLetta(supabase, conversazioneId, utente.id);
    }
  }, [utente, conversazioneId, sonoPaziente]);

  useEffect(() => {
    ricarica();
  }, [ricarica]);

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi.length]);

  if (!utente) return null;

  if (!caricato) return null;

  if (!controparte) {
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

  async function inviaTesto(testo: string) {
    const pulito = testo.trim();
    if (!pulito || !utente) return;
    const supabase = createClient();
    await inviaMessaggioDiretto(
      supabase,
      conversazioneId,
      utente.id,
      sonoPaziente ? "paziente" : "fisioterapista",
      pulito
    );
    setBozza("");
    ricarica();
  }

  function invia(e: React.FormEvent) {
    e.preventDefault();
    inviaTesto(bozza);
  }

  /** Il testo dettato si aggiunge a quello già presente, non lo sostituisce. */
  function aggiungiDettato(testo: string) {
    setBozza((prima) => (prima ? `${prima} ${testo}` : testo));
  }

  const risposte = risposteFor(
    sonoPaziente ? "paziente" : "fisioterapista",
    messaggi.length === 0
  );

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-notte hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Torna indietro"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-notte dark:text-white leading-tight truncate">
              {controparte.nome} {controparte.cognome}
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
            const mio = m.mittente_id === utente.id;
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

      <div className="bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 sticky bottom-0">
        {/* Avviso sui dati sanitari: la chat è il punto in cui un paziente
            scriverebbe la propria patologia, che per il Regolamento europeo
            è un dato particolare. Sta sopra il campo di scrittura, dove si
            legge prima di scrivere, non sepolto nell'informativa. */}
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2">
            Non inserire referti, diagnosi, immagini cliniche o altri dati sulla salute che non
            siano necessari. La chat non è un servizio di emergenza e non sostituisce una
            valutazione sanitaria: in caso di urgenza chiama il <strong>112</strong>.{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 text-primary-600 dark:text-primary-400"
            >
              Informativa privacy
            </Link>
          </p>
        </div>

        {/* Frasi pronte: un tocco al posto di digitare su una tastiera piccola */}
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {risposte.map((frase) => (
              <li key={frase}>
                <button
                  type="button"
                  onClick={() => inviaTesto(frase)}
                  className="whitespace-nowrap px-3.5 py-2 rounded-full bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-200 text-sm font-medium border border-primary-100 dark:border-gray-600 hover:bg-primary-100 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {frase}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={invia}>
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
            placeholder="Scrivi, oppure detta col microfono…"
            className="input-field flex-1 py-3.5 text-base resize-none max-h-32"
          />
          <DettaturaVocale onTesto={aggiungiDettato} />
          <button
            type="submit"
            disabled={!bozza.trim()}
            aria-label="Invia il messaggio"
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold h-[52px] px-5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Send size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Invia</span>
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

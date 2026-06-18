"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import StatoBadge from "@/components/StatoBadge";
import { pazienti, medici, fisioterapisti, Messaggio } from "@/lib/demoData";

const ruoloBolla: Record<string, string> = {
  paziente: "bg-blue-100 text-blue-900",
  medico: "bg-green-100 text-green-900",
  fisioterapista: "bg-purple-100 text-purple-900",
  admin: "bg-gray-100 text-gray-900",
};

const ruoloBollaPropia = "bg-blue-600 text-white";

const ruoloTag: Record<string, string> = {
  paziente: "Paziente",
  medico: "Medico",
  fisioterapista: "Fisioterapista",
  admin: "Admin",
};

function formatOra(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatData(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ChatPage() {
  const { richiestaId } = useParams<{ richiestaId: string }>();
  const { utente, richieste, messaggi, aggiungiMessaggio, aggiungiNotifica } = useApp();
  const router = useRouter();
  const [testo, setTesto] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const richiesta = richieste.find((r) => r.id === richiestaId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  if (!utente) {
    router.push("/");
    return null;
  }

  if (!richiesta) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">Richiesta non trovata.</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">
            Torna indietro
          </button>
        </main>
      </div>
    );
  }

  // Verifica accesso
  const hasAccess =
    utente.ruolo === "admin" ||
    (utente.ruolo === "paziente" && richiesta.pazienteId === utente.id) ||
    (utente.ruolo === "medico" && richiesta.medicoId === utente.id) ||
    (utente.ruolo === "fisioterapista" && richiesta.fisioterapistaId === utente.id);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-3">🔒</div>
          <p className="text-gray-500">Non hai accesso a questa chat.</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">
            Torna indietro
          </button>
        </main>
      </div>
    );
  }

  const chatMessaggi = messaggi.filter((m) => m.richiestaId === richiestaId);
  const paz = pazienti.find((p) => p.id === richiesta.pazienteId);
  const med = medici.find((m) => m.id === richiesta.medicoId);
  const fis = fisioterapisti.find((f) => f.id === richiesta.fisioterapistaId);

  // Raggruppa messaggi per data
  const gruppiPerData: { data: string; messaggi: Messaggio[] }[] = [];
  chatMessaggi.forEach((m) => {
    const data = m.timestamp.split("T")[0];
    const gruppo = gruppiPerData.find((g) => g.data === data);
    if (gruppo) {
      gruppo.messaggi.push(m);
    } else {
      gruppiPerData.push({ data, messaggi: [m] });
    }
  });

  function invia(e: React.FormEvent) {
    e.preventDefault();
    if (!testo.trim()) return;

    const nuovoMsg: Messaggio = {
      id: `msg-${Date.now()}`,
      richiestaId,
      mittente: utente!.nome,
      mittentId: utente!.id,
      ruolo: utente!.ruolo,
      testo: testo.trim(),
      timestamp: new Date().toISOString(),
    };

    aggiungiMessaggio(nuovoMsg);

    if (!richiesta) return;
    // Notifiche agli altri partecipanti
    const destinatari: string[] = [];
    if (utente!.id !== richiesta.pazienteId) destinatari.push(richiesta.pazienteId);
    if (utente!.id !== richiesta.medicoId) destinatari.push(richiesta.medicoId);
    if (richiesta.fisioterapistaId && utente!.id !== richiesta.fisioterapistaId) {
      destinatari.push(richiesta.fisioterapistaId);
    }

    destinatari.forEach((destId) => {
      aggiungiNotifica({
        id: `notif-${Date.now()}-${destId}`,
        destinatarioId: destId,
        testo: `Nuovo messaggio da ${utente!.nome}: "${testo.trim().substring(0, 60)}${testo.length > 60 ? "..." : ""}"`,
        tipo: "info",
        letto: false,
        timestamp: new Date().toISOString(),
        richiestaId,
      });
    });

    setTesto("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      invia(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Info richiesta */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors mr-1"
              aria-label="Torna indietro"
            >
              ←
            </button>
            <h1 className="font-semibold text-gray-900 text-sm truncate">
              {richiesta.patologia}
            </h1>
            <StatoBadge stato={richiesta.stato} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 ml-6">
            {paz && <span>🧑‍🦽 {paz.nome} {paz.cognome}</span>}
            {med && <span>👨‍⚕️ Dr.ssa {med.cognome}</span>}
            {fis && <span>🏥 {fis.nome} {fis.cognome}</span>}
          </div>
        </div>
      </div>

      {/* Messaggi */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {gruppiPerData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-400 text-sm">
                Nessun messaggio ancora. Scrivi il primo!
              </p>
            </div>
          )}

          {gruppiPerData.map(({ data, messaggi: msgs }) => (
            <div key={data}>
              {/* Separatore data */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 shrink-0 capitalize">
                  {formatData(`${data}T12:00:00`)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-2">
                {msgs.map((m) => {
                  const isMio = m.mittentId === utente.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMio ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${isMio ? "items-end" : "items-start"} flex flex-col`}>
                        {!isMio && (
                          <div className="flex items-center gap-1.5 mb-1 ml-1">
                            <span className="text-xs font-semibold text-gray-700">
                              {m.mittente}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({ruoloTag[m.ruolo]})
                            </span>
                          </div>
                        )}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-snug break-words ${
                            isMio
                              ? `${ruoloBollaPropia} rounded-br-sm`
                              : `${ruoloBolla[m.ruolo]} rounded-bl-sm`
                          }`}
                        >
                          {m.testo}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 mx-1">
                          {formatOra(m.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input messaggio */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <form onSubmit={invia} className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-28"
            placeholder="Scrivi un messaggio… (Invio per inviare)"
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="submit"
            disabled={!testo.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors shrink-0"
            aria-label="Invia messaggio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

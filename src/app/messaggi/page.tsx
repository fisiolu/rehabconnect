"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, MessageSquare } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fisioterapisti, pazienti } from "@/lib/demoData";

export default function MessaggiPage() {
  const router = useRouter();
  const { utente, conversazioni, messaggiDiretti } = useApp();

  useEffect(() => {
    if (!utente) router.replace("/");
  }, [utente, router]);

  const mie = useMemo(() => {
    if (!utente) return [];
    return conversazioni
      .filter((c) =>
        utente.ruolo === "paziente"
          ? c.pazienteId === utente.id
          : utente.ruolo === "fisioterapista"
            ? c.fisioterapistaId === utente.id
            : false
      )
      .map((c) => {
        const msg = messaggiDiretti
          .filter((m) => m.conversazioneId === c.id)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const ultimo = msg[msg.length - 1];
        const nonLetti = msg.filter((m) => !m.letto && m.mittenteId !== utente.id).length;
        return { conversazione: c, ultimo, nonLetti };
      })
      .sort((a, b) => (b.ultimo?.timestamp ?? "").localeCompare(a.ultimo?.timestamp ?? ""));
  }, [utente, conversazioni, messaggiDiretti]);

  if (!utente) return null;

  const sonoPaziente = utente.ruolo === "paziente";

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900">
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
          <h1 className="font-bold text-notte dark:text-white">Messaggi</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {mie.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
            <h2 className="text-lg font-bold text-notte dark:text-white mb-2">
              Nessuna conversazione
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              {sonoPaziente
                ? "Trova un Fisioterapista nella tua zona e scrivigli: la conversazione comparirà qui."
                : "Quando un paziente ti scrive, la conversazione comparirà qui."}
            </p>
            {sonoPaziente && (
              <Link
                href="/trova"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapPin size={18} aria-hidden="true" />
                Cerca vicino a me
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {mie.map(({ conversazione: c, ultimo, nonLetti }) => {
              const altro = sonoPaziente
                ? fisioterapisti.find((f) => f.id === c.fisioterapistaId)
                : pazienti.find((p) => p.id === c.pazienteId);
              const nome = altro ? `${altro.nome} ${altro.cognome}` : "—";

              return (
                <li key={c.id}>
                  <Link
                    href={`/messaggi/${c.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 hover:border-primary-300 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h2 className="font-bold text-notte dark:text-white truncate">{nome}</h2>
                      <div className="flex items-center gap-2 shrink-0">
                        {ultimo && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {new Date(ultimo.timestamp).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        )}
                        {nonLetti > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary-600 text-white text-xs font-bold">
                            {nonLetti}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ultimo
                        ? `${ultimo.mittenteId === utente.id ? "Tu: " : ""}${ultimo.testo}`
                        : "Nessun messaggio"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useTema } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoUfficiale from "@/components/LogoUfficiale";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { caricaConversazioni } from "@/lib/supabase/conversazioni";

const ruoloLabel: Record<string, string> = {
  paziente: "Paziente",
  medico: "Medico",
  fisioterapista: "Fisioterapista",
  admin: "Amministratore",
};

const ruoloIcona: Record<string, string> = {
  paziente: "🧑‍🦽",
  medico: "👨‍⚕️",
  fisioterapista: "🏥",
  admin: "⚙️",
};

const ruoloBadgeColore: Record<string, string> = {
  paziente: "bg-blue-100 text-blue-800",
  medico: "bg-green-100 text-green-800",
  fisioterapista: "bg-purple-100 text-purple-800",
  admin: "bg-orange-100 text-orange-800",
};

const notificaTipoColore: Record<string, string> = {
  successo: "text-green-600",
  info: "text-blue-600",
  attenzione: "text-orange-600",
};

const notificaTipoIcona: Record<string, string> = {
  successo: "✅",
  info: "ℹ️",
  attenzione: "⚠️",
};

export default function Navbar() {
  const { utente, esci, notifiche, segnaNotificaLetta, segnaNotificheLette } = useApp();
  const { tema, toggleTema, testoGrande, toggleTesto } = useTema();
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [messaggiNonLetti, setMessaggiNonLetti] = useState(0);

  const mieNotifiche = notifiche.filter((n) => n.destinatarioId === utente?.id);
  const nonLette = mieNotifiche.filter((n) => !n.letto).length;

  useEffect(() => {
    if (!utente || (utente.ruolo !== "paziente" && utente.ruolo !== "fisioterapista")) {
      setMessaggiNonLetti(0);
      return;
    }
    caricaConversazioni(createClient(), { ruolo: utente.ruolo, id: utente.id }).then((mie) =>
      setMessaggiNonLetti(mie.reduce((n, c) => n + c.nonLetti, 0))
    );
  }, [utente]);

  useEffect(() => {
    function chiudi(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAperto(false);
      }
    }
    document.addEventListener("mousedown", chiudi);
    return () => document.removeEventListener("mousedown", chiudi);
  }, []);

  async function handleLogout() {
    await esci();
    router.push("/");
  }

  /**
   * Torna alla pagina precedente davvero, non alla home.
   * Se però si è arrivati qui direttamente — link condiviso, scheda aperta da
   * zero — la cronologia è vuota e `back()` non farebbe nulla: in quel caso
   * si va alla propria area, che è il posto sensato da cui ripartire.
   */
  function tornaIndietro() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (utente) {
      router.push(`/dashboard/${utente.ruolo}`);
    } else {
      router.push("/");
    }
  }

  function apriNotifiche() {
    setAperto((v) => !v);
  }

  function clickNotifica(id: string, richiestaId?: string) {
    segnaNotificaLetta(id);
    setAperto(false);
    if (richiestaId && utente) {
      router.push(`/chat/${richiestaId}`);
    }
  }

  if (!utente) return null;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
          aria-label="Torna alla scelta del ruolo"
        >
          <LogoUfficiale dimensione={34} />
          <span className="hidden sm:block leading-[1.05] text-[13px]">
            Fisioterapista
            <br />
            Domiciliare
          </span>
        </Link>

        {/* Torna indietro: usa la cronologia del browser, non porta alla home */}
        <button
          onClick={tornaIndietro}
          className="shrink-0 inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-semibold pl-2 pr-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Torna alla pagina precedente"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Indietro</span>
        </button>

        {/* Ruolo corrente */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center sm:justify-start">
          <span className="text-lg shrink-0">{ruoloIcona[utente.ruolo]}</span>
          <span className={`badge ${ruoloBadgeColore[utente.ruolo]} truncate`}>
            <span className="sm:hidden">{ruoloLabel[utente.ruolo]}</span>
            <span className="hidden sm:block truncate">
              {utente.nome} — {ruoloLabel[utente.ruolo]}
            </span>
          </span>
        </div>

        {/* Destra: messaggi + tema + campanella + esci */}
        <div className="flex items-center gap-3 shrink-0">
          {(utente.ruolo === "paziente" || utente.ruolo === "fisioterapista") && (
            <Link
              href="/messaggi"
              className="relative p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={
                messaggiNonLetti > 0
                  ? `Messaggi (${messaggiNonLetti} non letti)`
                  : "Messaggi"
              }
            >
              <span className="text-lg leading-none" aria-hidden="true">
                💬
              </span>
              {messaggiNonLetti > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {messaggiNonLetti}
                </span>
              )}
            </Link>
          )}
          {/* Toggle testo grande */}
          <button
            onClick={toggleTesto}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-sm min-w-[2rem]"
            aria-label={testoGrande ? "Riduci testo" : "Ingrandisci testo"}
            title={testoGrande ? "Testo normale" : "Testo grande"}
          >
            {testoGrande ? "A−" : "A+"}
          </button>

          {/* Toggle tema */}
          <button
            onClick={toggleTema}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={tema === "chiaro" ? "Attiva tema scuro" : "Attiva tema chiaro"}
            title={tema === "chiaro" ? "Tema scuro" : "Tema chiaro"}
          >
            {tema === "chiaro" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          {/* Campanella notifiche */}
          <div className="relative" ref={ref}>
            <button
              onClick={apriNotifiche}
              className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              aria-label={`Notifiche${nonLette > 0 ? ` (${nonLette} non lette)` : ""}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {nonLette > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {nonLette > 9 ? "9+" : nonLette}
                </span>
              )}
            </button>

            {/* Dropdown notifiche */}
            {aperto && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifiche</span>
                  {nonLette > 0 && (
                    <button
                      onClick={segnaNotificheLette}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Segna tutte lette
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {mieNotifiche.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                      Nessuna notifica
                    </div>
                  ) : (
                    mieNotifiche.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => clickNotifica(n.id, n.richiestaId)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 ${
                          !n.letto ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 mt-0.5">
                            {notificaTipoIcona[n.tipo]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${notificaTipoColore[n.tipo]} font-medium`}>
                              {n.testo}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.timestamp).toLocaleDateString("it-IT", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!n.letto && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {mieNotifiche.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
                    <span className="text-xs text-gray-400">
                      {mieNotifiche.length} notifiche totali
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cambia password: non ha senso per il Medico demo, che non ha una sessione Supabase vera */}
          {utente.ruolo !== "medico" && (
            <Link
              href="/account/password"
              className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium"
            >
              Password
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
            aria-label="Esci dall'applicazione"
          >
            Esci
          </button>
        </div>
      </div>
    </header>
  );
}

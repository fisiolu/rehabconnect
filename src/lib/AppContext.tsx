"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Ruolo,
  Richiesta,
  Messaggio,
  Notifica,
  Appuntamento,
  richieste as demoRichieste,
  messaggiDemo,
  notificheDemo,
} from "./demoData";

interface UtenteCorrente {
  ruolo: Ruolo;
  id: string;
  nome: string;
}

export interface Toast {
  id: string;
  messaggio: string;
  tipo: "successo" | "errore" | "info";
}

interface AppContextType {
  utente: UtenteCorrente | null;
  setUtente: (u: UtenteCorrente | null) => void;
  richieste: Richiesta[];
  aggiornaRichiesta: (id: string, campi: Partial<Richiesta>) => void;
  aggiungiRichiesta: (r: Richiesta) => void;
  messaggi: Messaggio[];
  aggiungiMessaggio: (m: Messaggio) => void;
  notifiche: Notifica[];
  aggiungiNotifica: (n: Notifica) => void;
  segnaNotificaLetta: (id: string) => void;
  segnaNotificheLette: () => void;
  toasts: Toast[];
  addToast: (messaggio: string, tipo?: Toast["tipo"]) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [utente, setUtente] = useState<UtenteCorrente | null>(null);
  const [richieste, setRichieste] = useState<Richiesta[]>(demoRichieste);
  const [messaggi, setMessaggi] = useState<Messaggio[]>(messaggiDemo);
  const [notifiche, setNotifiche] = useState<Notifica[]>(notificheDemo);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const aggiornaRichiesta = useCallback(
    (id: string, campi: Partial<Richiesta>) => {
      setRichieste((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...campi,
                appuntamenti: (campi.appuntamenti ?? r.appuntamenti) as Appuntamento[],
                dataAggiornamento: new Date().toISOString().split("T")[0],
              }
            : r
        )
      );
    },
    []
  );

  const aggiungiRichiesta = useCallback((r: Richiesta) => {
    setRichieste((prev) => [r, ...prev]);
  }, []);

  const aggiungiMessaggio = useCallback((m: Messaggio) => {
    setMessaggi((prev) => [...prev, m]);
  }, []);

  const aggiungiNotifica = useCallback((n: Notifica) => {
    setNotifiche((prev) => [n, ...prev]);
  }, []);

  const segnaNotificaLetta = useCallback((id: string) => {
    setNotifiche((prev) =>
      prev.map((n) => (n.id === id ? { ...n, letto: true } : n))
    );
  }, []);

  const segnaNotificheLette = useCallback(() => {
    setNotifiche((prev) => prev.map((n) => ({ ...n, letto: true })));
  }, []);

  const addToast = useCallback(
    (messaggio: string, tipo: Toast["tipo"] = "successo") => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, messaggio, tipo }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        utente,
        setUtente,
        richieste,
        aggiornaRichiesta,
        aggiungiRichiesta,
        messaggi,
        aggiungiMessaggio,
        notifiche,
        aggiungiNotifica,
        segnaNotificaLetta,
        segnaNotificheLette,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve essere usato dentro AppProvider");
  return ctx;
}

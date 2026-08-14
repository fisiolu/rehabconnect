"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Ruolo,
  Richiesta,
  Messaggio,
  Notifica,
  Appuntamento,
  Posizione,
  Valutazione,
  FotoEsercizio,
  Conversazione,
  MessaggioDiretto,
  MedicoRiferimento,
  richieste as demoRichieste,
  messaggiDemo,
  notificheDemo,
  posizioniDemo,
  valutazioniDemo,
  fotoEserciziDemo,
  conversazioniDemo,
  messaggiDirettiDemo,
  mediciRiferimentoDemo,
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
  posizioni: Record<string, Posizione>;
  aggiornaPosizione: (userId: string, pos: Posizione) => void;
  valutazioni: Valutazione[];
  aggiungiValutazione: (v: Valutazione) => void;
  fotoEsercizi: FotoEsercizio[];
  aggiungiFoto: (f: FotoEsercizio) => void;
  conversazioni: Conversazione[];
  messaggiDiretti: MessaggioDiretto[];
  /** Restituisce la conversazione fra i due, creandola se non esiste ancora. */
  apriConversazione: (pazienteId: string, fisioterapistaId: string) => string;
  inviaMessaggioDiretto: (
    conversazioneId: string,
    mittenteId: string,
    ruolo: "paziente" | "fisioterapista",
    testo: string
  ) => void;
  /** Segna come letti i messaggi ricevuti in quella conversazione. */
  segnaConversazioneLetta: (conversazioneId: string, lettoreId: string) => void;
  /** Scheda del medico di riferimento, una per paziente. */
  mediciRiferimento: Record<string, MedicoRiferimento>;
  salvaMedicoRiferimento: (pazienteId: string, medico: MedicoRiferimento) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [utente, setUtente] = useState<UtenteCorrente | null>(null);
  const [richieste, setRichieste] = useState<Richiesta[]>(demoRichieste);
  const [messaggi, setMessaggi] = useState<Messaggio[]>(messaggiDemo);
  const [notifiche, setNotifiche] = useState<Notifica[]>(notificheDemo);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [posizioni, setPosizioni] = useState<Record<string, Posizione>>(posizioniDemo);
  const [valutazioni, setValutazioni] = useState<Valutazione[]>(valutazioniDemo);
  const [fotoEsercizi, setFotoEsercizi] = useState<FotoEsercizio[]>(fotoEserciziDemo);
  const [conversazioni, setConversazioni] = useState<Conversazione[]>(conversazioniDemo);
  const [messaggiDiretti, setMessaggiDiretti] =
    useState<MessaggioDiretto[]>(messaggiDirettiDemo);
  const [mediciRiferimento, setMediciRiferimento] =
    useState<Record<string, MedicoRiferimento>>(mediciRiferimentoDemo);

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

  const aggiornaPosizione = useCallback(
    (userId: string, pos: Posizione) => {
      setPosizioni((prev) => ({ ...prev, [userId]: pos }));
    },
    []
  );

  const aggiungiValutazione = useCallback((v: Valutazione) => {
    setValutazioni((prev) => [...prev, v]);
  }, []);

  const aggiungiFoto = useCallback((f: FotoEsercizio) => {
    setFotoEsercizi((prev) => [...prev, f]);
  }, []);

  const apriConversazione = useCallback(
    (pazienteId: string, fisioterapistaId: string) => {
      const esistente = conversazioni.find(
        (c) => c.pazienteId === pazienteId && c.fisioterapistaId === fisioterapistaId
      );
      if (esistente) return esistente.id;

      const nuova: Conversazione = {
        id: `conv-${pazienteId}-${fisioterapistaId}`,
        pazienteId,
        fisioterapistaId,
        iniziata: new Date().toISOString(),
      };
      setConversazioni((prev) => [...prev, nuova]);
      return nuova.id;
    },
    [conversazioni]
  );

  const inviaMessaggioDiretto = useCallback(
    (
      conversazioneId: string,
      mittenteId: string,
      ruolo: "paziente" | "fisioterapista",
      testo: string
    ) => {
      setMessaggiDiretti((prev) => [
        ...prev,
        {
          id: `md-${conversazioneId}-${prev.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
          conversazioneId,
          mittenteId,
          ruolo,
          testo,
          timestamp: new Date().toISOString(),
          letto: false,
        },
      ]);
    },
    []
  );

  const salvaMedicoRiferimento = useCallback(
    (pazienteId: string, medico: MedicoRiferimento) => {
      setMediciRiferimento((prev) => ({ ...prev, [pazienteId]: medico }));
    },
    []
  );

  const segnaConversazioneLetta = useCallback((conversazioneId: string, lettoreId: string) => {
    setMessaggiDiretti((prev) =>
      prev.map((m) =>
        m.conversazioneId === conversazioneId && m.mittenteId !== lettoreId && !m.letto
          ? { ...m, letto: true }
          : m
      )
    );
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
        posizioni,
        aggiornaPosizione,
        valutazioni,
        aggiungiValutazione,
        fotoEsercizi,
        aggiungiFoto,
        conversazioni,
        messaggiDiretti,
        apriConversazione,
        inviaMessaggioDiretto,
        segnaConversazioneLetta,
        mediciRiferimento,
        salvaMedicoRiferimento,
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

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createClient } from "./supabase/client";
import { risolviRuolo } from "./supabase/ruolo";
import {
  Ruolo,
  Richiesta,
  Messaggio,
  Notifica,
  Appuntamento,
  Posizione,
  Valutazione,
  FotoEsercizio,
  richieste as demoRichieste,
  messaggiDemo,
  notificheDemo,
  posizioniDemo,
  valutazioniDemo,
  fotoEserciziDemo,
} from "./demoData";

export interface UtenteCorrente {
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
  /** true finché non si è ancora capito se c'è una sessione valida. */
  caricandoSessione: boolean;
  esci: () => Promise<void>;
  /**
   * Provvisorio: il Medico non ha ancora un account Supabase vero (arriva
   * in un passaggio successivo). Finché non lo migriamo, resta l'unico
   * ruolo che entra con un profilo demo invece che con una sessione reale.
   */
  entraComeMedicoDemo: (u: UtenteCorrente) => void;
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [utente, setUtente] = useState<UtenteCorrente | null>(null);
  const [caricandoSessione, setCaricandoSessione] = useState(true);
  const [richieste, setRichieste] = useState<Richiesta[]>(demoRichieste);
  const [messaggi, setMessaggi] = useState<Messaggio[]>(messaggiDemo);
  const [notifiche, setNotifiche] = useState<Notifica[]>(notificheDemo);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [posizioni, setPosizioni] = useState<Record<string, Posizione>>(posizioniDemo);
  const [valutazioni, setValutazioni] = useState<Valutazione[]>(valutazioniDemo);
  const [fotoEsercizi, setFotoEsercizi] = useState<FotoEsercizio[]>(fotoEserciziDemo);

  // "utente" nasce dalla sessione Supabase vera, non più da un bottone
  // che finge un login. Il ruolo si scopre cercando l'id in admins,
  // fisioterapisti, pazienti — nell'ordine, il primo che risponde vince.
  useEffect(() => {
    const supabase = createClient();
    let attivo = true;

    async function aggiorna(userId: string | undefined) {
      const risolto = userId ? await risolviRuolo(supabase, userId) : null;
      if (attivo) {
        setUtente(risolto);
        setCaricandoSessione(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => aggiorna(data.session?.user.id));

    const { data: sottoscrizione } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      aggiorna(sessione?.user.id);
    });

    return () => {
      attivo = false;
      sottoscrizione.subscription.unsubscribe();
    };
  }, []);

  const esci = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUtente(null);
  }, []);

  const entraComeMedicoDemo = useCallback((u: UtenteCorrente) => {
    setUtente(u);
  }, []);

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

  return (
    <AppContext.Provider
      value={{
        utente,
        caricandoSessione,
        esci,
        entraComeMedicoDemo,
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

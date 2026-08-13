"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

/**
 * Pulsante per dettare il messaggio invece di scriverlo.
 *
 * È la funzione che più conta per un paziente anziano: sulla tastiera di un
 * telefono molti si arrendono, parlando no. Usa il riconoscimento vocale già
 * presente nel browser (Chrome, Edge, Safari): nessun servizio esterno,
 * nessuna registrazione, e l'audio non passa da noi.
 *
 * Se il browser non lo prevede — Firefox, per esempio — il pulsante non
 * compare affatto, invece di comparire e non funzionare.
 */

interface RisultatoVocale {
  isFinal: boolean;
  0: { transcript: string };
}

interface EventoVocale {
  resultIndex: number;
  results: { length: number; [i: number]: RisultatoVocale };
}

interface Riconoscitore {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: EventoVocale) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type CostruttoreRiconoscitore = new () => Riconoscitore;

function costruttore(): CostruttoreRiconoscitore | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: CostruttoreRiconoscitore;
    webkitSpeechRecognition?: CostruttoreRiconoscitore;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface Props {
  /** Riceve il testo dettato, da aggiungere a quello già scritto. */
  onTesto: (testo: string) => void;
}

export default function DettaturaVocale({ onTesto }: Props) {
  const [disponibile, setDisponibile] = useState(false);
  const [inAscolto, setInAscolto] = useState(false);
  const riconoscitore = useRef<Riconoscitore | null>(null);

  useEffect(() => {
    setDisponibile(costruttore() !== null);
    return () => riconoscitore.current?.stop();
  }, []);

  function avvia() {
    const C = costruttore();
    if (!C) return;

    const r = new C();
    r.lang = "it-IT";
    r.continuous = true;
    r.interimResults = false;

    r.onresult = (e) => {
      let testo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) testo += e.results[i][0].transcript;
      }
      if (testo.trim()) onTesto(testo.trim());
    };
    r.onerror = () => setInAscolto(false);
    r.onend = () => setInAscolto(false);

    riconoscitore.current = r;
    r.start();
    setInAscolto(true);
  }

  function ferma() {
    riconoscitore.current?.stop();
    setInAscolto(false);
  }

  if (!disponibile) return null;

  return (
    <button
      type="button"
      onClick={inAscolto ? ferma : avvia}
      aria-pressed={inAscolto}
      aria-label={inAscolto ? "Ferma la dettatura" : "Detta il messaggio a voce"}
      title={inAscolto ? "Ferma la dettatura" : "Detta il messaggio a voce"}
      className={`shrink-0 inline-flex items-center justify-center w-[52px] h-[52px] rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        inAscolto
          ? "bg-red-600 border-red-600 text-white rc-ascolto"
          : "bg-white dark:bg-gray-700 border-slate-300 dark:border-gray-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-600"
      }`}
    >
      {inAscolto ? <Square size={20} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
    </button>
  );
}

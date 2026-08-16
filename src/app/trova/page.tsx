"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Crosshair,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  SlidersHorizontal,
  Star,
  Wallet,
  X,
} from "lucide-react";
import type { Fisioterapista } from "@/lib/demoData";
import {
  cercaFisioterapistiVicini,
  formattaDistanza,
  specializzazioniDisponibili,
  type Coordinate,
} from "@/lib/geo";
import { useApp } from "@/lib/AppContext";
import { createClient } from "@/lib/supabase/client";
import { cercaApprovati } from "@/lib/supabase/fisioterapisti";
import { caricaPaziente } from "@/lib/supabase/pazienti";
import { apriConversazione as apriConversazioneReale } from "@/lib/supabase/conversazioni";

const MappaRicerca = dynamic(() => import("@/components/MappaRicerca"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-slate-500 dark:text-slate-400 text-sm">Carico la mappa…</p>
    </div>
  ),
});

/** Punti di partenza se il paziente non vuole o non può usare il GPS. */
const CITTA = [
  { nome: "Milano", lat: 45.4642, lng: 9.19 },
  { nome: "Roma", lat: 41.9028, lng: 12.4964 },
  { nome: "Napoli", lat: 40.8518, lng: 14.2681 },
  { nome: "Formia", lat: 41.2565, lng: 13.606 },
  { nome: "Torino", lat: 45.0703, lng: 7.6869 },
  { nome: "Bologna", lat: 44.4949, lng: 11.3426 },
  { nome: "Firenze", lat: 43.7696, lng: 11.2558 },
  { nome: "Bari", lat: 41.1171, lng: 16.8719 },
  { nome: "Palermo", lat: 38.1157, lng: 13.3615 },
];

type StatoGps = "inattivo" | "in_corso" | "negato" | "non_supportato";

export default function TrovaPage() {
  const { utente } = useApp();
  const router = useRouter();

  const [posizione, setPosizione] = useState<Coordinate | null>(null);
  const [etichettaPosizione, setEtichettaPosizione] = useState("");
  const [statoGps, setStatoGps] = useState<StatoGps>("inattivo");
  const [selezionatoId, setSelezionatoId] = useState<string | null>(null);
  const [specializzazione, setSpecializzazione] = useState("");
  const [soloDisponibili, setSoloDisponibili] = useState(true);
  const [soloRaggiungibili, setSoloRaggiungibili] = useState(true);
  const [filtriAperti, setFiltriAperti] = useState(false);
  const [fisioterapisti, setFisioterapisti] = useState<Fisioterapista[]>([]);

  // Il Medico demo non ha una sessione Supabase vera (entraComeMedicoDemo):
  // per il database resta anonimo, quindi non basta "utente" non nullo.
  const mostraContatti = !!utente && utente.ruolo !== "medico";

  useEffect(() => {
    cercaApprovati(createClient(), mostraContatti).then(setFisioterapisti);
  }, [mostraContatti]);

  // Se il paziente è già entrato, si parte dal suo domicilio.
  useEffect(() => {
    if (posizione || utente?.ruolo !== "paziente") return;
    caricaPaziente(createClient(), utente.id).then((paziente) => {
      if (paziente) {
        setPosizione({ lat: paziente.domicilio_lat, lng: paziente.domicilio_lng });
        setEtichettaPosizione(`Casa tua — ${paziente.indirizzo}`);
      }
    });
  }, [utente, posizione]);

  function usaPosizioneAttuale() {
    if (!("geolocation" in navigator)) {
      setStatoGps("non_supportato");
      return;
    }
    setStatoGps("in_corso");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosizione({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEtichettaPosizione("La tua posizione attuale");
        setSelezionatoId(null);
        setStatoGps("inattivo");
      },
      () => setStatoGps("negato"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function usaCitta(citta: (typeof CITTA)[number]) {
    setPosizione({ lat: citta.lat, lng: citta.lng });
    setEtichettaPosizione(citta.nome);
    setSelezionatoId(null);
  }

  /** Luogo scritto a mano dal paziente e riconosciuto dalla ricerca. */
  function usaLuogo(luogo: Luogo) {
    setPosizione({ lat: luogo.lat, lng: luogo.lng });
    setEtichettaPosizione(luogo.nome);
    setSelezionatoId(null);
  }

  /** Per scrivere serve essere autenticati come paziente. */
  async function scriviA(fisioterapistaId: string) {
    if (utente?.ruolo !== "paziente") {
      router.push("/accedi?redirect=/trova");
      return;
    }
    const conversazioneId = await apriConversazioneReale(createClient(), utente.id, fisioterapistaId);
    router.push(`/messaggi/${conversazioneId}`);
  }

  const specialita = useMemo(() => specializzazioniDisponibili(fisioterapisti), [fisioterapisti]);

  const risultati = useMemo(() => {
    if (!posizione) return [];
    return cercaFisioterapistiVicini(posizione, fisioterapisti, {
      specializzazione: specializzazione || undefined,
      soloDisponibili,
      soloRaggiungibili,
    });
  }, [posizione, fisioterapisti, specializzazione, soloDisponibili, soloRaggiungibili]);

  const selezionato = risultati.find((r) => r.fisioterapista.id === selezionatoId) ?? null;

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Pulsante con la scritta: la sola freccia non si capisce a colpo d'occhio */}
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-notte dark:text-white text-sm font-semibold pl-2.5 pr-3.5 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Torna Indietro
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-notte dark:text-white leading-tight truncate">
              Fisioterapisti vicino a te
            </h1>
            {etichettaPosizione && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {etichettaPosizione}
              </p>
            )}
          </div>
          <button
            onClick={usaPosizioneAttuale}
            disabled={statoGps === "in_corso"}
            className="ml-auto inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Crosshair size={17} aria-hidden="true" />
            <span className="hidden sm:inline">
              {statoGps === "in_corso" ? "Ti sto localizzando…" : "Dove mi trovo"}
            </span>
          </button>
        </div>
      </header>

      {!posizione ? (
        <SceltaPartenza
          statoGps={statoGps}
          onGps={usaPosizioneAttuale}
          onCitta={usaCitta}
          onLuogo={usaLuogo}
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full lg:gap-4 lg:px-4 lg:py-4">
          {/* Mappa: in alto sul telefono, a destra sul computer */}
          <div className="h-[52vh] lg:h-auto lg:flex-1 lg:order-2 lg:rounded-2xl overflow-hidden border-y lg:border border-slate-200 dark:border-gray-700 relative">
            <MappaRicerca
              centro={posizione}
              risultati={risultati}
              selezionatoId={selezionatoId}
              onSeleziona={setSelezionatoId}
            />
            {selezionato && (
              <div className="absolute left-3 right-3 bottom-3 top-3 z-[400] overflow-y-auto lg:left-4 lg:right-auto lg:w-80 lg:top-auto lg:max-h-[calc(100%-2rem)]">
                <SchedaSelezionato
                  risultato={selezionato}
                  mostraContatti={mostraContatti}
                  onChiudi={() => setSelezionatoId(null)}
                  onScrivi={() => scriviA(selezionato.fisioterapista.id)}
                />
              </div>
            )}
          </div>

          {/* Elenco */}
          <div className="lg:w-96 lg:order-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 px-4 lg:px-0 py-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong className="text-notte dark:text-white">{risultati.length}</strong>{" "}
                {risultati.length === 1 ? "fisioterapista" : "fisioterapisti"}
              </p>
              <button
                onClick={() => setFiltriAperti((v) => !v)}
                aria-expanded={filtriAperti}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filtri
              </button>
            </div>

            {filtriAperti && (
              <div className="mx-4 lg:mx-0 mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 space-y-3">
                <div>
                  <label htmlFor="specialita" className="label">
                    Specialità
                  </label>
                  <select
                    id="specialita"
                    value={specializzazione}
                    onChange={(e) => setSpecializzazione(e.target.value)}
                    className="input-field py-3"
                  >
                    <option value="">Tutte le specialità</option>
                    {specialita.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soloDisponibili}
                    onChange={(e) => setSoloDisponibili(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Solo chi è disponibile ora
                  </span>
                </label>
                <label className="flex items-center gap-3 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soloRaggiungibili}
                    onChange={(e) => setSoloRaggiungibili(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Solo chi arriva fino a casa mia
                  </span>
                </label>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 lg:px-0 pb-6 space-y-3">
              {risultati.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MapPin size={36} className="mx-auto text-slate-300 mb-3" aria-hidden="true" />
                  <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Nessun Fisioterapista in questa zona
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Prova a togliere qualche filtro, oppure allarga la ricerca.
                  </p>
                </div>
              ) : (
                risultati.map((r) => (
                  <CardFisioterapista
                    key={r.fisioterapista.id}
                    risultato={r}
                    mostraContatti={mostraContatti}
                    attivo={r.fisioterapista.id === selezionatoId}
                    onClick={() =>
                      setSelezionatoId(
                        selezionatoId === r.fisioterapista.id ? null : r.fisioterapista.id
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SceltaPartenza({
  statoGps,
  onGps,
  onCitta,
  onLuogo,
}: {
  statoGps: StatoGps;
  onGps: () => void;
  onCitta: (c: (typeof CITTA)[number]) => void;
  onLuogo: (l: Luogo) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-5">
          <MapPin size={30} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-notte dark:text-white mb-2">
          Da dove cerchiamo?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-7">
          Indica dove ti trovi e ti mostro subito i Fisioterapisti più vicini, con le loro
          specialità.
        </p>

        <button
          onClick={onGps}
          disabled={statoGps === "in_corso"}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-lg px-6 py-4 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <Crosshair size={20} aria-hidden="true" />
          {statoGps === "in_corso" ? "Ti sto localizzando…" : "Usa la mia posizione"}
        </button>

        {statoGps === "negato" && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Non sono riuscito a rilevare la posizione. Puoi consentirla nelle impostazioni del
            browser, oppure scegliere una città qui sotto.
          </p>
        )}
        {statoGps === "non_supportato" && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Questo dispositivo non permette di rilevare la posizione. Scrivi qui sotto dove ti
            trovi.
          </p>
        )}

        <p className="text-sm text-slate-400 dark:text-slate-500 my-5">
          oppure scrivi dove ti trovi
        </p>

        <RicercaLuogo onScelto={onLuogo} />

        <p className="text-sm text-slate-400 dark:text-slate-500 mt-7 mb-3">
          Città cercate più spesso
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {CITTA.map((c) => (
            <button
              key={c.nome}
              onClick={() => onCitta(c)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-notte dark:text-white text-sm font-medium hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Luogo {
  nome: string;
  lat: number;
  lng: number;
}

/**
 * Casella per scrivere una città o un indirizzo qualsiasi.
 *
 * Cerca solo quando il paziente lo chiede — premendo Invio o il pulsante — e
 * non a ogni lettera digitata: così l'indirizzo di casa non viene spedito
 * fuori mentre lo si sta ancora scrivendo, e non si tempesta di richieste il
 * servizio gratuito di OpenStreetMap.
 */
function RicercaLuogo({ onScelto }: { onScelto: (l: Luogo) => void }) {
  const [testo, setTesto] = useState("");
  const [risultati, setRisultati] = useState<Luogo[] | null>(null);
  const [ripiego, setRipiego] = useState(false);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");

  async function cerca(e: React.FormEvent) {
    e.preventDefault();
    const q = testo.trim();
    if (q.length < 3) {
      setErrore("Scrivi almeno tre lettere.");
      return;
    }

    setInCorso(true);
    setErrore("");
    setRisultati(null);
    setRipiego(false);

    try {
      const r = await fetch(`/api/geocodifica?q=${encodeURIComponent(q)}`);
      const dati = (await r.json()) as {
        risultati: Luogo[];
        ripiego?: boolean;
        errore?: string;
      };

      if (dati.errore) {
        setErrore(dati.errore);
      } else if (dati.risultati.length === 0) {
        setErrore(`Non ho trovato "${q}". Prova a scrivere solo il nome del comune.`);
      } else {
        setRisultati(dati.risultati);
        setRipiego(!!dati.ripiego);
      }
    } catch {
      setErrore("Non sono riuscito a cercare. Controlla la connessione.");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <div>
      <form onSubmit={cerca} className="flex gap-2">
        <label htmlFor="luogo" className="sr-only">
          Città o indirizzo
        </label>
        <input
          id="luogo"
          type="text"
          value={testo}
          onChange={(e) => {
            setTesto(e.target.value);
            setErrore("");
          }}
          placeholder="Es. Gaeta, oppure Via Roma 12 Formia"
          autoComplete="street-address"
          className="input-field flex-1 py-3.5 text-base"
        />
        <button
          type="submit"
          disabled={inCorso}
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-notte hover:bg-notte/90 disabled:opacity-60 text-white font-semibold px-5 py-3.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <Search size={18} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{inCorso ? "Cerco…" : "Cerca"}</span>
        </button>
      </form>

      {errore && (
        <p
          role="status"
          className="mt-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-left"
        >
          {errore}
        </p>
      )}

      {ripiego && risultati && risultati.length > 0 && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-left">
          Non ho trovato l&apos;indirizzo preciso, ma il comune sì. Va bene lo stesso: la
          distanza dei Fisioterapisti sarà calcolata dal centro del paese.
        </p>
      )}

      {risultati && risultati.length > 0 && (
        <ul className="mt-3 text-left border border-slate-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-gray-700">
          {risultati.map((r) => (
            <li key={`${r.lat},${r.lng},${r.nome}`}>
              <button
                onClick={() => onScelto(r)}
                className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
              >
                <MapPin
                  size={16}
                  className="text-primary-600 dark:text-primary-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-notte dark:text-white">{r.nome}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stelline({ valutazione }: { valutazione: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
      <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
      {valutazione.toFixed(1).replace(".", ",")}
    </span>
  );
}

function CardFisioterapista({
  risultato,
  mostraContatti,
  attivo,
  onClick,
}: {
  risultato: import("@/lib/geo").RisultatoRicerca;
  mostraContatti: boolean;
  attivo: boolean;
  onClick: () => void;
}) {
  const { fisioterapista: f, distanzaKm, raggiungibile } = risultato;

  return (
    <button
      onClick={onClick}
      aria-pressed={attivo}
      className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        attivo
          ? "border-primary-500 ring-2 ring-primary-500/30 shadow-md"
          : "border-slate-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="font-bold text-notte dark:text-white">
          {f.nome}
          {mostraContatti ? ` ${f.cognome}` : ""}
        </h3>
        <span className="shrink-0 text-sm font-bold text-teal-600 dark:text-teal-400">
          {formattaDistanza(distanzaKm)}
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        {f.specializzazioni.join(" · ")}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Stelline valutazione={f.valutazione} />
        <span className="text-sm text-slate-400 dark:text-slate-500">
          {f.base.citta} ({f.base.provincia})
        </span>
        {!f.disponibile && (
          <span className="badge bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300">
            Non disponibile
          </span>
        )}
        {f.disponibile && !raggiungibile && (
          <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Fuori dalla sua zona
          </span>
        )}
      </div>
    </button>
  );
}

function SchedaSelezionato({
  risultato,
  mostraContatti,
  onChiudi,
  onScrivi,
}: {
  risultato: import("@/lib/geo").RisultatoRicerca;
  mostraContatti: boolean;
  onChiudi: () => void;
  onScrivi: () => void;
}) {
  const { fisioterapista: f, distanzaKm, raggiungibile } = risultato;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-notte dark:text-white leading-tight">
            {f.nome}
            {mostraContatti ? ` ${f.cognome}` : ""}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            a {formattaDistanza(distanzaKm)} da te · {f.base.citta}
          </p>
        </div>
        <button
          onClick={onChiudi}
          className="p-1.5 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-notte hover:bg-slate-100 dark:hover:bg-gray-700 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Chiudi la scheda"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
        {f.presentazione}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {f.specializzazioni.map((s) => (
          <span
            key={s}
            className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-slate-500 dark:text-slate-400">
        <Stelline valutazione={f.valutazione} />
        <span>{f.anniEsperienza} anni di esperienza</span>
      </div>

      {/* Costo: il trattamento domiciliare è privato, quindi la tariffa è del professionista */}
      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Wallet size={15} aria-hidden="true" />
            Tariffa a seduta
          </span>
          <span className="font-bold text-notte dark:text-white">
            {f.tariffa.min}–{f.tariffa.max} €
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Prestazione privata. L&apos;importo esatto dipende dal trattamento e lo concordi
          direttamente con il professionista.
        </p>

        {f.assicurazioni.length > 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            <span className="font-medium">Lavora con:</span> {f.assicurazioni.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Non lavora con assicurazioni o fondi sanitari.
          </p>
        )}
      </div>

      {/* Prudenza clinica: non promuoviamo l'accesso diretto come argomento di vendita */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Se il tuo medico ti ha consigliato o prescritto della fisioterapia, portane l&apos;indicazione
        al primo incontro: aiuta a impostare il percorso giusto.
      </p>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Iscrizione all&apos;albo: <span className="font-medium">{f.numeroAlbo}</span> —{" "}
        <a
          href="https://fisionet.fnofi.it/albo-professionale"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary-600 dark:text-primary-400 font-medium underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          puoi verificarla tu
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </p>

      {!raggiungibile && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          Dichiara di spostarsi fino a {f.raggioKm} km: casa tua è più lontana. Puoi comunque
          contattarlo per accordarvi.
        </p>
      )}

      {mostraContatti ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`tel:${f.telefono.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Phone size={18} aria-hidden="true" />
            Chiama
          </a>
          <button
            onClick={onScrivi}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 text-notte dark:text-white font-semibold px-4 py-3.5 rounded-xl border border-slate-200 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <MessageSquare size={18} aria-hidden="true" />
            Scrivi
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={onScrivi}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Accedi per chiamare o scrivere
          </button>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Cognome e telefono sono visibili dopo l&apos;accesso.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Crosshair,
  ExternalLink,
  MapPin,
  Phone,
  SlidersHorizontal,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { fisioterapisti } from "@/lib/demoData";
import {
  cercaFisioterapistiVicini,
  formattaDistanza,
  specializzazioniDisponibili,
  type Coordinate,
} from "@/lib/geo";
import { useApp } from "@/lib/AppContext";
import { pazienti } from "@/lib/demoData";

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

  const [posizione, setPosizione] = useState<Coordinate | null>(null);
  const [etichettaPosizione, setEtichettaPosizione] = useState("");
  const [statoGps, setStatoGps] = useState<StatoGps>("inattivo");
  const [selezionatoId, setSelezionatoId] = useState<string | null>(null);
  const [specializzazione, setSpecializzazione] = useState("");
  const [soloDisponibili, setSoloDisponibili] = useState(true);
  const [soloRaggiungibili, setSoloRaggiungibili] = useState(true);
  const [filtriAperti, setFiltriAperti] = useState(false);

  // Se il paziente è già entrato, si parte dal suo domicilio.
  useEffect(() => {
    if (posizione || utente?.ruolo !== "paziente") return;
    const paziente = pazienti.find((p) => p.id === utente.id);
    if (paziente) {
      setPosizione(paziente.domicilio);
      setEtichettaPosizione(`Casa tua — ${paziente.indirizzo}`);
    }
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

  const specialita = useMemo(() => specializzazioniDisponibili(fisioterapisti), []);

  const risultati = useMemo(() => {
    if (!posizione) return [];
    return cercaFisioterapistiVicini(posizione, fisioterapisti, {
      specializzazione: specializzazione || undefined,
      soloDisponibili,
      soloRaggiungibili,
    });
  }, [posizione, specializzazione, soloDisponibili, soloRaggiungibili]);

  const selezionato = risultati.find((r) => r.fisioterapista.id === selezionatoId) ?? null;

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-notte hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Torna alla pagina iniziale"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-notte dark:text-white leading-tight">
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
                  onChiudi={() => setSelezionatoId(null)}
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
                    Nessun fisioterapista in questa zona
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
}: {
  statoGps: StatoGps;
  onGps: () => void;
  onCitta: (c: (typeof CITTA)[number]) => void;
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
          Indica dove ti trovi e ti mostro subito i fisioterapisti più vicini, con le loro
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
            Questo dispositivo non permette di rilevare la posizione. Scegli una città qui sotto.
          </p>
        )}

        <p className="text-sm text-slate-400 dark:text-slate-500 my-5">oppure scegli una città</p>

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
  attivo,
  onClick,
}: {
  risultato: import("@/lib/geo").RisultatoRicerca;
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
          {f.nome} {f.cognome}
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
  onChiudi,
}: {
  risultato: import("@/lib/geo").RisultatoRicerca;
  onChiudi: () => void;
}) {
  const { fisioterapista: f, distanzaKm, raggiungibile } = risultato;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-notte dark:text-white leading-tight">
            {f.nome} {f.cognome}
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

      <a
        href={`tel:${f.telefono.replace(/\s/g, "")}`}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <Phone size={18} aria-hidden="true" />
        Chiama {f.nome}
      </a>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatoBadge from "@/components/StatoBadge";
import GraficoRiabilitazione from "@/components/GraficoRiabilitazione";
import { pazienti, fisioterapisti, medici, Richiesta, Posizione, Valutazione } from "@/lib/demoData";

type StatoGeo = "inattivo" | "caricamento" | "attivo" | "errore";

export default function DashboardPaziente() {
  const { utente, richieste, aggiungiRichiesta, addToast, posizioni, aggiornaPosizione, valutazioni, aggiungiValutazione } = useApp();
  const router = useRouter();
  const [mostraModulo, setMostraModulo] = useState(false);
  const [invio, setInvio] = useState(false);
  const [statoGeo, setStatoGeo] = useState<StatoGeo>("inattivo");
  const [erroreGeo, setErroreGeo] = useState("");
  const [notificheAttive, setNotificheAttive] = useState(false);

  const [form, setForm] = useState({
    patologia: "",
    descrizione: "",
    tipoIntervento: "domiciliare" as "domiciliare" | "studio",
    urgenza: "normale" as "normale" | "urgente",
  });

  useEffect(() => {
    if (!utente || utente.ruolo !== "paziente") router.push("/");
  }, [utente, router]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificheAttive(Notification.permission === "granted");
    }
  }, []);

  if (!utente || utente.ruolo !== "paziente") return null;

  const miaPos = posizioni[utente.id];

  function condividiPosizione() {
    if (!navigator.geolocation) {
      addToast("Il dispositivo non supporta la geolocalizzazione.", "errore");
      return;
    }
    setStatoGeo("caricamento");
    setErroreGeo("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuova: Posizione = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        aggiornaPosizione(utente!.id, nuova);
        setStatoGeo("attivo");
        addToast("Posizione condivisa! Il fisioterapista potrà vederla.", "successo");
      },
      (err) => {
        setStatoGeo("errore");
        setErroreGeo(
          err.code === 1
            ? "Permesso negato. Abilita la geolocalizzazione nelle impostazioni del browser."
            : "Impossibile rilevare la posizione. Riprova."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function attivaNotifiche() {
    if (!("Notification" in window)) {
      addToast("Il browser non supporta le notifiche.", "errore");
      return;
    }
    const permesso = await Notification.requestPermission();
    if (permesso === "granted") {
      setNotificheAttive(true);
      addToast("Notifiche attivate!", "successo");
      // Demo: mostra notifica dopo 3s
      setTimeout(() => {
        const prossimoApp = mieRichieste
          .flatMap((r) => r.appuntamenti.filter((a) => !a.completato))
          .sort((a, b) => a.data.localeCompare(b.data))[0];
        if (prossimoApp) {
          new Notification("RehabConnect — Promemoria seduta", {
            body: `Ricorda: hai una seduta il ${new Date(prossimoApp.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore ${prossimoApp.ora}.`,
            icon: "/icons/icon-192.png",
          });
        }
      }, 3000);
    } else {
      addToast("Permesso notifiche negato. Abilitalo nelle impostazioni del browser.", "errore");
    }
  }

  const paziente = pazienti.find((p) => p.id === utente.id);
  const medico = medici.find((m) => m.id === paziente?.medicoId);
  const mieRichieste = richieste.filter((r) => r.pazienteId === utente.id);

  const attive = mieRichieste.filter((r) =>
    ["in_attesa", "in_valutazione", "assegnata", "in_corso"].includes(r.stato)
  );
  const concluse = mieRichieste.filter((r) =>
    ["completata", "rifiutata"].includes(r.stato)
  );

  const tuttiAppuntamenti = mieRichieste.flatMap((r) => r.appuntamenti);
  const mieValutazioni = valutazioni.filter((v) => v.pazienteId === utente.id);

  const richiestaInCorso = mieRichieste.find((r) => r.stato === "in_corso");

  async function handleInvio(e: React.FormEvent) {
    e.preventDefault();
    setInvio(true);
    await new Promise((r) => setTimeout(r, 600));

    const nuovaRichiesta: Richiesta = {
      id: `req-${Date.now()}`,
      pazienteId: utente!.id,
      medicoId: paziente?.medicoId ?? "med-001",
      stato: "in_attesa",
      dataCreazione: new Date().toISOString().split("T")[0],
      dataAggiornamento: new Date().toISOString().split("T")[0],
      patologia: form.patologia,
      descrizione: form.descrizione,
      tipoIntervento: form.tipoIntervento,
      urgenza: form.urgenza,
      appuntamenti: [],
    };

    aggiungiRichiesta(nuovaRichiesta);
    addToast("Richiesta inviata! Il tuo medico la valuterà a breve.", "successo");
    setMostraModulo(false);
    setInvio(false);
    setForm({ patologia: "", descrizione: "", tipoIntervento: "domiciliare", urgenza: "normale" });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Intestazione paziente */}
        <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🧑‍🦽
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">
                {paziente?.nome} {paziente?.cognome}
              </h1>
              <p className="text-blue-100 text-sm">{paziente?.indirizzo}</p>
              {medico && (
                <p className="text-blue-200 text-xs mt-0.5">
                  Medico: Dr.ssa {medico.cognome} · {medico.ambulatorio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contatori */}
        {mieRichieste.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "In corso", valore: mieRichieste.filter(r => ["assegnata","in_corso"].includes(r.stato)).length, colore: "text-green-600" },
              { label: "In attesa", valore: mieRichieste.filter(r => ["in_attesa","in_valutazione"].includes(r.stato)).length, colore: "text-yellow-600" },
              { label: "Totali", valore: mieRichieste.length, colore: "text-gray-700 dark:text-gray-300" },
            ].map((s) => (
              <div key={s.label} className="card text-center py-3">
                <div className={`text-xl font-bold ${s.colore}`}>{s.valore}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Grafico progresso */}
        {tuttiAppuntamenti.length > 0 && (
          <GraficoRiabilitazione
            appuntamenti={tuttiAppuntamenti}
            valutazioni={mieValutazioni}
          />
        )}

        {/* Promemoria notifiche */}
        <div className="card flex items-center gap-3">
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Promemoria appuntamenti</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notificheAttive ? "Notifiche browser attive" : "Ricevi notifiche browser prima di ogni seduta"}
            </p>
          </div>
          {notificheAttive ? (
            <span className="badge bg-green-100 text-green-700 shrink-0">Attive</span>
          ) : (
            <button
              onClick={attivaNotifiche}
              className="shrink-0 text-xs btn-primary py-1.5 px-3"
            >
              Attiva
            </button>
          )}
        </div>

        {/* Bottone nuova richiesta */}
        {!mostraModulo && (
          <button
            onClick={() => setMostraModulo(true)}
            className="btn-primary w-full"
          >
            + Nuova richiesta di riabilitazione
          </button>
        )}

        {/* Modulo nuova richiesta */}
        {mostraModulo && (
          <div className="card border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold dark:text-gray-100">Nuova richiesta</h2>
              <button
                onClick={() => setMostraModulo(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Chiudi modulo"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleInvio} className="space-y-4">
              <div>
                <label className="label">Patologia / diagnosi *</label>
                <input
                  className="input-field"
                  placeholder="Es. lombalgia, protesi anca, ictus..."
                  value={form.patologia}
                  onChange={(e) => setForm({ ...form, patologia: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Descrizione del problema *</label>
                <textarea
                  className="input-field min-h-[90px] resize-none"
                  placeholder="Descrivi brevemente la situazione e le tue necessità..."
                  value={form.descrizione}
                  onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo intervento</label>
                  <select
                    className="input-field"
                    value={form.tipoIntervento}
                    onChange={(e) =>
                      setForm({ ...form, tipoIntervento: e.target.value as "domiciliare" | "studio" })
                    }
                  >
                    <option value="domiciliare">🏠 Domiciliare</option>
                    <option value="studio">🏥 In studio</option>
                  </select>
                </div>
                <div>
                  <label className="label">Urgenza</label>
                  <select
                    className="input-field"
                    value={form.urgenza}
                    onChange={(e) =>
                      setForm({ ...form, urgenza: e.target.value as "normale" | "urgente" })
                    }
                  >
                    <option value="normale">Normale</option>
                    <option value="urgente">🚨 Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={invio}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {invio ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    "Invia richiesta"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMostraModulo(false)}
                  className="btn-secondary"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Richieste attive */}
        {attive.length > 0 && (
          <section>
            <h2 className="mb-3 dark:text-gray-100">Richieste attive</h2>
            <div className="space-y-3">
              {attive.map((r) => (
                <RichiestaCard
                  key={r.id}
                  richiesta={r}
                  valutazioni={valutazioni}
                  aggiungiValutazione={aggiungiValutazione}
                  pazienteId={utente.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Valuta seduta completata */}
        {richiestaInCorso && (() => {
          const appCompleto = richiestaInCorso.appuntamenti.find(
            (a) => a.completato && !valutazioni.some((v) => v.appuntamentoId === a.id)
          );
          if (!appCompleto) return null;
          return (
            <ValutazioneCard
              appuntamento={appCompleto}
              richiestaId={richiestaInCorso.id}
              pazienteId={utente.id}
              aggiungiValutazione={aggiungiValutazione}
              addToast={addToast}
            />
          );
        })()}

        {/* Storico */}
        {concluse.length > 0 && (
          <section>
            <h2 className="mb-3 text-gray-500 dark:text-gray-400">Storico</h2>
            <div className="space-y-3 opacity-75">
              {concluse.map((r) => (
                <RichiestaCard
                  key={r.id}
                  richiesta={r}
                  valutazioni={valutazioni}
                  aggiungiValutazione={aggiungiValutazione}
                  pazienteId={utente.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {mieRichieste.length === 0 && !mostraModulo && (
          <div className="card text-center py-14">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Nessuna richiesta ancora</p>
            <p className="text-gray-400 text-sm">
              Clicca il bottone sopra per richiedere assistenza riabilitativa.
            </p>
          </div>
        )}

        {/* Sezione posizione */}
        <div className="card border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold dark:text-gray-100">📍 La mia posizione</h2>
            <Link href="/mappa" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Vedi mappa →
            </Link>
          </div>

          {miaPos ? (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">Posizione condivisa</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                  {miaPos.indirizzo
                    ? miaPos.indirizzo
                    : `${miaPos.lat.toFixed(5)}, ${miaPos.lng.toFixed(5)}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Condividi la tua posizione per permettere al fisioterapista di raggiungerti facilmente.
            </p>
          )}

          {erroreGeo && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
              {erroreGeo}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={condividiPosizione}
              disabled={statoGeo === "caricamento"}
              className="btn-primary text-sm py-2 flex items-center gap-2 disabled:opacity-60"
            >
              {statoGeo === "caricamento" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rilevamento...
                </>
              ) : (
                `📍 ${miaPos ? "Aggiorna posizione" : "Condividi posizione"}`
              )}
            </button>
            <Link href="/mappa" className="btn-secondary text-sm py-2">
              🗺️ Mappa
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

interface RichiestaCardProps {
  richiesta: Richiesta;
  valutazioni: Valutazione[];
  aggiungiValutazione: (v: Valutazione) => void;
  pazienteId: string;
}

function RichiestaCard({ richiesta: r, valutazioni, aggiungiValutazione, pazienteId }: RichiestaCardProps) {
  const { messaggi } = useApp();
  const fis = fisioterapisti.find((f) => f.id === r.fisioterapistaId);
  const prossimoApp = r.appuntamenti.find((a) => !a.completato);
  const nMsg = messaggi.filter((m) => m.richiestaId === r.id).length;

  return (
    <div className="card hover:shadow-md transition-shadow dark:hover:shadow-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.patologia}</h3>
            {r.urgenza === "urgente" && (
              <span className="badge bg-red-100 text-red-700">🚨 Urgente</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{r.descrizione}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>{r.tipoIntervento === "domiciliare" ? "🏠 Domiciliare" : "🏥 In studio"}</span>
            <span>Inviata il {new Date(r.dataCreazione).toLocaleDateString("it-IT")}</span>
          </div>
          {fis && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
              👤 {fis.nome} {fis.cognome} — {fis.specializzazione}
            </p>
          )}
          {prossimoApp && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              📅 Prossimo:{" "}
              {new Date(prossimoApp.data).toLocaleDateString("it-IT", {
                weekday: "long", day: "numeric", month: "long"
              })}{" "}
              ore {prossimoApp.ora}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={`/chat/${r.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
              {nMsg > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                  {nMsg}
                </span>
              )}
            </Link>
          </div>
        </div>
        <StatoBadge stato={r.stato} />
      </div>
    </div>
  );
}

interface ValutazioneCardProps {
  appuntamento: { id: string; data: string; ora: string; richiestaId?: string };
  richiestaId: string;
  pazienteId: string;
  aggiungiValutazione: (v: Valutazione) => void;
  addToast: (msg: string, tipo?: "successo" | "errore" | "info") => void;
}

function ValutazioneCard({ appuntamento, richiestaId, pazienteId, aggiungiValutazione, addToast }: ValutazioneCardProps) {
  const [stelle, setStelle] = useState(0);
  const [nota, setNota] = useState("");
  const [inviato, setInviato] = useState(false);

  if (inviato) return null;

  function invia() {
    if (stelle === 0) {
      addToast("Seleziona un numero di stelle.", "errore");
      return;
    }
    const val: Valutazione = {
      id: `val-${Date.now()}`,
      richiestaId,
      appuntamentoId: appuntamento.id,
      pazienteId,
      stelle: stelle as 1|2|3|4|5,
      nota: nota.trim() || undefined,
      data: new Date().toISOString().split("T")[0],
    };
    aggiungiValutazione(val);
    addToast("Grazie per la tua valutazione!", "successo");
    setInviato(true);
  }

  return (
    <div className="card border-2 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">⭐</span>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Valuta la seduta</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(appuntamento.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore {appuntamento.ora}
          </p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            onClick={() => setStelle(s)}
            className={`text-3xl transition-transform hover:scale-110 ${s <= stelle ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            aria-label={`${s} stelle`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="input-field text-sm resize-none min-h-[60px] mb-3"
        placeholder="Lascia un commento (opzionale)..."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />
      <div className="flex gap-3">
        <button onClick={invia} disabled={stelle === 0} className="btn-primary flex-1 py-2 text-sm disabled:opacity-50">
          Invia valutazione
        </button>
        <button onClick={() => setInviato(true)} className="btn-secondary py-2 px-4 text-sm">
          Salta
        </button>
      </div>
    </div>
  );
}

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

function calcolaCompleanno(dataNascita: string): { isOggi: boolean; anni: number } {
  const oggi = new Date();
  const bDay = new Date(dataNascita);
  const isOggi =
    oggi.getMonth() === bDay.getMonth() && oggi.getDate() === bDay.getDate();
  const anni = oggi.getFullYear() - bDay.getFullYear();
  return { isOggi, anni };
}

export default function DashboardPaziente() {
  const {
    utente, richieste, aggiungiRichiesta, addToast,
    posizioni, aggiornaPosizione,
    valutazioni, aggiungiValutazione,
    notifiche, aggiungiNotifica,
  } = useApp();
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

  // Notifica compleanno — una volta per sessione/anno
  useEffect(() => {
    if (!utente || !paziente) return;
    const { isOggi, anni } = calcolaCompleanno(paziente.dataNascita);
    if (!isOggi) return;
    const chiave = `rc-bday-${utente.id}-${new Date().getFullYear()}`;
    if (localStorage.getItem(chiave)) return;
    aggiungiNotifica({
      id: `notif-bday-${Date.now()}`,
      destinatarioId: utente.id,
      testo: `🎂 Buon compleanno ${paziente.nome}! Oggi compi ${anni} anni. Tanti auguri dal team RehabConnect!`,
      tipo: "successo",
      letto: false,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(chiave, "1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utente?.id]);

  if (!utente || utente.ruolo !== "paziente") return null;

  const miaPos = posizioni[utente.id];
  const paziente = pazienti.find((p) => p.id === utente.id);
  const medico = medici.find((m) => m.id === paziente?.medicoId);
  const mieRichieste = richieste.filter((r) => r.pazienteId === utente.id);
  const mieValutazioni = valutazioni.filter((v) => v.pazienteId === utente.id);
  const tuttiAppuntamenti = mieRichieste.flatMap((r) => r.appuntamenti);

  const attive = mieRichieste.filter((r) =>
    ["in_attesa", "in_valutazione", "assegnata", "in_corso"].includes(r.stato)
  );
  const concluse = mieRichieste.filter((r) =>
    ["completata", "rifiutata"].includes(r.stato)
  );

  const richiestaInCorso = mieRichieste.find((r) => r.stato === "in_corso");
  const fisioAssegnato = richiestaInCorso?.fisioterapistaId
    ? fisioterapisti.find((f) => f.id === richiestaInCorso.fisioterapistaId)
    : null;
  const prossimoApp = richiestaInCorso?.appuntamenti.find((a) => !a.completato);

  const { isOggi: isCompleanno, anni: etaOggi } = paziente
    ? calcolaCompleanno(paziente.dataNascita)
    : { isOggi: false, anni: 0 };

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
      setTimeout(() => {
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
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ===== BANNER COMPLEANNO ===== */}
        {isCompleanno && (
          <div className="card bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="text-5xl shrink-0 animate-bounce">🎂</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold leading-tight">
                  Buon compleanno, {paziente?.nome}! 🎉
                </h2>
                <p className="text-yellow-100 mt-0.5">
                  Oggi compi <strong>{etaOggi} anni</strong>. Tanti auguri di cuore!
                </p>
                <p className="text-yellow-200 text-sm mt-1">
                  Dal tuo medico, dal fisioterapista e da tutto il team RehabConnect
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== INTESTAZIONE PAZIENTE ===== */}
        <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shrink-0">
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

        {/* ===== PROSSIMO APPUNTAMENTO (senior-friendly) ===== */}
        {prossimoApp && fisioAssegnato && (
          <div className="card border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📅</span>
              <h2 className="text-base font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
                Prossima seduta
              </h2>
            </div>

            {/* Data e ora — testo molto grande */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {new Date(prossimoApp.data).toLocaleDateString("it-IT", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                ore {prossimoApp.ora}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Durata: {prossimoApp.durata} minuti · {prossimoApp.luogo}
              </p>
            </div>

            {/* Fisioterapista */}
            <div className="flex items-center gap-3 mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-2xl shrink-0">
                🏥
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {fisioAssegnato.nome} {fisioAssegnato.cognome}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fisioAssegnato.specializzazione}
                </p>
              </div>
              <div className="text-yellow-500 font-bold shrink-0">
                ★ {fisioAssegnato.valutazione}
              </div>
            </div>

            {/* Pulsanti azione — grandi e chiari */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${fisioAssegnato.telefono.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl text-base transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Chiama
              </a>
              <Link
                href={`/chat/${richiestaInCorso?.id}`}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl text-base transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Scrivi
              </Link>
            </div>
          </div>
        )}

        {/* ===== NESSUN APPUNTAMENTO — messaggio semplice ===== */}
        {richiestaInCorso && !prossimoApp && (
          <div className="card border-2 border-gray-200 dark:border-gray-700 text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">
              Tutte le sedute completate!
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Il fisioterapista programmerà le prossime sedute a breve.
            </p>
          </div>
        )}

        {/* ===== CONTATORI ===== */}
        {mieRichieste.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "In corso", valore: mieRichieste.filter(r => ["assegnata","in_corso"].includes(r.stato)).length, colore: "text-green-600" },
              { label: "In attesa", valore: mieRichieste.filter(r => ["in_attesa","in_valutazione"].includes(r.stato)).length, colore: "text-yellow-600" },
              { label: "Totali", valore: mieRichieste.length, colore: "text-gray-700 dark:text-gray-300" },
            ].map((s) => (
              <div key={s.label} className="card text-center py-4">
                <div className={`text-2xl font-bold ${s.colore}`}>{s.valore}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== GRAFICO PROGRESSO ===== */}
        {tuttiAppuntamenti.length > 0 && (
          <GraficoRiabilitazione
            appuntamenti={tuttiAppuntamenti}
            valutazioni={mieValutazioni}
          />
        )}

        {/* ===== PROMEMORIA NOTIFICHE ===== */}
        <div className="card flex items-center gap-4 py-4">
          <span className="text-3xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-gray-100">Promemoria appuntamenti</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {notificheAttive
                ? "✅ Riceverai un avviso prima di ogni seduta"
                : "Attiva gli avvisi per non dimenticare le sedute"}
            </p>
          </div>
          {notificheAttive ? (
            <span className="badge bg-green-100 text-green-700 shrink-0">Attive</span>
          ) : (
            <button
              onClick={attivaNotifiche}
              className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Attiva
            </button>
          )}
        </div>

        {/* ===== BOTTONE NUOVA RICHIESTA ===== */}
        {!mostraModulo && (
          <button
            onClick={() => setMostraModulo(true)}
            className="btn-primary w-full py-4 text-base font-bold"
          >
            ＋ Nuova richiesta di riabilitazione
          </button>
        )}

        {/* ===== MODULO NUOVA RICHIESTA ===== */}
        {mostraModulo && (
          <div className="card border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold dark:text-gray-100">Nuova richiesta</h2>
              <button
                onClick={() => setMostraModulo(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleInvio} className="space-y-4">
              <div>
                <label className="label text-base">Patologia / diagnosi *</label>
                <input
                  className="input-field py-3 text-base"
                  placeholder="Es. lombalgia, protesi anca, ictus..."
                  value={form.patologia}
                  onChange={(e) => setForm({ ...form, patologia: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label text-base">Descrizione del problema *</label>
                <textarea
                  className="input-field min-h-[90px] resize-none py-3 text-base"
                  placeholder="Descrivi brevemente la situazione..."
                  value={form.descrizione}
                  onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-base">Dove preferisci?</label>
                  <select
                    className="input-field py-3 text-base"
                    value={form.tipoIntervento}
                    onChange={(e) =>
                      setForm({ ...form, tipoIntervento: e.target.value as "domiciliare" | "studio" })
                    }
                  >
                    <option value="domiciliare">🏠 A casa mia</option>
                    <option value="studio">🏥 In studio</option>
                  </select>
                </div>
                <div>
                  <label className="label text-base">Urgenza</label>
                  <select
                    className="input-field py-3 text-base"
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
                  className="btn-primary flex-1 py-4 text-base font-bold flex items-center justify-center gap-2"
                >
                  {invio ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Invio in corso...
                    </>
                  ) : "Invia richiesta"}
                </button>
                <button type="button" onClick={() => setMostraModulo(false)} className="btn-secondary py-4 px-5 text-base">
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== RICHIESTE ATTIVE ===== */}
        {attive.length > 0 && (
          <section>
            <h2 className="mb-3 dark:text-gray-100">Le mie richieste attive</h2>
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

        {/* ===== VALUTA SEDUTA ===== */}
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

        {/* ===== STORICO ===== */}
        {concluse.length > 0 && (
          <section>
            <h2 className="mb-3 text-gray-500 dark:text-gray-400">Storico richieste</h2>
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

        {/* ===== EMPTY STATE ===== */}
        {mieRichieste.length === 0 && !mostraModulo && (
          <div className="card text-center py-14">
            <div className="text-6xl mb-4">📋</div>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-2">Nessuna richiesta ancora</p>
            <p className="text-gray-400 text-base">
              Clicca il bottone verde sopra per chiedere assistenza riabilitativa.
            </p>
          </div>
        )}

        {/* ===== POSIZIONE GPS ===== */}
        <div className="card border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold dark:text-gray-100">📍 La mia posizione</h2>
            <Link href="/mappa" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Vedi mappa →
            </Link>
          </div>

          {miaPos ? (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-300">Posizione condivisa</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                  {miaPos.indirizzo ?? `${miaPos.lat.toFixed(5)}, ${miaPos.lng.toFixed(5)}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Condividi la tua posizione per permettere al fisioterapista di raggiungerti facilmente.
            </p>
          )}

          {erroreGeo && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-3">
              {erroreGeo}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={condividiPosizione}
              disabled={statoGeo === "caricamento"}
              className="btn-primary flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {statoGeo === "caricamento" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rilevamento...
                </>
              ) : (
                `📍 ${miaPos ? "Aggiorna posizione" : "Condividi posizione"}`
              )}
            </button>
            <Link href="/mappa" className="btn-secondary py-3 px-5 text-base font-bold">
              🗺️ Mappa
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

// ─── RichiestaCard ───────────────────────────────────────────────────────────

interface RichiestaCardProps {
  richiesta: Richiesta;
  valutazioni: Valutazione[];
  aggiungiValutazione: (v: Valutazione) => void;
  pazienteId: string;
}

function RichiestaCard({ richiesta: r }: RichiestaCardProps) {
  const { messaggi } = useApp();
  const fis = fisioterapisti.find((f) => f.id === r.fisioterapistaId);
  const prossimoApp = r.appuntamenti.find((a) => !a.completato);
  const nMsg = messaggi.filter((m) => m.richiestaId === r.id).length;

  return (
    <div className="card hover:shadow-md transition-shadow dark:hover:shadow-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{r.patologia}</h3>
            {r.urgenza === "urgente" && (
              <span className="badge bg-red-100 text-red-700">🚨 Urgente</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{r.descrizione}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-400">
            <span>{r.tipoIntervento === "domiciliare" ? "🏠 A casa" : "🏥 In studio"}</span>
            <span>Inviata il {new Date(r.dataCreazione).toLocaleDateString("it-IT")}</span>
          </div>
          {fis && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
              👤 {fis.nome} {fis.cognome}
            </p>
          )}
          {prossimoApp && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
              📅 {new Date(prossimoApp.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore {prossimoApp.ora}
            </p>
          )}
          <div className="mt-3">
            <Link
              href={`/chat/${r.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium"
            >
              💬 Chat
              {nMsg > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{nMsg}</span>
              )}
            </Link>
          </div>
        </div>
        <StatoBadge stato={r.stato} />
      </div>
    </div>
  );
}

// ─── ValutazioneCard ──────────────────────────────────────────────────────────

interface ValutazioneCardProps {
  appuntamento: { id: string; data: string; ora: string };
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
    if (stelle === 0) { addToast("Seleziona un numero di stelle.", "errore"); return; }
    aggiungiValutazione({
      id: `val-${Date.now()}`,
      richiestaId,
      appuntamentoId: appuntamento.id,
      pazienteId,
      stelle: stelle as 1|2|3|4|5,
      nota: nota.trim() || undefined,
      data: new Date().toISOString().split("T")[0],
    });
    addToast("Grazie per la tua valutazione!", "successo");
    setInviato(true);
  }

  return (
    <div className="card border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">⭐</span>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Come è andata la seduta?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(appuntamento.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore {appuntamento.ora}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mb-4 justify-center">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            onClick={() => setStelle(s)}
            className={`text-4xl transition-transform hover:scale-110 active:scale-95 ${s <= stelle ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            aria-label={`${s} stelle`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="input-field text-base resize-none min-h-[70px] mb-4"
        placeholder="Aggiungi un commento (opzionale)..."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />
      <div className="flex gap-3">
        <button onClick={invia} disabled={stelle === 0} className="btn-primary flex-1 py-3 text-base font-bold disabled:opacity-50">
          Invia valutazione
        </button>
        <button onClick={() => setInviato(true)} className="btn-secondary py-3 px-5 text-base">
          Salta
        </button>
      </div>
    </div>
  );
}

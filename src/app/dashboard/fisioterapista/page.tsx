"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatoBadge from "@/components/StatoBadge";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MarkerDati } from "@/components/MappaLeaflet";
import { pazienti, fisioterapisti, Appuntamento, Posizione, FotoEsercizio } from "@/lib/demoData";

const MappaLeaflet = dynamic(() => import("@/components/MappaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm animate-pulse">
      📡 Caricamento mappa...
    </div>
  ),
});

const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function getSettimana(): Date[] {
  const oggi = new Date();
  const giorno = oggi.getDay() || 7;
  const lunedi = new Date(oggi);
  lunedi.setDate(oggi.getDate() - giorno + 1);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lunedi);
    d.setDate(lunedi.getDate() + i);
    return d;
  });
}

type Vista = "incarichi" | "agenda" | "mappa";
type StatoGeo = "inattivo" | "caricamento" | "attivo" | "errore";

export default function DashboardFisioterapista() {
  const { utente, richieste, aggiornaRichiesta, addToast, posizioni, aggiornaPosizione, fotoEsercizi, aggiungiFoto } = useApp();
  const router = useRouter();
  const [vista, setVista] = useState<Vista>("incarichi");
  const [confermaRifiuto, setConfermaRifiuto] = useState<string | null>(null);
  const [statoGeo, setStatoGeo] = useState<StatoGeo>("inattivo");
  const [erroreGeo, setErroreGeo] = useState("");

  useEffect(() => {
    if (!utente || utente.ruolo !== "fisioterapista") router.push("/");
  }, [utente, router]);

  if (!utente || utente.ruolo !== "fisioterapista") return null;

  const fis = fisioterapisti.find((f) => f.id === utente.id);
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
        addToast("Posizione condivisa! I pazienti potranno vederla sulla mappa.", "successo");
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

  // Incarichi assegnati a questo fisioterapista (in attesa accettazione + in corso)
  const incarichi = richieste.filter(
    (r) =>
      r.fisioterapistaId === utente.id &&
      ["assegnata", "in_corso"].includes(r.stato)
  );

  const completati = richieste.filter(
    (r) => r.fisioterapistaId === utente.id && r.stato === "completata"
  );

  function accetta(id: string) {
    aggiornaRichiesta(id, { stato: "in_corso" });
    addToast("Incarico accettato! Ora è in corso.", "successo");
  }

  function rifiuta(id: string) {
    aggiornaRichiesta(id, { stato: "in_attesa", fisioterapistaId: undefined });
    addToast("Incarico rifiutato. Tornerà in attesa di assegnazione.", "info");
    setConfermaRifiuto(null);
  }

  function segnaCompletato(id: string) {
    aggiornaRichiesta(id, { stato: "completata" });
    addToast("Incarico segnato come completato.", "successo");
  }

  function segnaAppuntamento(richiestaId: string, appId: string) {
    const richiesta = richieste.find((r) => r.id === richiestaId);
    if (!richiesta) return;
    const nuoviApp: Appuntamento[] = richiesta.appuntamenti.map((a) =>
      a.id === appId ? { ...a, completato: true } : a
    );
    aggiornaRichiesta(richiestaId, { appuntamenti: nuoviApp });
    addToast("Seduta segnata come completata.", "successo");
  }

  const settimana = getSettimana();
  const tuttiAppuntamenti = richieste
    .filter((r) => r.fisioterapistaId === utente.id)
    .flatMap((r) =>
      r.appuntamenti.map((a) => ({
        ...a,
        patologia: r.patologia,
        pazienteId: r.pazienteId,
        richiestaId: r.id,
      }))
    );

  const pendingAccettazione = incarichi.filter((r) => r.stato === "assegnata");
  const inCorso = incarichi.filter((r) => r.stato === "in_corso");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Intestazione */}
        <div className="card bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🏥
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">
                {fis?.nome} {fis?.cognome}
              </h1>
              <p className="text-purple-100 text-sm">{fis?.specializzazione}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-300 text-sm">★ {fis?.valutazione}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fis?.disponibile ? "bg-white/20 text-white" : "bg-white/10 text-purple-200"}`}>
                  {fis?.disponibile ? "Disponibile" : "Non disponibile"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert incarichi da accettare */}
        {pendingAccettazione.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
            <p className="font-semibold text-orange-800">
              📬 {pendingAccettazione.length} nuovo{pendingAccettazione.length > 1 ? "i" : ""} incarico{pendingAccettazione.length > 1 ? "i" : ""} da accettare
            </p>
            <p className="text-orange-700 text-sm mt-1">
              Hai richieste assegnate che attendono la tua conferma.
            </p>
          </div>
        )}

        {/* Contatori */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Da accettare", valore: pendingAccettazione.length, colore: "text-orange-600" },
            { label: "In corso", valore: inCorso.length, colore: "text-green-600" },
            { label: "Completati", valore: completati.length, colore: "text-gray-600" },
          ].map((s) => (
            <div key={s.label} className="card text-center py-3">
              <div className={`text-xl font-bold ${s.colore}`}>{s.valore}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab */}
        <div className="flex gap-2 border-b border-gray-200">
          {([
            { id: "incarichi", label: "📋 Incarichi" },
            { id: "agenda", label: "📅 Agenda" },
            { id: "mappa", label: "🗺️ Mappa" },
          ] as { id: Vista; label: string }[]).map((v) => (
            <button
              key={v.id}
              onClick={() => setVista(v.id)}
              className={`pb-3 px-4 text-sm font-medium transition-colors ${
                vista === v.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.label}
              {v.id === "incarichi" && pendingAccettazione.length > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingAccettazione.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vista incarichi */}
        {vista === "incarichi" && (
          <div className="space-y-4">

            {/* Da accettare */}
            {pendingAccettazione.length > 0 && (
              <section>
                <h2 className="mb-3 text-orange-700">Da accettare</h2>
                <div className="space-y-3">
                  {pendingAccettazione.map((r) => {
                    const paz = pazienti.find((p) => p.id === r.pazienteId);
                    return (
                      <div key={r.id} className="card border-2 border-orange-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{r.patologia}</h3>
                            <p className="text-sm text-gray-600">
                              {paz?.nome} {paz?.cognome}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {r.tipoIntervento === "domiciliare" ? "🏠" : "🏥"}{" "}
                              {r.tipoIntervento} · {paz?.indirizzo}
                            </p>
                            {r.urgenza === "urgente" && (
                              <span className="badge bg-red-100 text-red-700 mt-1">🚨 Urgente</span>
                            )}
                            {r.noteMedico && (
                              <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 mt-2">
                                <span className="font-medium">Note del medico:</span> {r.noteMedico}
                              </div>
                            )}
                          </div>
                          <StatoBadge stato={r.stato} />
                          <Link href={`/chat/${r.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">💬 Chat</Link>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => accetta(r.id)}
                            className="btn-success flex-1 py-2 text-sm"
                          >
                            ✓ Accetta incarico
                          </button>
                          {confermaRifiuto === r.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => rifiuta(r.id)}
                                className="btn-danger py-2 px-3 text-sm"
                              >
                                Conferma rifiuto
                              </button>
                              <button
                                onClick={() => setConfermaRifiuto(null)}
                                className="btn-secondary py-2 px-3 text-sm"
                              >
                                Annulla
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfermaRifiuto(r.id)}
                              className="btn-secondary py-2 px-3 text-sm text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Rifiuta
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* In corso */}
            {inCorso.length > 0 && (
              <section>
                <h2 className="mb-3">In corso</h2>
                <div className="space-y-3">
                  {inCorso.map((r) => {
                    const paz = pazienti.find((p) => p.id === r.pazienteId);
                    const appPendenti = r.appuntamenti.filter((a) => !a.completato);
                    const appCompletati = r.appuntamenti.filter((a) => a.completato);
                    return (
                      <div key={r.id} className="card">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{r.patologia}</h3>
                            <p className="text-sm text-gray-600">
                              {paz?.nome} {paz?.cognome}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {r.tipoIntervento === "domiciliare" ? "🏠" : "🏥"}{" "}
                              {paz?.telefono}
                            </p>
                            {r.noteMedico && (
                              <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 mt-2">
                                <span className="font-medium">Note del medico:</span> {r.noteMedico}
                              </div>
                            )}
                          </div>
                          <StatoBadge stato={r.stato} />
                          <Link href={`/chat/${r.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">💬 Chat</Link>
                        </div>

                        {appPendenti.length > 0 && (
                          <div className="space-y-2 mb-3">
                            <p className="text-xs font-medium text-gray-600">
                              Prossime sedute:
                            </p>
                            {appPendenti.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2"
                              >
                                <div className="text-sm">
                                  <span className="font-medium text-gray-800">
                                    {new Date(a.data).toLocaleDateString("it-IT", {
                                      weekday: "short", day: "numeric", month: "short"
                                    })}
                                  </span>
                                  <span className="text-gray-500"> ore {a.ora}</span>
                                </div>
                                <button
                                  onClick={() => segnaAppuntamento(r.id, a.id)}
                                  className="text-xs text-green-700 hover:text-green-900 font-medium"
                                >
                                  Segna ✓
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {appCompletati.length > 0 && (
                          <p className="text-xs text-gray-400 mb-3">
                            {appCompletati.length} seduta{appCompletati.length > 1 ? "e" : ""} completata{appCompletati.length > 1 ? "e" : ""}
                          </p>
                        )}

                        {/* Foto esercizi */}
                        <FotoUpload
                          richiestaId={r.id}
                          fisioterapistaId={utente.id}
                          foto={fotoEsercizi.filter((f) => f.richiestaId === r.id)}
                          aggiungiFoto={aggiungiFoto}
                          addToast={addToast}
                        />

                        {appPendenti.length === 0 && (
                          <button
                            onClick={() => segnaCompletato(r.id)}
                            className="btn-primary w-full py-2 text-sm"
                          >
                            ✓ Segna incarico come completato
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty */}
            {incarichi.length === 0 && (
              <div className="card text-center py-14">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-medium text-gray-700 mb-1">Nessun incarico attivo</p>
                <p className="text-gray-400 text-sm">
                  Quando un medico ti assegna una richiesta, apparirà qui.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Vista mappa */}
        {vista === "mappa" && (() => {
          const markers: MarkerDati[] = [];
          if (miaPos) {
            markers.push({ id: utente.id, lat: miaPos.lat, lng: miaPos.lng, emoji: "🏃", label: `Tu — ${fis?.nome} ${fis?.cognome}` });
          }
          incarichi.forEach((r) => {
            const paz = pazienti.find((p) => p.id === r.pazienteId);
            const pos = posizioni[r.pazienteId];
            if (paz && pos) {
              markers.push({ id: r.pazienteId, lat: pos.lat, lng: pos.lng, emoji: "🧑‍🦽", label: `${paz.nome} ${paz.cognome}${pos.indirizzo ? ` — ${pos.indirizzo}` : ""}` });
            }
          });

          return (
            <div className="space-y-4">
              <div className="card p-0 overflow-hidden">
                <MappaLeaflet markers={markers} height="340px" />
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">🏃 Tu (fisioterapista)</span>
                <span className="flex items-center gap-1.5">🧑‍🦽 Paziente</span>
                <span className="ml-auto text-xs text-gray-400">{markers.length} posizione{markers.length !== 1 ? "i" : ""}</span>
              </div>

              {/* Condividi posizione */}
              <div className="card">
                <h3 className="font-semibold mb-3">La mia posizione</h3>
                {miaPos ? (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Posizione condivisa</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {miaPos.lat.toFixed(5)}, {miaPos.lng.toFixed(5)}
                        {miaPos.accuracy ? ` · ≈ ${Math.round(miaPos.accuracy)} m` : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">
                    Condividi la tua posizione GPS per apparire sulla mappa dei pazienti.
                  </p>
                )}
                {erroreGeo && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{erroreGeo}</p>
                )}
                <button
                  onClick={condividiPosizione}
                  disabled={statoGeo === "caricamento"}
                  className="btn-primary text-sm py-2 flex items-center gap-2 disabled:opacity-60"
                >
                  {statoGeo === "caricamento" ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Rilevamento...</>
                  ) : (
                    `📍 ${miaPos ? "Aggiorna posizione" : "Condividi posizione"}`
                  )}
                </button>
              </div>

              {/* Posizioni pazienti */}
              {incarichi.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Pazienti assegnati</h3>
                  {incarichi.map((r) => {
                    const paz = pazienti.find((p) => p.id === r.pazienteId);
                    const pos = posizioni[r.pazienteId];
                    return (
                      <div key={r.id} className="card flex items-center gap-3 py-3">
                        <span className="text-2xl">🧑‍🦽</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{paz?.nome} {paz?.cognome}</p>
                          {pos ? (
                            <p className="text-xs text-green-600">📍 {pos.indirizzo ?? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`}</p>
                          ) : (
                            <p className="text-xs text-gray-400">Posizione non condivisa</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Contatore foto nella tab agenda (info banner) */}
        {/* Vista agenda */}
        {vista === "agenda" && (
          <div>
            <h2 className="mb-4">Settimana corrente</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
              {settimana.map((giorno, i) => {
                const iso = giorno.toISOString().split("T")[0];
                const appGiorno = tuttiAppuntamenti.filter((a) => a.data === iso);
                const isOggi = iso === new Date().toISOString().split("T")[0];
                return (
                  <div
                    key={iso}
                    className={`rounded-xl border p-3 text-center ${
                      isOggi
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isOggi ? "text-purple-600" : "text-gray-500"}`}>
                      {GIORNI[i]}
                    </div>
                    <div className={`text-lg font-bold ${isOggi ? "text-purple-700" : "text-gray-800"}`}>
                      {giorno.getDate()}
                    </div>
                    {appGiorno.length > 0 ? (
                      appGiorno.map((a) => (
                        <div
                          key={a.id}
                          className={`mt-1.5 rounded text-xs px-1 py-0.5 ${a.completato ? "bg-gray-100 text-gray-400 line-through" : "bg-purple-100 text-purple-800"}`}
                        >
                          {a.ora}
                        </div>
                      ))
                    ) : (
                      <div className="mt-2 text-xs text-gray-300">—</div>
                    )}
                  </div>
                );
              })}
            </div>

            {tuttiAppuntamenti.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Tutti gli appuntamenti
                </h3>
                {tuttiAppuntamenti
                  .sort((a, b) => a.data.localeCompare(b.data))
                  .map((a) => {
                    const paz = pazienti.find((p) => p.id === a.pazienteId);
                    return (
                      <div
                        key={a.id}
                        className={`card flex items-center gap-3 text-sm ${a.completato ? "opacity-50" : ""}`}
                      >
                        <div className={`text-2xl ${a.completato ? "grayscale" : ""}`}>📅</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {new Date(a.data).toLocaleDateString("it-IT", {
                              weekday: "long", day: "numeric", month: "long",
                            })}{" "}
                            ore {a.ora}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {paz?.nome} {paz?.cognome} · {a.luogo}
                          </p>
                        </div>
                        {a.completato ? (
                          <span className="badge bg-gray-100 text-gray-500 text-xs">Completata</span>
                        ) : (
                          <button
                            onClick={() => segnaAppuntamento(a.richiestaId, a.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap"
                          >
                            Segna ✓
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="card text-center py-10">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-400">Nessun appuntamento programmato.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface FotoUploadProps {
  richiestaId: string;
  fisioterapistaId: string;
  foto: FotoEsercizio[];
  aggiungiFoto: (f: FotoEsercizio) => void;
  addToast: (msg: string, tipo?: "successo" | "errore" | "info") => void;
}

function FotoUpload({ richiestaId, fisioterapistaId, foto, aggiungiFoto, addToast }: FotoUploadProps) {
  const [aperto, setAperto] = useState(false);
  const [descrizione, setDescrizione] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Seleziona un file immagine.", "errore");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("L'immagine deve essere inferiore a 5 MB.", "errore");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      aggiungiFoto({
        id: `foto-${Date.now()}`,
        richiestaId,
        appuntamentoId: "",
        fisioterapistaId,
        dataUrl,
        descrizione: descrizione.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
      addToast("Foto caricata con successo!", "successo");
      setDescrizione("");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
      <button
        onClick={() => setAperto((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 w-full"
      >
        <span>📷 Foto esercizi</span>
        <span className="ml-auto text-xs text-gray-400">
          {foto.length > 0 ? `${foto.length} foto` : "Aggiungi"}
        </span>
        <svg className={`w-4 h-4 transition-transform ${aperto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aperto && (
        <div className="mt-3 space-y-3">
          {foto.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {foto.map((f) => (
                <div key={f.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.dataUrl}
                    alt={f.descrizione ?? "Foto esercizio"}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  {f.descrizione && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{f.descrizione}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            className="input-field text-sm"
            placeholder="Descrizione (opzionale)..."
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer btn-secondary py-2 text-sm w-full justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Carica immagine
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}
    </div>
  );
}

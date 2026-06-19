"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MarkerDati } from "@/components/MappaLeaflet";
import { pazienti, fisioterapisti, Posizione } from "@/lib/demoData";

const MappaLeaflet = dynamic(() => import("@/components/MappaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm animate-pulse">
      📡 Caricamento mappa...
    </div>
  ),
});

type StatoGeo = "inattivo" | "caricamento" | "attivo" | "errore";

export default function PaginaMappa() {
  const { utente, posizioni, aggiornaPosizione, addToast, richieste } = useApp();
  const router = useRouter();
  const [statoGeo, setStatoGeo] = useState<StatoGeo>("inattivo");
  const [erroreGeo, setErroreGeo] = useState("");

  useEffect(() => {
    if (!utente) router.push("/");
  }, [utente, router]);

  if (!utente) return null;

  const miaPos = posizioni[utente.id];

  // Calcola i marker in base al ruolo
  const markers: MarkerDati[] = [];

  if (utente.ruolo === "paziente") {
    if (miaPos) {
      markers.push({
        id: utente.id,
        lat: miaPos.lat,
        lng: miaPos.lng,
        emoji: "🧑‍🦽",
        label: `Tu — ${miaPos.indirizzo ?? "Posizione condivisa"}`,
      });
    }
    // Fisioterapista assegnato che ha condiviso la posizione
    const mieRichieste = richieste.filter((r) => r.pazienteId === utente.id);
    mieRichieste.forEach((r) => {
      if (r.fisioterapistaId) {
        const pos = posizioni[r.fisioterapistaId];
        const fis = fisioterapisti.find((f) => f.id === r.fisioterapistaId);
        if (pos && fis) {
          markers.push({
            id: r.fisioterapistaId,
            lat: pos.lat,
            lng: pos.lng,
            emoji: "🏃",
            label: `${fis.nome} ${fis.cognome} — Fisioterapista`,
          });
        }
      }
    });
  } else if (utente.ruolo === "fisioterapista") {
    // Posizione propria
    if (miaPos) {
      markers.push({
        id: utente.id,
        lat: miaPos.lat,
        lng: miaPos.lng,
        emoji: "🏃",
        label: `Tu — Fisioterapista`,
      });
    }
    // Pazienti assegnati che hanno condiviso la posizione
    pazienti.forEach((p) => {
      const pos = posizioni[p.id];
      if (pos) {
        markers.push({
          id: p.id,
          lat: pos.lat,
          lng: pos.lng,
          emoji: "🧑‍🦽",
          label: `${p.nome} ${p.cognome} — ${pos.indirizzo ?? "Paziente"}`,
        });
      }
    });
  } else {
    // Medico e Admin: tutti
    pazienti.forEach((p) => {
      const pos = posizioni[p.id];
      if (pos) {
        markers.push({
          id: p.id,
          lat: pos.lat,
          lng: pos.lng,
          emoji: "🧑‍🦽",
          label: `${p.nome} ${p.cognome}${pos.indirizzo ? ` — ${pos.indirizzo}` : ""}`,
        });
      }
    });
    fisioterapisti.forEach((f) => {
      const pos = posizioni[f.id];
      if (pos) {
        markers.push({
          id: f.id,
          lat: pos.lat,
          lng: pos.lng,
          emoji: "🏃",
          label: `${f.nome} ${f.cognome} — Fisioterapista`,
        });
      }
    });
  }

  function condividiPosizione() {
    if (!navigator.geolocation) {
      addToast("Il tuo dispositivo non supporta la geolocalizzazione.", "errore");
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
        addToast("Posizione condivisa con successo!", "successo");
      },
      (err) => {
        setStatoGeo("errore");
        if (err.code === 1) {
          setErroreGeo("Permesso negato. Abilita la geolocalizzazione nel browser.");
        } else {
          setErroreGeo("Impossibile rilevare la posizione. Riprova.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const dashLink =
    utente.ruolo === "paziente" ? "/dashboard/paziente" :
    utente.ruolo === "fisioterapista" ? "/dashboard/fisioterapista" :
    utente.ruolo === "medico" ? "/dashboard/medico" : "/dashboard/admin";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Intestazione */}
        <div className="flex items-center gap-3">
          <Link href={dashLink} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Mappa posizioni</h1>
            <p className="text-gray-500 text-sm">Tempo reale · OpenStreetMap</p>
          </div>
        </div>

        {/* Mappa */}
        <div className="card p-0 overflow-hidden">
          <MappaLeaflet markers={markers} height="380px" />
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="text-xl">🧑‍🦽</span> Paziente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-xl">🏃</span> Fisioterapista
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {markers.length} posizione{markers.length !== 1 ? "i" : ""} visibile{markers.length !== 1 ? "i" : ""}
          </span>
        </div>

        {/* Condividi posizione */}
        {(utente.ruolo === "paziente" || utente.ruolo === "fisioterapista") && (
          <div className="card">
            <h2 className="text-base font-semibold mb-3">
              {utente.ruolo === "paziente"
                ? "La mia posizione"
                : "La mia posizione (fisioterapista)"}
            </h2>

            {miaPos ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-green-800 font-medium text-sm">
                  ✓ Posizione condivisa
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  {miaPos.indirizzo
                    ? miaPos.indirizzo
                    : `${miaPos.lat.toFixed(5)}, ${miaPos.lng.toFixed(5)}`}
                  {miaPos.accuracy
                    ? ` · precisione ≈ ${Math.round(miaPos.accuracy)} m`
                    : ""}
                </p>
                <p className="text-green-600 text-xs mt-0.5">
                  Aggiornata:{" "}
                  {new Date(miaPos.timestamp).toLocaleString("it-IT", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-3">
                Nessuna posizione condivisa. Clicca il bottone per condividere la
                tua posizione attuale con {utente.ruolo === "paziente" ? "il fisioterapista" : "i pazienti"}.
              </p>
            )}

            {erroreGeo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm">
                {erroreGeo}
              </div>
            )}

            <button
              onClick={condividiPosizione}
              disabled={statoGeo === "caricamento"}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {statoGeo === "caricamento" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rilevamento in corso...
                </>
              ) : (
                <>
                  📍 {miaPos ? "Aggiorna la mia posizione" : "Condividi la mia posizione"}
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              La posizione è salvata solo in questa sessione e non viene trasmessa a server esterni.
            </p>
          </div>
        )}

        {/* Lista posizioni */}
        {markers.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Posizioni visibili</h2>
            {markers.map((m) => (
              <div key={m.id} className="card flex items-center gap-3 py-3">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.label}</p>
                  <p className="text-xs text-gray-400">
                    {posizioni[m.id]?.timestamp
                      ? `Aggiornata: ${new Date(posizioni[m.id]!.timestamp).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                  {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}

        {markers.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="font-medium text-gray-700 mb-1">Nessuna posizione disponibile</p>
            <p className="text-gray-400 text-sm">
              Condividi la tua posizione per apparire sulla mappa.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

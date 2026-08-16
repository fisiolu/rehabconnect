"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

type Sezione = "panoramica" | "utenti";

interface FisioReale {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  specializzazioni: string[];
  base_citta: string;
  base_provincia: string;
  numero_albo: string;
  anni_esperienza: number;
  stato_verifica: "in_attesa" | "approvato" | "rifiutato";
  created_at: string;
}

interface PazienteReale {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  indirizzo: string;
  created_at: string;
}

const statoFisioLabel: Record<FisioReale["stato_verifica"], string> = {
  in_attesa: "In attesa",
  approvato: "Approvato",
  rifiutato: "Rifiutato",
};

const statoFisioColore: Record<FisioReale["stato_verifica"], string> = {
  in_attesa: "bg-amber-100 text-amber-700",
  approvato: "bg-green-100 text-green-700",
  rifiutato: "bg-gray-100 text-gray-500",
};

export default function DashboardAdmin() {
  const { utente } = useApp();
  const router = useRouter();
  const [sezione, setSezione] = useState<Sezione>("panoramica");

  const [fisioReali, setFisioReali] = useState<FisioReale[]>([]);
  const [pazientiReali, setPazientiReali] = useState<PazienteReale[]>([]);
  const [caricando, setCaricando] = useState(true);
  const [inCorsoId, setInCorsoId] = useState<string | null>(null);

  const caricaTutto = useCallback(async () => {
    setCaricando(true);
    const supabase = createClient();
    const [fisio, pazienti] = await Promise.all([
      supabase
        .from("fisioterapisti")
        .select(
          "id, nome, cognome, email, telefono, specializzazioni, base_citta, base_provincia, numero_albo, anni_esperienza, stato_verifica, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("pazienti")
        .select("id, nome, cognome, email, telefono, indirizzo, created_at")
        .order("created_at", { ascending: false }),
    ]);
    setFisioReali((fisio.data as FisioReale[]) ?? []);
    setPazientiReali((pazienti.data as PazienteReale[]) ?? []);
    setCaricando(false);
  }, []);

  useEffect(() => {
    if (utente?.ruolo === "admin") caricaTutto();
  }, [utente, caricaTutto]);

  async function approvaRifiuta(id: string, azione: "approva" | "rifiuta") {
    setInCorsoId(id);
    await fetch(`/api/admin/fisioterapisti/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ azione }),
    });
    await caricaTutto();
    setInCorsoId(null);
  }

  useEffect(() => {
    if (!utente || utente.ruolo !== "admin") router.push("/");
  }, [utente, router]);

  if (!utente || utente.ruolo !== "admin") return null;

  const inAttesa = fisioReali.filter((f) => f.stato_verifica === "in_attesa");
  const approvati = fisioReali.filter((f) => f.stato_verifica === "approvato");
  const rifiutati = fisioReali.filter((f) => f.stato_verifica === "rifiutato");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Intestazione */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              ⚙️
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">Pannello Amministratore</h1>
              <p className="text-gray-500 text-sm">Supervisione della piattaforma</p>
            </div>
          </div>
        </div>

        {/* Navigazione sezioni */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(
            [
              { id: "panoramica", label: "📊 Panoramica" },
              { id: "utenti", label: "👥 Utenti" },
            ] as { id: Sezione; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSezione(s.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                sezione === s.id
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Panoramica */}
        {sezione === "panoramica" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Pazienti registrati", valore: pazientiReali.length, icona: "🧑‍🦽", colore: "text-blue-600" },
                { label: "Fisioterapisti approvati", valore: approvati.length, icona: "✅", colore: "text-green-600" },
                { label: "In attesa di approvazione", valore: inAttesa.length, icona: "⏳", colore: "text-amber-600" },
                { label: "Rifiutati", valore: rifiutati.length, icona: "✋", colore: "text-gray-500" },
              ].map((k) => (
                <div key={k.label} className="card text-center">
                  <div className="text-2xl mb-1">{k.icona}</div>
                  <div className={`text-2xl font-bold ${k.colore}`}>{k.valore}</div>
                  <div className="text-xs text-gray-500 mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-3">Ultimi fisioterapisti registrati</h2>
              {caricando ? (
                <p className="text-sm text-gray-400">Carico…</p>
              ) : fisioReali.length === 0 ? (
                <p className="text-sm text-gray-400">Ancora nessuna registrazione.</p>
              ) : (
                <div className="space-y-2">
                  {fisioReali.slice(0, 5).map((f) => (
                    <div key={f.id} className="card flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {f.nome} {f.cognome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(f.created_at).toLocaleDateString("it-IT")} · {f.base_citta}
                        </p>
                      </div>
                      <span className={`badge text-xs shrink-0 ${statoFisioColore[f.stato_verifica]}`}>
                        {statoFisioLabel[f.stato_verifica]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gestione utenti */}
        {sezione === "utenti" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3">
                Richieste d&apos;iscrizione fisioterapisti
                {inAttesa.length > 0 && (
                  <span className="ml-2 badge bg-amber-100 text-amber-700 text-xs align-middle">
                    {inAttesa.length} in attesa
                  </span>
                )}
              </h2>
              {caricando ? (
                <p className="text-sm text-gray-400">Carico…</p>
              ) : inAttesa.length === 0 ? (
                <p className="text-sm text-gray-400">Nessuna richiesta in attesa.</p>
              ) : (
                <div className="space-y-2">
                  {inAttesa.map((f) => (
                    <div key={f.id} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{f.nome} {f.cognome}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {f.specializzazioni.join(" · ")} · {f.base_citta} ({f.base_provincia})
                          </p>
                          <p className="text-xs text-gray-400">
                            Albo n. {f.numero_albo} · {f.anni_esperienza} anni di esperienza
                          </p>
                          <p className="text-xs text-gray-400">{f.email} · {f.telefono}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => approvaRifiuta(f.id, "rifiuta")}
                            disabled={inCorsoId === f.id}
                            className="btn-danger py-1.5 px-3 text-sm"
                          >
                            Rifiuta
                          </button>
                          <button
                            onClick={() => approvaRifiuta(f.id, "approva")}
                            disabled={inCorsoId === f.id}
                            className="btn-success py-1.5 px-3 text-sm"
                          >
                            Approva
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3">Fisioterapisti approvati ({approvati.length})</h2>
              {approvati.length === 0 ? (
                <p className="text-sm text-gray-400">Nessuno ancora.</p>
              ) : (
                <div className="space-y-2">
                  {approvati.map((f) => (
                    <div key={f.id} className="card flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        🏥
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {f.nome} {f.cognome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {f.specializzazioni.join(" · ")} · {f.base_citta} ({f.base_provincia})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {rifiutati.length > 0 && (
              <div>
                <h2 className="mb-3">Rifiutati ({rifiutati.length})</h2>
                <div className="space-y-2">
                  {rifiutati.map((f) => (
                    <div key={f.id} className="card flex items-center gap-3 opacity-70">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {f.nome} {f.cognome}
                        </p>
                        <p className="text-xs text-gray-400">{f.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-3">Pazienti ({pazientiReali.length})</h2>
              {pazientiReali.length === 0 ? (
                <p className="text-sm text-gray-400">Ancora nessuna registrazione.</p>
              ) : (
                <div className="space-y-2">
                  {pazientiReali.map((p) => (
                    <div key={p.id} className="card flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        🧑‍🦽
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {p.nome} {p.cognome}
                        </p>
                        <p className="text-xs text-gray-400">{p.indirizzo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

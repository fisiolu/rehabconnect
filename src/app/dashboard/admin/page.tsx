"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Factor } from "@supabase/supabase-js";

type Sezione = "panoramica" | "utenti" | "sicurezza";

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
  /** Serve all'amministratore per il confronto con INI-PEC prima di approvare. */
  pec: string;
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
  const { utente, addToast } = useApp();
  const router = useRouter();
  const [sezione, setSezione] = useState<Sezione>("panoramica");

  const [fisioReali, setFisioReali] = useState<FisioReale[]>([]);
  const [pazientiReali, setPazientiReali] = useState<PazienteReale[]>([]);
  const [caricando, setCaricando] = useState(true);
  const [inCorsoId, setInCorsoId] = useState<string | null>(null);

  // Verifica in due passaggi (MFA/TOTP) per l'accesso admin.
  const [fattoriMfa, setFattoriMfa] = useState<Factor[]>([]);
  const [iscrizione, setIscrizione] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [codiceMfa, setCodiceMfa] = useState("");
  const [inCorsoMfa, setInCorsoMfa] = useState(false);
  const [erroreMfa, setErroreMfa] = useState("");

  const caricaFattoriMfa = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    setFattoriMfa(data?.totp ?? []);
  }, []);

  const caricaTutto = useCallback(async () => {
    setCaricando(true);
    const supabase = createClient();
    const [fisio, pazienti] = await Promise.all([
      supabase
        .from("fisioterapisti")
        .select(
          "id, nome, cognome, email, telefono, specializzazioni, base_citta, base_provincia, numero_albo, pec, anni_esperienza, stato_verifica, created_at"
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
    if (utente?.ruolo === "admin") {
      caricaTutto();
      caricaFattoriMfa();
    }
  }, [utente, caricaTutto, caricaFattoriMfa]);

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

  async function iniziaIscrizioneMfa() {
    setErroreMfa("");
    setInCorsoMfa(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setInCorsoMfa(false);
    if (error || !data) {
      setErroreMfa("Non sono riuscito ad avviare l'attivazione. Riprova.");
      return;
    }
    setIscrizione({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confermaIscrizioneMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!iscrizione) return;
    setErroreMfa("");
    setInCorsoMfa(true);

    const supabase = createClient();
    const { data: sfida, error: erroreSfida } = await supabase.auth.mfa.challenge({
      factorId: iscrizione.factorId,
    });
    if (erroreSfida) {
      setInCorsoMfa(false);
      setErroreMfa("Non sono riuscito ad avviare la verifica. Riprova.");
      return;
    }

    const { error: erroreVerifica } = await supabase.auth.mfa.verify({
      factorId: iscrizione.factorId,
      challengeId: sfida.id,
      code: codiceMfa,
    });

    setInCorsoMfa(false);
    if (erroreVerifica) {
      setErroreMfa("Codice non valido. Riprova.");
      return;
    }

    setIscrizione(null);
    setCodiceMfa("");
    await caricaFattoriMfa();
    addToast("Verifica in due passaggi attivata.");
  }

  async function annullaIscrizioneMfa() {
    if (!iscrizione) return;
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId: iscrizione.factorId });
    setIscrizione(null);
    setCodiceMfa("");
    setErroreMfa("");
  }

  async function disattivaMfa(factorId: string) {
    setInCorsoMfa(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setInCorsoMfa(false);
    if (error) {
      setErroreMfa("Non sono riuscito a disattivarla. Riprova.");
      return;
    }
    await caricaFattoriMfa();
    addToast("Verifica in due passaggi disattivata.", "info");
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
              { id: "sicurezza", label: "🔒 Sicurezza" },
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
                            {f.anni_esperienza} anni di esperienza
                          </p>
                          <p className="text-xs text-gray-400">{f.email} · {f.telefono}</p>

                          {/* I due controlli da fare PRIMA di approvare. Il numero
                              d'albo è pubblico e copiabile: da solo non prova nulla.
                              È il confronto della PEC che smaschera un impostore. */}
                          <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2.5 space-y-1.5">
                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                              Da controllare prima di approvare
                            </p>
                            <p className="text-xs text-amber-900 dark:text-amber-200">
                              1. Albo <span className="font-mono">{f.numero_albo}</span> →{" "}
                              <a
                                href="https://fisionet.fnofi.it/albo-professionale"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 font-medium"
                              >
                                cerca su FNOFI
                              </a>{" "}
                              e verifica che il nome corrisponda
                            </p>
                            <p className="text-xs text-amber-900 dark:text-amber-200">
                              2. PEC{" "}
                              <span className="font-mono break-all">
                                {f.pec || "— non indicata —"}
                              </span>{" "}
                              →{" "}
                              <a
                                href="https://www.inipec.gov.it"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 font-medium"
                              >
                                cerca su INI-PEC
                              </a>{" "}
                              e verifica che sia <strong>identica</strong> a quella ufficiale
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-300/80">
                              Se la PEC non coincide, rifiuta: è il segnale di
                              un&apos;identità presa in prestito.
                            </p>
                          </div>
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

        {/* Sicurezza: verifica in due passaggi */}
        {sezione === "sicurezza" && (
          <div className="space-y-6">
            <div className="card space-y-3">
              <h2>Verifica in due passaggi</h2>
              <p className="text-sm text-gray-500">
                Oltre alla password, ad ogni accesso l&apos;app chiederà un
                codice generato da un&apos;app di autenticazione (es. Google
                Authenticator, Authy). Protegge il pannello anche se qualcuno
                scoprisse la tua password.
              </p>

              {erroreMfa && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {erroreMfa}
                </p>
              )}

              {fattoriMfa.length > 0 ? (
                <div className="space-y-2">
                  {fattoriMfa.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-green-50 border border-green-200 p-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">Attiva</p>
                        <p className="text-xs text-green-700">
                          Aggiunta il {new Date(f.created_at).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                      <button
                        onClick={() => disattivaMfa(f.id)}
                        disabled={inCorsoMfa}
                        className="btn-danger py-1.5 px-3 text-sm"
                      >
                        Disattiva
                      </button>
                    </div>
                  ))}
                </div>
              ) : iscrizione ? (
                <div className="space-y-3">
                  <div className="flex flex-col items-center gap-2 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iscrizione.qrCode} alt="Codice QR per l'app di autenticazione" className="w-40 h-40" />
                    <p className="text-xs text-gray-500">
                      Non riesci a inquadrarlo? Inserisci a mano:{" "}
                      <span className="font-mono break-all">{iscrizione.secret}</span>
                    </p>
                  </div>

                  <form onSubmit={confermaIscrizioneMfa} className="space-y-3">
                    <div>
                      <label className="label" htmlFor="codice-mfa">Codice mostrato dall&apos;app</label>
                      <input
                        id="codice-mfa"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        className="input-field py-3 tracking-widest text-center text-lg"
                        value={codiceMfa}
                        onChange={(e) => setCodiceMfa(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={annullaIscrizioneMfa}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        disabled={inCorsoMfa || codiceMfa.length !== 6}
                        className="btn-primary flex-1 py-2.5 text-sm"
                      >
                        {inCorsoMfa ? "Verifica…" : "Conferma"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button onClick={iniziaIscrizioneMfa} disabled={inCorsoMfa} className="btn-primary py-2.5 px-4 text-sm">
                  {inCorsoMfa ? "Preparazione…" : "Attiva verifica in due passaggi"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

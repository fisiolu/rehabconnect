"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useApp } from "@/lib/AppContext";

interface LuogoTrovato {
  nome: string;
  lat: number;
  lng: number;
}

export default function RegistratiPazientePage() {
  const router = useRouter();
  const { addToast } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");

  const [luogoTesto, setLuogoTesto] = useState("");
  const [risultatiLuogo, setRisultatiLuogo] = useState<LuogoTrovato[] | null>(null);
  const [cercandoLuogo, setCercandoLuogo] = useState(false);
  const [luogoScelto, setLuogoScelto] = useState<LuogoTrovato | null>(null);

  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  async function cercaLuogo(e: React.FormEvent) {
    e.preventDefault();
    const q = luogoTesto.trim();
    if (q.length < 3) {
      setErrore("Scrivi almeno tre lettere per cercare casa tua.");
      return;
    }
    setCercandoLuogo(true);
    setErrore("");
    try {
      const r = await fetch(`/api/geocodifica?q=${encodeURIComponent(q)}`);
      const dati = (await r.json()) as { risultati: LuogoTrovato[]; errore?: string };
      if (dati.errore || dati.risultati.length === 0) {
        setErrore(dati.errore || `Non ho trovato "${q}".`);
        setRisultatiLuogo(null);
      } else {
        setRisultatiLuogo(dati.risultati);
      }
    } catch {
      setErrore("Non sono riuscito a cercare. Controlla la connessione.");
    } finally {
      setCercandoLuogo(false);
    }
  }

  function scegliLuogo(l: LuogoTrovato) {
    setLuogoScelto(l);
    setRisultatiLuogo(null);
    setLuogoTesto(l.nome);
  }

  async function registrati(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");

    if (!luogoScelto) {
      setErrore("Cerca e scegli il tuo indirizzo di casa: serve per trovare i Fisioterapisti vicini.");
      return;
    }

    if (!turnstileToken) {
      setErrore("Completa la verifica anti-spam prima di continuare.");
      return;
    }

    setInCorso(true);

    const corpo = {
      email,
      password,
      nome,
      cognome,
      telefono,
      indirizzo: luogoScelto.nome,
      domicilioLat: luogoScelto.lat,
      domicilioLng: luogoScelto.lng,
      turnstileToken,
    };

    const risposta = await fetch("/api/registrati/paziente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const dati = await risposta.json();

    if (!risposta.ok) {
      setInCorso(false);
      // Il token Turnstile è a uso singolo: dopo un tentativo, riuscito o no,
      // il widget va rimontato per ottenerne uno nuovo prima di riprovare.
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
      setErrore(dati.errore || "Non sono riuscito a completare la registrazione.");
      return;
    }

    const supabase = createClient();
    const { error: erroreAccesso } = await supabase.auth.signInWithPassword({ email, password });
    setInCorso(false);

    if (erroreAccesso) {
      router.push("/accedi");
      return;
    }
    addToast(`Benvenuto/a, ${nome}! La tua registrazione è completata.`, "successo");
    router.push("/dashboard/paziente");
  }

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link
          href="/accedi"
          className="inline-block mb-6 text-sm font-medium text-slate-500 hover:text-notte dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          ← Hai già un account? Accedi
        </Link>

        <div className="card">
          <h1 className="text-xl font-bold text-notte dark:text-white mb-1">
            Registrati come Paziente
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Per seguire il tuo percorso, gli appuntamenti e i messaggi con il Fisioterapista.
          </p>

          <form onSubmit={registrati} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-notte dark:text-white uppercase tracking-wide">
                Account
              </h2>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" required className="input-field py-3"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" type="password" required minLength={6} className="input-field py-3"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-notte dark:text-white uppercase tracking-wide">
                Dati personali
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="nome">Nome</label>
                  <input id="nome" required className="input-field py-3"
                    value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="cognome">Cognome</label>
                  <input id="cognome" required className="input-field py-3"
                    value={cognome} onChange={(e) => setCognome(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="telefono">Telefono</label>
                <input id="telefono" type="tel" required className="input-field py-3"
                  value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-notte dark:text-white uppercase tracking-wide">
                Dove abiti
              </h2>
              <div>
                <label className="label" htmlFor="luogo">Indirizzo di casa</label>
                <div className="flex gap-2">
                  <input
                    id="luogo"
                    value={luogoTesto}
                    onChange={(e) => {
                      setLuogoTesto(e.target.value);
                      setLuogoScelto(null);
                    }}
                    placeholder="Es. Via Roma 12, Formia"
                    autoComplete="street-address"
                    className="input-field flex-1 py-3"
                  />
                  <button
                    type="button"
                    onClick={cercaLuogo}
                    disabled={cercandoLuogo}
                    className="shrink-0 inline-flex items-center justify-center gap-2 bg-notte hover:bg-notte/90 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                  >
                    <Search size={18} aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only text-sm">
                      {cercandoLuogo ? "Cerco…" : "Cerca"}
                    </span>
                  </button>
                </div>

                {risultatiLuogo && risultatiLuogo.length > 0 && (
                  <ul className="mt-2 border border-slate-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-gray-700">
                    {risultatiLuogo.map((r) => (
                      <li key={`${r.lat},${r.lng},${r.nome}`}>
                        <button
                          type="button"
                          onClick={() => scegliLuogo(r)}
                          className="w-full text-left px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                        >
                          <MapPin size={16} className="text-primary-600 dark:text-primary-400 shrink-0" aria-hidden="true" />
                          <span className="text-notte dark:text-white text-sm">{r.nome}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {luogoScelto && (
                  <p className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                    ✓ Casa impostata: {luogoScelto.nome}
                  </p>
                )}
              </div>
            </div>

            <TurnstileWidget key={turnstileKey} onToken={setTurnstileToken} />

            {errore && (
              <p
                role="status"
                className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2"
              >
                {errore}
              </p>
            )}

            <button type="submit" disabled={inCorso || !turnstileToken} className="btn-primary w-full py-3">
              {inCorso ? "Invio…" : "Crea il mio account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

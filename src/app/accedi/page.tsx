"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { risolviRuolo } from "@/lib/supabase/ruolo";

export default function AccediPage() {
  return (
    <Suspense fallback={null}>
      <FormAccesso />
    </Suspense>
  );
}

function FormAccesso() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");

  // Se l'account ha attivato la verifica in due passaggi, dopo la password
  // serve anche il codice dell'app di autenticazione prima di entrare.
  const [fattoreId, setFattoreId] = useState<string | null>(null);
  const [codice, setCodice] = useState("");

  async function accedi(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");
    setInCorso(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setInCorso(false);
      setErrore("Email o password non corrette.");
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
      const { data: fattori } = await supabase.auth.mfa.listFactors();
      const totp = fattori?.totp[0];
      setInCorso(false);
      if (!totp) {
        setErrore("Verifica in due passaggi attiva ma nessun metodo trovato. Contattaci.");
        return;
      }
      setFattoreId(totp.id);
      return;
    }

    const utente = await risolviRuolo(supabase, data.user.id);
    setInCorso(false);

    if (!utente) {
      setErrore("Account trovato ma non ancora collegato a un profilo. Contattaci se il problema persiste.");
      return;
    }

    router.push(redirect || `/dashboard/${utente.ruolo}`);
  }

  async function verifica(e: React.FormEvent) {
    e.preventDefault();
    if (!fattoreId) return;
    setErrore("");
    setInCorso(true);

    const supabase = createClient();
    const { data: sfida, error: erroreSfida } = await supabase.auth.mfa.challenge({
      factorId: fattoreId,
    });
    if (erroreSfida) {
      setInCorso(false);
      setErrore("Non sono riuscito ad avviare la verifica. Riprova.");
      return;
    }

    const { data: sessione, error: erroreVerifica } = await supabase.auth.mfa.verify({
      factorId: fattoreId,
      challengeId: sfida.id,
      code: codice,
    });

    if (erroreVerifica || !sessione) {
      setInCorso(false);
      setErrore("Codice non valido. Riprova.");
      return;
    }

    const utente = await risolviRuolo(supabase, sessione.user.id);
    setInCorso(false);

    if (!utente) {
      setErrore("Account trovato ma non ancora collegato a un profilo. Contattaci se il problema persiste.");
      return;
    }

    router.push(redirect || `/dashboard/${utente.ruolo}`);
  }

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-6 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-notte dark:text-white text-sm font-semibold pl-2.5 pr-3.5 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Torna alla home
        </Link>

        <div className="card">
          {!fattoreId ? (
            <>
              <h1 className="text-xl font-bold text-notte dark:text-white mb-1">Accedi</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Con l&apos;email e la password scelte in fase di registrazione.
              </p>

              <form onSubmit={accedi} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field py-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="input-field py-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {errore && (
                  <p
                    role="status"
                    className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2"
                  >
                    {errore}
                  </p>
                )}

                <button type="submit" disabled={inCorso} className="btn-primary w-full py-3">
                  {inCorso ? "Accesso…" : "Accedi"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-notte dark:text-white mb-1">Verifica in due passaggi</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Apri la tua app di autenticazione e inserisci il codice a 6 cifre.
              </p>

              <form onSubmit={verifica} className="space-y-4">
                <div>
                  <label className="label" htmlFor="codice">Codice di verifica</label>
                  <input
                    id="codice"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    className="input-field py-3 tracking-widest text-center text-lg"
                    value={codice}
                    onChange={(e) => setCodice(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                {errore && (
                  <p
                    role="status"
                    className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2"
                  >
                    {errore}
                  </p>
                )}

                <button type="submit" disabled={inCorso || codice.length !== 6} className="btn-primary w-full py-3">
                  {inCorso ? "Verifica…" : "Verifica e accedi"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Non hai un account?{" "}
          <Link href="/registrati/paziente" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Registrati come paziente
          </Link>{" "}
          o{" "}
          <Link href="/registrati/fisioterapista" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            come fisioterapista
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

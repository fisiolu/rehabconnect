"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
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

    const utente = await risolviRuolo(supabase, data.user.id);
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
          className="inline-block mb-6 text-sm font-medium text-slate-500 hover:text-notte dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          ← Torna alla home
        </Link>

        <div className="card">
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

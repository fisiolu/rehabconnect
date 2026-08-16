"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

export default function CambiaPasswordPage() {
  const { utente, addToast } = useApp();
  const router = useRouter();

  const [passwordAttuale, setPasswordAttuale] = useState("");
  const [nuovaPassword, setNuovaPassword] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");

  // Il Medico è ancora un ingresso demo (entraComeMedicoDemo), senza una
  // sessione Supabase vera: per lui non esiste una password da cambiare.
  useEffect(() => {
    if (!utente || utente.ruolo === "medico") router.push("/");
  }, [utente, router]);

  if (!utente || utente.ruolo === "medico") return null;

  async function cambiaPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");

    if (nuovaPassword.length < 6) {
      setErrore("La nuova password deve avere almeno 6 caratteri.");
      return;
    }
    if (nuovaPassword !== confermaPassword) {
      setErrore("Le due password non coincidono.");
      return;
    }

    setInCorso(true);
    const supabase = createClient();

    // Si riverifica la password attuale prima di cambiarla: la sessione da
    // sola basterebbe per Supabase, ma senza questo controllo chiunque
    // trovasse una sessione aperta e dimenticata potrebbe cambiarla.
    const { data: sessione } = await supabase.auth.getUser();
    const email = sessione.user?.email;
    if (!email) {
      setInCorso(false);
      setErrore("Sessione non valida. Prova a uscire e rientrare.");
      return;
    }

    const { error: erroreVerifica } = await supabase.auth.signInWithPassword({
      email,
      password: passwordAttuale,
    });
    if (erroreVerifica) {
      setInCorso(false);
      setErrore("La password attuale non è corretta.");
      return;
    }

    const { error: erroreAggiornamento } = await supabase.auth.updateUser({
      password: nuovaPassword,
    });
    setInCorso(false);

    if (erroreAggiornamento) {
      setErrore("Non è stato possibile cambiare la password. Riprova.");
      return;
    }

    setPasswordAttuale("");
    setNuovaPassword("");
    setConfermaPassword("");
    addToast("Password aggiornata.");
  }

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900">
      <Navbar />
      <main className="max-w-sm mx-auto px-4 py-8">
        <div className="card">
          <h1 className="text-xl font-bold text-notte dark:text-white mb-1">Cambia password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Inserisci la password attuale e quella nuova.
          </p>

          <form onSubmit={cambiaPassword} className="space-y-4">
            <div>
              <label className="label" htmlFor="password-attuale">Password attuale</label>
              <input
                id="password-attuale"
                type="password"
                required
                autoComplete="current-password"
                className="input-field py-3"
                value={passwordAttuale}
                onChange={(e) => setPasswordAttuale(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="nuova-password">Nuova password</label>
              <input
                id="nuova-password"
                type="password"
                required
                autoComplete="new-password"
                className="input-field py-3"
                value={nuovaPassword}
                onChange={(e) => setNuovaPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="conferma-password">Conferma nuova password</label>
              <input
                id="conferma-password"
                type="password"
                required
                autoComplete="new-password"
                className="input-field py-3"
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
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
              {inCorso ? "Salvo…" : "Salva la nuova password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

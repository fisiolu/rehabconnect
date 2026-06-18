"use client";

import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import { pazienti, medici, fisioterapisti } from "@/lib/demoData";

const ruoli = [
  {
    id: "paziente",
    titolo: "Paziente",
    sottotitolo: "o familiare",
    descrizione: "Richiedi assistenza riabilitativa e monitora lo stato",
    icona: "🧑‍🦽",
    colore: "border-blue-300 hover:border-blue-500 hover:bg-blue-50",
    testoColore: "text-blue-700",
    btnColore: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "medico",
    titolo: "Medico",
    sottotitolo: "di medicina generale",
    descrizione: "Valuta le richieste e assegna i fisioterapisti",
    icona: "👨‍⚕️",
    colore: "border-green-300 hover:border-green-500 hover:bg-green-50",
    testoColore: "text-green-700",
    btnColore: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "fisioterapista",
    titolo: "Fisioterapista",
    sottotitolo: "riabilitatore",
    descrizione: "Gestisci gli incarichi e la tua agenda",
    icona: "🏥",
    colore: "border-purple-300 hover:border-purple-500 hover:bg-purple-50",
    testoColore: "text-purple-700",
    btnColore: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: "admin",
    titolo: "Amministratore",
    sottotitolo: "della piattaforma",
    descrizione: "Supervisiona tutte le attività e gli utenti",
    icona: "⚙️",
    colore: "border-orange-300 hover:border-orange-500 hover:bg-orange-50",
    testoColore: "text-orange-700",
    btnColore: "bg-orange-600 hover:bg-orange-700",
  },
];

function getUtenteDemo(ruolo: string) {
  if (ruolo === "paziente") {
    const p = pazienti[0];
    return { ruolo: "paziente" as const, id: p.id, nome: `${p.nome} ${p.cognome}` };
  }
  if (ruolo === "medico") {
    const m = medici[0];
    return { ruolo: "medico" as const, id: m.id, nome: `Dr.ssa ${m.cognome}` };
  }
  if (ruolo === "fisioterapista") {
    const f = fisioterapisti[0];
    return { ruolo: "fisioterapista" as const, id: f.id, nome: `${f.nome} ${f.cognome}` };
  }
  return { ruolo: "admin" as const, id: "admin-001", nome: "Amministratore" };
}

export default function HomePage() {
  const { setUtente } = useApp();
  const router = useRouter();

  function accedi(ruolo: string) {
    const utente = getUtenteDemo(ruolo);
    setUtente(utente);
    router.push(`/dashboard/${ruolo}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            RehabConnect
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            La piattaforma che collega pazienti, medici e fisioterapisti per una
            riabilitazione domiciliare efficace.
          </p>
          <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
            Versione dimostrativa — nessun dato reale
          </div>
        </div>

        {/* Scelta ruolo */}
        <div className="mb-8">
          <h2 className="text-center text-gray-500 text-sm font-medium uppercase tracking-wide mb-6">
            Accedi come
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ruoli.map((r) => (
              <button
                key={r.id}
                onClick={() => accedi(r.id)}
                className={`card text-left border-2 transition-all duration-200 cursor-pointer ${r.colore} group`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{r.icona}</span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <h3 className={`font-bold ${r.testoColore}`}>
                        {r.titolo}
                      </h3>
                      <span className="text-gray-400 text-sm">
                        {r.sottotitolo}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {r.descrizione}
                    </p>
                    <span
                      className={`inline-block mt-3 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${r.btnColore}`}
                    >
                      Entra →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>Piattaforma dimostrativa — Fase 1</p>
          <p>Nessun dato sanitario reale · Nessun servizio a pagamento</p>
        </div>
      </div>
    </main>
  );
}

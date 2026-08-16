"use client";

import { useEffect, useState } from "react";
import { Clock, Mail, MapPin, Pencil, Phone, Stethoscope } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import type { MedicoRiferimento } from "@/lib/demoData";
import { createClient } from "@/lib/supabase/client";

const VUOTO: MedicoRiferimento = {
  nome: "",
  cognome: "",
  ruolo: "Medico di base",
  ambulatorio: "",
  telefono: "",
  email: "",
  orari: "",
  note: "",
};

/**
 * Scheda del medico di riferimento del paziente.
 *
 * La compila il paziente, non il medico: il medico di base non è iscritto
 * alla piattaforma e aspettare che lo sia bloccherebbe tutto. Serve ad avere
 * il numero sotto mano quando occorre un consiglio o una prescrizione, che è
 * il passaggio che consigliamo prima di iniziare la fisioterapia.
 */
export default function SchedaMedico({ pazienteId }: { pazienteId: string }) {
  const { addToast } = useApp();
  const [medico, setMedico] = useState<MedicoRiferimento | null>(null);
  const [caricato, setCaricato] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("medici_riferimento")
      .select("nome, cognome, ruolo, ambulatorio, telefono, email, orari, note")
      .eq("paziente_id", pazienteId)
      .maybeSingle()
      .then(({ data }) => {
        setMedico(data as MedicoRiferimento | null);
        setCaricato(true);
      });
  }, [pazienteId]);

  const [inModifica, setInModifica] = useState(false);
  const [bozza, setBozza] = useState<MedicoRiferimento>(medico ?? VUOTO);

  function apriModifica() {
    setBozza(medico ?? VUOTO);
    setInModifica(true);
  }

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    if (!bozza.cognome.trim()) {
      addToast("Scrivi almeno il cognome del medico.", "errore");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("medici_riferimento")
      .upsert({ paziente_id: pazienteId, ...bozza });
    if (error) {
      addToast("Non sono riuscito a salvare. Riprova.", "errore");
      return;
    }
    setMedico(bozza);
    setInModifica(false);
    addToast("Dati del medico salvati.", "successo");
  }

  if (!caricato) return null;

  if (inModifica) {
    return (
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2">
          <Stethoscope size={20} className="text-teal-600" aria-hidden="true" />
          Il mio medico
        </h2>

        <form onSubmit={salva} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-nome" className="label">
                Nome
              </label>
              <input
                id="med-nome"
                className="input-field py-3"
                value={bozza.nome}
                onChange={(e) => setBozza({ ...bozza, nome: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="med-cognome" className="label">
                Cognome
              </label>
              <input
                id="med-cognome"
                className="input-field py-3"
                value={bozza.cognome}
                onChange={(e) => setBozza({ ...bozza, cognome: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-ruolo" className="label">
              Che medico è
            </label>
            <select
              id="med-ruolo"
              className="input-field py-3"
              value={bozza.ruolo}
              onChange={(e) => setBozza({ ...bozza, ruolo: e.target.value })}
            >
              {["Medico di base", "Ortopedico", "Fisiatra", "Neurologo", "Altro specialista"].map(
                (r) => (
                  <option key={r}>{r}</option>
                )
              )}
            </select>
          </div>

          <div>
            <label htmlFor="med-tel" className="label">
              Telefono
            </label>
            <input
              id="med-tel"
              type="tel"
              inputMode="tel"
              className="input-field py-3"
              value={bozza.telefono}
              onChange={(e) => setBozza({ ...bozza, telefono: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="med-amb" className="label">
              Indirizzo dell&apos;ambulatorio
            </label>
            <input
              id="med-amb"
              className="input-field py-3"
              value={bozza.ambulatorio}
              onChange={(e) => setBozza({ ...bozza, ambulatorio: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="med-orari" className="label">
              Orari di ricevimento
            </label>
            <input
              id="med-orari"
              className="input-field py-3"
              placeholder="Es. Lun-Ven 9:00-12:00"
              value={bozza.orari}
              onChange={(e) => setBozza({ ...bozza, orari: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="med-email" className="label">
              Email
            </label>
            <input
              id="med-email"
              type="email"
              className="input-field py-3"
              value={bozza.email}
              onChange={(e) => setBozza({ ...bozza, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="med-note" className="label">
              Note
            </label>
            <textarea
              id="med-note"
              rows={2}
              className="input-field py-3"
              placeholder="Es. riceve solo su appuntamento"
              value={bozza.note}
              onChange={(e) => setBozza({ ...bozza, note: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1 py-3">
              Salva
            </button>
            <button
              type="button"
              onClick={() => setInModifica(false)}
              className="btn-secondary py-3"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Nessun medico ancora inserito
  if (!medico || !medico.cognome) {
    return (
      <div className="card text-center">
        <Stethoscope size={28} className="mx-auto text-teal-600 mb-2" aria-hidden="true" />
        <h2 className="mb-1">Il mio medico</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
          Tieni qui il numero del tuo medico: serve quando ti occorre un consiglio o una
          prescrizione prima di iniziare la fisioterapia.
        </p>
        <button onClick={apriModifica} className="btn-primary py-3 px-6">
          Aggiungi il mio medico
        </button>
      </div>
    );
  }

  const telefonoPulito = medico.telefono.replace(/\s/g, "");

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="flex items-center gap-2">
          <Stethoscope size={20} className="text-teal-600" aria-hidden="true" />
          Il mio medico
        </h2>
        <button
          onClick={apriModifica}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Pencil size={14} aria-hidden="true" />
          Modifica
        </button>
      </div>

      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {medico.nome} {medico.cognome}
      </p>
      <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">{medico.ruolo}</p>

      <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {medico.ambulatorio && (
          <p className="flex items-start gap-2">
            <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
            {medico.ambulatorio}
          </p>
        )}
        {medico.orari && (
          <p className="flex items-start gap-2">
            <Clock size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
            {medico.orari}
          </p>
        )}
        {medico.note && (
          <p className="text-gray-500 dark:text-gray-400 italic">{medico.note}</p>
        )}
      </div>

      {/* Pulsanti grandi: sono il motivo per cui questa scheda esiste */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {medico.telefono ? (
          <a
            href={`tel:${telefonoPulito}`}
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <Phone size={20} aria-hidden="true" />
            Chiama
          </a>
        ) : (
          <span />
        )}
        {medico.email && (
          <a
            href={`mailto:${medico.email}`}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Mail size={20} aria-hidden="true" />
            Scrivi
          </a>
        )}
      </div>
    </div>
  );
}

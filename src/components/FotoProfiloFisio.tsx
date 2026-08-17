"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { caricaFoto, linkFirmato, rimuoviFoto } from "@/lib/supabase/fotoProfilo";

/**
 * Riquadro con cui il Fisioterapista mette (o toglie) la propria foto.
 * È facoltativa: la scheda funziona benissimo senza, e chi non la vuole
 * non deve sentirsi in difetto.
 */
export default function FotoProfiloFisio({ fisioterapistaId }: { fisioterapistaId: string }) {
  const [percorso, setPercorso] = useState<string | null>(null);
  const [anteprima, setAnteprima] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const carica = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("fisioterapisti")
      .select("foto_path")
      .eq("id", fisioterapistaId)
      .maybeSingle();

    const p = (data as { foto_path: string | null } | null)?.foto_path ?? null;
    setPercorso(p);
    setAnteprima(p ? await linkFirmato(supabase, p) : null);
  }, [fisioterapistaId]);

  useEffect(() => {
    carica();
  }, [carica]);

  async function scegliFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // L'input va svuotato subito: altrimenti riscegliere lo stesso file non
    // fa scattare l'evento e sembra che il pulsante non funzioni.
    e.target.value = "";
    if (!file) return;

    setInCorso(true);
    setErrore("");
    const esito = await caricaFoto(createClient(), fisioterapistaId, file);
    setInCorso(false);

    if (!esito.ok) {
      setErrore(esito.errore ?? "Non sono riuscito a caricare la foto.");
      return;
    }
    await carica();
  }

  async function togli() {
    if (!percorso) return;
    setInCorso(true);
    setErrore("");
    const ok = await rimuoviFoto(createClient(), fisioterapistaId, percorso);
    setInCorso(false);
    if (!ok) {
      setErrore("Non sono riuscito a togliere la foto. Riprova.");
      return;
    }
    setPercorso(null);
    setAnteprima(null);
  }

  return (
    <div className="card">
      <h2 className="mb-1 flex items-center gap-2">
        <Camera size={18} aria-hidden="true" />
        La tua foto
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Facoltativa. La vedono solo i pazienti registrati: chi cerca senza aver fatto accesso
        non la riceve. Una foto in cui si vede il viso aiuta chi deve farti entrare in casa.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-600">
          {anteprima ? (
            <Image
              src={anteprima}
              alt="La tua foto di profilo"
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound size={34} className="text-gray-400" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={scegliFile}
            className="sr-only"
            id="foto-profilo"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={inCorso}
            className="btn-secondary py-2 px-4 text-sm w-full sm:w-auto"
          >
            {inCorso ? "Attendi…" : percorso ? "Cambia foto" : "Scegli una foto"}
          </button>

          {percorso && (
            <button
              type="button"
              onClick={togli}
              disabled={inCorso}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium ml-0 sm:ml-2"
            >
              <Trash2 size={15} aria-hidden="true" />
              Togli la foto
            </button>
          )}

          <p className="text-xs text-gray-400">JPG, PNG o WEBP · massimo 5 MB</p>
        </div>
      </div>

      {errore && (
        <p
          role="status"
          className="mt-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2"
        >
          {errore}
        </p>
      )}
    </div>
  );
}

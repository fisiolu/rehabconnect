import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Foto facoltativa del Fisioterapista.
 *
 * Il bucket è privato: nel database salviamo il percorso del file, non un
 * indirizzo web. Per vedere l'immagine serve un link firmato a scadenza, che
 * Supabase rilascia solo a chi ha una sessione valida. Così la foto resta
 * davvero invisibile finché il paziente non si registra — un bucket pubblico
 * l'avrebbe mostrata a chiunque ne indovinasse l'indirizzo.
 */

export const BUCKET_FOTO = "foto-fisioterapisti";

/** Un'ora: abbastanza per guardare le schede, poco per girare il link. */
const DURATA_LINK_SECONDI = 60 * 60;

const TIPI_AMMESSI = ["image/jpeg", "image/png", "image/webp"];
const PESO_MASSIMO = 5 * 1024 * 1024;

export interface EsitoCaricamento {
  ok: boolean;
  percorso?: string;
  errore?: string;
}

/** Controlli fatti anche qui e non solo nel modulo: il modulo si aggira. */
export function controllaFile(file: File): string | null {
  if (!TIPI_AMMESSI.includes(file.type)) {
    return "Formato non riconosciuto. Usa una foto JPG, PNG o WEBP.";
  }
  if (file.size > PESO_MASSIMO) {
    return "La foto è troppo pesante: il limite è 5 MB.";
  }
  return null;
}

/**
 * Carica la foto sotto una cartella intitolata all'id del professionista.
 * Le regole del bucket accettano scritture solo dentro la propria cartella,
 * quindi nessuno può sovrascrivere la foto di un altro.
 */
export async function caricaFoto(
  supabase: SupabaseClient,
  fisioterapistaId: string,
  file: File
): Promise<EsitoCaricamento> {
  const problema = controllaFile(file);
  if (problema) return { ok: false, errore: problema };

  const estensione = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Il nome cambia ad ogni caricamento: evita che il browser continui a
  // mostrare la foto vecchia perché tiene in memoria quella di prima.
  const percorso = `${fisioterapistaId}/profilo-${Date.now()}.${estensione}`;

  const { error } = await supabase.storage.from(BUCKET_FOTO).upload(percorso, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false, errore: "Non sono riuscito a caricare la foto. Riprova." };

  const { error: erroreScheda } = await supabase
    .from("fisioterapisti")
    .update({ foto_path: percorso })
    .eq("id", fisioterapistaId);

  if (erroreScheda) {
    // Niente file orfani: se la scheda non si aggiorna, il file appena
    // caricato non serve a nessuno.
    await supabase.storage.from(BUCKET_FOTO).remove([percorso]);
    return { ok: false, errore: "Non sono riuscito a salvare la foto sulla tua scheda." };
  }

  return { ok: true, percorso };
}

/** Toglie la foto dalla scheda e cancella il file. */
export async function rimuoviFoto(
  supabase: SupabaseClient,
  fisioterapistaId: string,
  percorso: string
): Promise<boolean> {
  const { error } = await supabase
    .from("fisioterapisti")
    .update({ foto_path: null })
    .eq("id", fisioterapistaId);
  if (error) return false;

  await supabase.storage.from(BUCKET_FOTO).remove([percorso]);
  return true;
}

/** Link temporaneo per mostrare una foto. Restituisce null se non si può. */
export async function linkFirmato(
  supabase: SupabaseClient,
  percorso: string
): Promise<string | null> {
  const { data } = await supabase.storage
    .from(BUCKET_FOTO)
    .createSignedUrl(percorso, DURATA_LINK_SECONDI);
  return data?.signedUrl ?? null;
}

/**
 * Link per più foto in una volta sola: la ricerca ne mostra molte insieme e
 * chiederli uno per uno significherebbe una richiesta per scheda.
 */
export async function linkFirmatiMultipli(
  supabase: SupabaseClient,
  percorsi: string[]
): Promise<Record<string, string>> {
  if (percorsi.length === 0) return {};

  const { data } = await supabase.storage
    .from(BUCKET_FOTO)
    .createSignedUrls(percorsi, DURATA_LINK_SECONDI);

  const mappa: Record<string, string> = {};
  for (const voce of data ?? []) {
    if (voce.path && voce.signedUrl) mappa[voce.path] = voce.signedUrl;
  }
  return mappa;
}

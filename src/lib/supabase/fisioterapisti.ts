import type { SupabaseClient } from "@supabase/supabase-js";
import type { Fisioterapista } from "@/lib/demoData";

interface RigaFisioterapista {
  id: string;
  nome: string;
  // Assenti dalla riga per chi cerca senza aver fatto login: il database
  // nega la colonna a chi non è autenticato (vedi grant/revoke in
  // supabase/schema.sql), qui arrivano semplicemente undefined.
  cognome?: string;
  specializzazioni: string[];
  telefono?: string;
  email?: string;
  foto_path?: string | null;
  disponibile: boolean;
  valutazione: number;
  numero_albo: string;
  tariffa_min: number;
  tariffa_max: number;
  assicurazioni: string[];
  base_lat: number;
  base_lng: number;
  base_citta: string;
  base_provincia: string;
  raggio_km: number;
  anni_esperienza: number;
  presentazione: string;
}

/** Da riga Postgres (snake_case) alla forma che il resto dell'app già usa (src/lib/geo.ts, le schede...). */
function aFisioterapista(r: RigaFisioterapista): Fisioterapista {
  return {
    id: r.id,
    nome: r.nome,
    cognome: r.cognome ?? "",
    specializzazioni: r.specializzazioni,
    telefono: r.telefono ?? "",
    email: r.email ?? "",
    fotoPath: r.foto_path ?? undefined,
    disponibile: r.disponibile,
    valutazione: r.valutazione,
    numeroAlbo: r.numero_albo,
    tariffa: { min: r.tariffa_min, max: r.tariffa_max },
    assicurazioni: r.assicurazioni,
    base: { lat: r.base_lat, lng: r.base_lng, citta: r.base_citta, provincia: r.base_provincia },
    raggioKm: r.raggio_km,
    anniEsperienza: r.anni_esperienza,
    presentazione: r.presentazione,
  };
}

const COLONNE_BASE =
  "id, nome, specializzazioni, disponibile, valutazione, numero_albo, tariffa_min, tariffa_max, assicurazioni, base_lat, base_lng, base_citta, base_provincia, raggio_km, anni_esperienza, presentazione";

/**
 * I soli fisioterapisti approvati: quelli che un paziente può vedere in
 * ricerca. `mostraContatti` va calcolata su una sessione Supabase vera
 * (non basta un `utente` locale non nullo: il Medico demo non ne ha una,
 * vedi entraComeMedicoDemo in AppContext.tsx) — passando true senza una
 * sessione reale il database rifiuta comunque la query, perché a livello
 * di colonna nega cognome/telefono/email al ruolo anon.
 */
export async function cercaApprovati(
  supabase: SupabaseClient,
  mostraContatti: boolean
): Promise<Fisioterapista[]> {
  const colonne = mostraContatti
    ? `${COLONNE_BASE}, cognome, telefono, email, foto_path`
    : COLONNE_BASE;
  const { data } = await supabase
    .from("fisioterapisti")
    .select(colonne)
    .eq("stato_verifica", "approvato");
  return ((data as unknown as RigaFisioterapista[]) ?? []).map(aFisioterapista);
}

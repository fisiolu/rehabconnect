import type { SupabaseClient } from "@supabase/supabase-js";
import type { Fisioterapista } from "@/lib/demoData";

interface RigaFisioterapista {
  id: string;
  nome: string;
  cognome: string;
  specializzazioni: string[];
  telefono: string;
  email: string;
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
    cognome: r.cognome,
    specializzazioni: r.specializzazioni,
    telefono: r.telefono,
    email: r.email,
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

/** I soli fisioterapisti approvati: quelli che un paziente può vedere in ricerca. */
export async function cercaApprovati(supabase: SupabaseClient): Promise<Fisioterapista[]> {
  const { data } = await supabase
    .from("fisioterapisti")
    .select(
      "id, nome, cognome, specializzazioni, telefono, email, disponibile, valutazione, numero_albo, tariffa_min, tariffa_max, assicurazioni, base_lat, base_lng, base_citta, base_provincia, raggio_km, anni_esperienza, presentazione"
    )
    .eq("stato_verifica", "approvato");
  return ((data as RigaFisioterapista[]) ?? []).map(aFisioterapista);
}

import type { SupabaseClient } from "@supabase/supabase-js";

export interface PazienteRiga {
  id: string;
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  indirizzo: string;
  domicilio_lat: number;
  domicilio_lng: number;
}

export async function caricaPaziente(
  supabase: SupabaseClient,
  id: string
): Promise<PazienteRiga | null> {
  const { data } = await supabase
    .from("pazienti")
    .select(
      "id, nome, cognome, telefono, email, indirizzo, domicilio_lat, domicilio_lng"
    )
    .eq("id", id)
    .maybeSingle();
  return data as PazienteRiga | null;
}

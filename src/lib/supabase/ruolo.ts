import type { SupabaseClient } from "@supabase/supabase-js";
import type { UtenteCorrente } from "@/lib/AppContext";

/**
 * Scopre il ruolo di un utente autenticato cercando il suo id in admins,
 * fisioterapisti, pazienti — nell'ordine, il primo che risponde vince.
 * Condivisa fra AppContext (all'avvio/cambio sessione) e la pagina di
 * login (per sapere subito dove reindirizzare dopo l'accesso).
 */
export async function risolviRuolo(
  supabase: SupabaseClient,
  userId: string
): Promise<UtenteCorrente | null> {
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (admin) return { ruolo: "admin", id: userId, nome: "Amministratore" };

  const { data: fisio } = await supabase
    .from("fisioterapisti")
    .select("id, nome, cognome")
    .eq("id", userId)
    .maybeSingle();
  if (fisio) return { ruolo: "fisioterapista", id: fisio.id, nome: `${fisio.nome} ${fisio.cognome}` };

  const { data: paziente } = await supabase
    .from("pazienti")
    .select("id, nome, cognome")
    .eq("id", userId)
    .maybeSingle();
  if (paziente) return { ruolo: "paziente", id: paziente.id, nome: `${paziente.nome} ${paziente.cognome}` };

  return null;
}

import type { SupabaseClient } from "@supabase/supabase-js";

const LIMITE_GIORNALIERO = 2;

/**
 * Anti-abuso, non anti-frode: un IP domestico è spesso condiviso da più
 * persone, quindi il limite resta volutamente permissivo (2 al giorno,
 * contate insieme fra paziente e fisioterapista) invece di bloccare del
 * tutto dopo la prima registrazione.
 */
export async function haRaggiuntoLimiteIp(
  supabase: SupabaseClient,
  ip: string | null
): Promise<boolean> {
  if (!ip) return false;

  const dalle = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("limite_registrazioni")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("creato_at", dalle);

  if (error) {
    console.error("Errore leggendo il limite di registrazioni per IP:", error.message);
    return false;
  }
  return (count ?? 0) >= LIMITE_GIORNALIERO;
}

/** Va chiamata solo dopo una registrazione riuscita: i tentativi falliti non contano. */
export async function registraTentativoIp(
  supabase: SupabaseClient,
  ip: string | null
): Promise<void> {
  if (!ip) return;
  const { error } = await supabase.from("limite_registrazioni").insert({ ip });
  if (error) {
    console.error("Errore registrando il tentativo per IP:", error.message);
  }
}

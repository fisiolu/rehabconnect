import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client con la service-role key: scavalca la RLS. Solo per route
 * server-side che hanno già verificato "is_admin" per conto proprio
 * (vedi src/app/api/admin/*). Non importare mai in un componente client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

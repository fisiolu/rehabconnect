import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client Supabase per Server Component e Route Handler: legge/scrive i cookie di sessione. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chiamato da un Server Component: i cookie li aggiorna il
            // middleware, qui va bene ignorare l'errore.
          }
        },
      },
    }
  );
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const email = process.argv[2];
if (!email) {
  console.error("Uso: node rimuovi-account-test.mjs <email>");
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.listUsers();
if (error) {
  console.error("Errore:", error.message);
  process.exit(1);
}

const utente = data.users.find((u) => u.email === email);
if (!utente) {
  console.log("Nessun account con questa email.");
  process.exit(0);
}

const { error: erroreCancellazione } = await supabase.auth.admin.deleteUser(utente.id);
if (erroreCancellazione) {
  console.error("Errore cancellando:", erroreCancellazione.message);
  process.exit(1);
}

console.log("Account cancellato (con la sua scheda, tramite on delete cascade):", email);

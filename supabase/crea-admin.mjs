import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error("Uso: node crea-admin.mjs <email> <password>");
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Errore creando l'utente:", error.message);
  process.exit(1);
}

const { error: erroreInsert } = await supabase.from("admins").insert({ user_id: data.user.id });
if (erroreInsert) {
  console.error("Errore inserendo in admins:", erroreInsert.message);
  process.exit(1);
}

console.log("Admin creato:", data.user.id);

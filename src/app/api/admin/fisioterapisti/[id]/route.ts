import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Approva o rifiuta una richiesta d'iscrizione di un fisioterapista. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { azione, nota } = (await request.json()) as {
    azione: "approva" | "rifiuta";
    nota?: string;
  };

  if (azione !== "approva" && azione !== "rifiuta") {
    return NextResponse.json({ errore: "Azione non valida." }, { status: 400 });
  }

  // Il controllo "sono admin?" passa dalla sessione vera del chiamante,
  // non da un parametro che potrebbe essere falsificato.
  const supabase = await createClient();
  const { data: sessione } = await supabase.auth.getUser();
  if (!sessione.user) {
    return NextResponse.json({ errore: "Non sei autenticato." }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", sessione.user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ errore: "Non sei autorizzato." }, { status: 403 });
  }

  // Doppio controllo: questa route usa la service-role key, che scavalca
  // la RLS (dove il check aal2 è già applicato) — va quindi ripetuto qui
  // esplicitamente. Se l'admin ha attivato la verifica in due passaggi,
  // la sessione corrente deve averla già completata (aal2), non bastare
  // la sola password (aal1). Se non l'ha ancora attivata, nextLevel resta
  // "aal1" e il controllo passa: non lo blocchiamo prima che possa
  // iscriversi al secondo fattore dalla sezione Sicurezza.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
    return NextResponse.json(
      { errore: "Completa la verifica in due passaggi per continuare." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("fisioterapisti")
    .update({
      stato_verifica: azione === "approva" ? "approvato" : "rifiutato",
      nota_admin: nota ?? null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ errore: "Non sono riuscito ad aggiornare la scheda." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

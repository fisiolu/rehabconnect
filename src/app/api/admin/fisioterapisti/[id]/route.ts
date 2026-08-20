import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Il controllo "sono admin, con doppio controllo se ha attivato la
 * verifica in due passaggi" serve identico a PATCH e DELETE: centralizzato
 * qui. Ritorna null se tutto ok, altrimenti la risposta d'errore da
 * restituire subito.
 */
async function richiediAdminVerificato() {
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

  // Doppio controllo: le route qui usano la service-role key, che
  // scavalca la RLS (dove il check aal2 è già applicato) — va quindi
  // ripetuto qui esplicitamente. Se l'admin ha attivato la verifica in
  // due passaggi, la sessione corrente deve averla già completata (aal2),
  // non bastare la sola password (aal1). Se non l'ha ancora attivata,
  // nextLevel resta "aal1" e il controllo passa: non lo blocchiamo prima
  // che possa iscriversi al secondo fattore dalla sezione Sicurezza.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
    return NextResponse.json(
      { errore: "Completa la verifica in due passaggi per continuare." },
      { status: 401 }
    );
  }

  return null;
}

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

  const erroreAuth = await richiediAdminVerificato();
  if (erroreAuth) return erroreAuth;

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

/**
 * Elimina definitivamente un account fisioterapista — solo se rifiutato.
 * Chi è in attesa o approvato non si elimina da qui: va prima rifiutato,
 * proprio per non rendere un click solo distante da una cancellazione
 * di un professionista attivo.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const erroreAuth = await richiediAdminVerificato();
  if (erroreAuth) return erroreAuth;

  const supabaseAdmin = createAdminClient();

  const { data: scheda, error: erroreLettura } = await supabaseAdmin
    .from("fisioterapisti")
    .select("stato_verifica")
    .eq("id", id)
    .maybeSingle();

  if (erroreLettura || !scheda) {
    return NextResponse.json({ errore: "Scheda non trovata." }, { status: 404 });
  }

  if (scheda.stato_verifica !== "rifiutato") {
    return NextResponse.json(
      { errore: "Puoi eliminare solo le richieste rifiutate." },
      { status: 400 }
    );
  }

  // Cancella l'account Supabase Auth: la scheda fisioterapisti (e le
  // eventuali conversazioni collegate) sparisce da sola per via del
  // "on delete cascade" nello schema, non serve una seconda query.
  const { error: erroreEliminazione } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (erroreEliminazione) {
    return NextResponse.json({ errore: "Non sono riuscito ad eliminare l'account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificaTurnstile } from "@/lib/turnstile";
import { estraiIp } from "@/lib/ip";
import { haRaggiuntoLimiteIp, registraTentativoIp } from "@/lib/limiteRegistrazioni";

interface CorpoRichiesta {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
  indirizzo: string;
  domicilioLat: number;
  domicilioLng: number;
  turnstileToken?: string;
}

/** Stesso schema della registrazione fisioterapista: account già confermato + scheda, con rollback se la scheda fallisce. */
export async function POST(request: Request) {
  const corpo = (await request.json()) as CorpoRichiesta;
  const ip = estraiIp(request);

  if (!(await verificaTurnstile(corpo.turnstileToken, ip))) {
    return NextResponse.json(
      { errore: "Verifica anti-spam non superata. Ricarica la pagina e riprova." },
      { status: 400 }
    );
  }

  if (!corpo.email || !corpo.password || !corpo.nome || !corpo.cognome) {
    return NextResponse.json({ errore: "Mancano dei campi obbligatori." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (await haRaggiuntoLimiteIp(supabase, ip)) {
    return NextResponse.json(
      { errore: "Hai raggiunto il numero massimo di registrazioni consentite oggi da questa rete. Riprova domani." },
      { status: 429 }
    );
  }

  const { data: creato, error: erroreCreazione } = await supabase.auth.admin.createUser({
    email: corpo.email,
    password: corpo.password,
    email_confirm: true,
  });

  if (erroreCreazione || !creato.user) {
    const messaggio = erroreCreazione?.message.includes("already been registered")
      ? "Esiste già un account con questa email."
      : "Non sono riuscito a creare l'account. Riprova.";
    return NextResponse.json({ errore: messaggio }, { status: 400 });
  }

  const { error: erroreScheda } = await supabase.from("pazienti").insert({
    id: creato.user.id,
    nome: corpo.nome,
    cognome: corpo.cognome,
    telefono: corpo.telefono,
    email: corpo.email,
    indirizzo: corpo.indirizzo,
    domicilio_lat: corpo.domicilioLat,
    domicilio_lng: corpo.domicilioLng,
  });

  if (erroreScheda) {
    await supabase.auth.admin.deleteUser(creato.user.id);
    return NextResponse.json(
      { errore: "Non sono riuscito a salvare i tuoi dati. Riprova." },
      { status: 500 }
    );
  }

  await registraTentativoIp(supabase, ip);

  return NextResponse.json({ ok: true });
}

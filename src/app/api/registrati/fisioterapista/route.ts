import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CorpoRichiesta {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
  specializzazioni: string[];
  numeroAlbo: string;
  pec: string;
  tariffaMin: number;
  tariffaMax: number;
  assicurazioni: string[];
  baseLat: number;
  baseLng: number;
  baseCitta: string;
  baseProvincia: string;
  raggioKm: number;
  anniEsperienza: number;
  presentazione: string;
}

/**
 * Crea l'account (già confermato: non serve aspettare un'email prima di
 * poter usare l'app) e la scheda professionale in un solo passaggio.
 * Se la scheda fallisce, l'account appena creato viene cancellato: non
 * deve restare un utente "orfano" senza profilo.
 */
export async function POST(request: Request) {
  const corpo = (await request.json()) as CorpoRichiesta;

  if (!corpo.email || !corpo.password || !corpo.nome || !corpo.cognome || !corpo.numeroAlbo) {
    return NextResponse.json({ errore: "Mancano dei campi obbligatori." }, { status: 400 });
  }

  // La PEC è obbligatoria: senza, la verifica d'identità non ha su cosa
  // appoggiarsi. Il controllo è anche qui e non solo nel modulo, perché il
  // modulo si può aggirare chiamando questa rotta direttamente.
  const pec = corpo.pec?.trim().toLowerCase() ?? "";
  if (!pec || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pec)) {
    return NextResponse.json(
      { errore: "Serve un indirizzo PEC valido: è quello a cui invieremo la conferma." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

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

  const { error: erroreScheda } = await supabase.from("fisioterapisti").insert({
    id: creato.user.id,
    nome: corpo.nome,
    cognome: corpo.cognome,
    telefono: corpo.telefono,
    email: corpo.email,
    specializzazioni: corpo.specializzazioni,
    numero_albo: corpo.numeroAlbo,
    pec,
    tariffa_min: corpo.tariffaMin,
    tariffa_max: corpo.tariffaMax,
    assicurazioni: corpo.assicurazioni,
    base_lat: corpo.baseLat,
    base_lng: corpo.baseLng,
    base_citta: corpo.baseCitta,
    base_provincia: corpo.baseProvincia,
    raggio_km: corpo.raggioKm,
    anni_esperienza: corpo.anniEsperienza,
    presentazione: corpo.presentazione,
  });

  if (erroreScheda) {
    await supabase.auth.admin.deleteUser(creato.user.id);
    return NextResponse.json(
      { errore: "Non sono riuscito a salvare la scheda professionale. Riprova." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

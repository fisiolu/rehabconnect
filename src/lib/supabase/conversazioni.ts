import type { SupabaseClient } from "@supabase/supabase-js";

export interface Controparte {
  id: string;
  nome: string;
  cognome: string;
  sottotitolo?: string;
  telefono?: string;
}

export interface ConversazioneVista {
  id: string;
  controparte: Controparte;
  ultimoTesto: string;
  ultimoTimestamp: string;
  nonLetti: number;
}

export interface MessaggioDirettoRiga {
  id: string;
  mittente_id: string;
  ruolo: "paziente" | "fisioterapista";
  testo: string;
  timestamp: string;
  letto: boolean;
}

/** Trova la conversazione fra i due, creandola se non esiste ancora. */
export async function apriConversazione(
  supabase: SupabaseClient,
  pazienteId: string,
  fisioterapistaId: string
): Promise<string> {
  const { data: esistente } = await supabase
    .from("conversazioni")
    .select("id")
    .eq("paziente_id", pazienteId)
    .eq("fisioterapista_id", fisioterapistaId)
    .maybeSingle();
  if (esistente) return esistente.id;

  const { data: nuova, error } = await supabase
    .from("conversazioni")
    .insert({ paziente_id: pazienteId, fisioterapista_id: fisioterapistaId })
    .select("id")
    .single();
  if (error || !nuova) throw new Error("Non sono riuscito ad aprire la conversazione.");
  return nuova.id;
}

export async function inviaMessaggioDiretto(
  supabase: SupabaseClient,
  conversazioneId: string,
  mittenteId: string,
  ruolo: "paziente" | "fisioterapista",
  testo: string
) {
  await supabase.from("messaggi_diretti").insert({
    conversazione_id: conversazioneId,
    mittente_id: mittenteId,
    ruolo,
    testo,
  });
}

/** Segna come letti i messaggi ricevuti (non i propri) in quella conversazione. */
export async function segnaConversazioneLetta(
  supabase: SupabaseClient,
  conversazioneId: string,
  lettoreId: string
) {
  await supabase
    .from("messaggi_diretti")
    .update({ letto: true })
    .eq("conversazione_id", conversazioneId)
    .neq("mittente_id", lettoreId)
    .eq("letto", false);
}

export async function caricaMessaggi(
  supabase: SupabaseClient,
  conversazioneId: string
): Promise<MessaggioDirettoRiga[]> {
  const { data } = await supabase
    .from("messaggi_diretti")
    .select("id, mittente_id, ruolo, testo, timestamp, letto")
    .eq("conversazione_id", conversazioneId)
    .order("timestamp", { ascending: true });
  return data ?? [];
}

/**
 * La scheda pubblica della controparte: se sono il paziente, il
 * fisioterapista è leggibile direttamente (approvato o proprio); se sono
 * il fisioterapista, la tabella pazienti è privata e passo dalla funzione
 * "paziente_pubblico", che restituisce solo nome/cognome/telefono e solo
 * se esiste davvero una conversazione fra i due.
 */
export async function caricaControparte(
  supabase: SupabaseClient,
  sonoPaziente: boolean,
  controparteId: string
): Promise<Controparte | null> {
  if (sonoPaziente) {
    const { data } = await supabase
      .from("fisioterapisti")
      .select("id, nome, cognome, specializzazioni, telefono")
      .eq("id", controparteId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      nome: data.nome,
      cognome: data.cognome,
      sottotitolo: (data.specializzazioni as string[] | null)?.join(" · "),
      telefono: data.telefono,
    };
  }

  const { data } = await supabase.rpc("paziente_pubblico", { p_id: controparteId });
  const p = data?.[0];
  if (!p) return null;
  return { id: p.id, nome: p.nome, cognome: p.cognome, telefono: p.telefono };
}

/** Elenco delle conversazioni dell'utente, più recenti e con messaggi non letti per prime. */
export async function caricaConversazioni(
  supabase: SupabaseClient,
  utente: { ruolo: "paziente" | "fisioterapista"; id: string }
): Promise<ConversazioneVista[]> {
  const sonoPaziente = utente.ruolo === "paziente";
  const { data: righe } = await supabase
    .from("conversazioni")
    .select("id, paziente_id, fisioterapista_id, iniziata")
    .eq(sonoPaziente ? "paziente_id" : "fisioterapista_id", utente.id);

  if (!righe || righe.length === 0) return [];

  const viste = await Promise.all(
    righe.map(async (c): Promise<ConversazioneVista | null> => {
      const controparteId = sonoPaziente ? c.fisioterapista_id : c.paziente_id;
      const controparte = await caricaControparte(supabase, sonoPaziente, controparteId);
      if (!controparte) return null;

      const messaggi = await caricaMessaggi(supabase, c.id);
      const ultimo = messaggi[messaggi.length - 1];
      const nonLetti = messaggi.filter((m) => !m.letto && m.mittente_id !== utente.id).length;

      return {
        id: c.id,
        controparte,
        ultimoTesto: ultimo?.testo ?? "",
        ultimoTimestamp: ultimo?.timestamp ?? c.iniziata,
        nonLetti,
      };
    })
  );

  return viste
    .filter((v): v is ConversazioneVista => v !== null)
    .sort((a, b) => {
      if (a.nonLetti !== b.nonLetti) return b.nonLetti - a.nonLetti;
      return b.ultimoTimestamp.localeCompare(a.ultimoTimestamp);
    });
}

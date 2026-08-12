import { NextResponse } from "next/server";
import { urlSito } from "@/lib/sito";

/**
 * Trasforma un testo scritto dal paziente ("Gaeta", "Via Roma 12, Formia")
 * nelle coordinate da cui far partire la ricerca.
 *
 * Si appoggia a Nominatim, il servizio di ricerca di OpenStreetMap: gratuito,
 * senza registrazione né chiave, la stessa fonte delle mappe già in uso.
 *
 * La chiamata parte dal server e non dal browser per tre motivi:
 * - il regolamento di Nominatim chiede di identificare l'applicazione con
 *   un'intestazione User-Agent, che il browser non permette di impostare;
 * - così l'indirizzo di casa del paziente non viene inviato dal suo
 *   dispositivo a un terzo, ma passa da noi;
 * - possiamo tenere una memoria delle ricerche già fatte e non ripeterle.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/** Ricerche già risolte, per non ripetere chiamate identiche. */
const memoria = new Map<string, Risultato[]>();
const LIMITE_MEMORIA = 200;

interface Risultato {
  nome: string;
  lat: number;
  lng: number;
}

interface VoceNominatim {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

/** Nome corto e leggibile: "Gaeta (LT)" invece dell'indirizzo completo. */
function nomeLeggibile(v: VoceNominatim): string {
  const a = v.address ?? {};
  const luogo =
    a.city ?? a.town ?? a.village ?? a.hamlet ?? a.municipality ?? a.county ?? "";
  const via = a.road ? `${a.road}${a.house_number ? " " + a.house_number : ""}` : "";
  const provincia = a["ISO3166-2-lvl6"]?.split("-").pop() ?? "";

  const parti = [via, luogo].filter(Boolean);
  const testa = parti.length > 0 ? parti.join(", ") : v.display_name.split(",")[0];
  return provincia ? `${testa} (${provincia})` : testa;
}

/** Una sola interrogazione a Nominatim, senza ripieghi. */
async function interroga(testo: string): Promise<Risultato[]> {
  const url = new URL(NOMINATIM);
  url.searchParams.set("q", testo);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  // Solo Italia: la piattaforma serve il territorio italiano.
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", "8");
  url.searchParams.set("accept-language", "it");

  const risposta = await fetch(url, {
    headers: {
      // Richiesto dal regolamento di Nominatim per identificare chi chiama.
      "User-Agent": `FisioterapistaDomiciliare/1.0 (${urlSito()})`,
      "Accept-Language": "it",
    },
    // Le coordinate di una via o di un comune non cambiano: si tengono a lungo.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!risposta.ok) throw new Error(String(risposta.status));

  const voci = (await risposta.json()) as VoceNominatim[];

  // Nominatim restituisce spesso lo stesso nome più volte, un tratto di strada
  // per volta: al paziente presentarne cinque uguali non serve a niente.
  const visti = new Set<string>();
  const risultati: Risultato[] = [];
  for (const v of voci) {
    const nome = nomeLeggibile(v);
    if (visti.has(nome)) continue;
    visti.add(nome);
    risultati.push({ nome, lat: parseFloat(v.lat), lng: parseFloat(v.lon) });
    if (risultati.length === 6) break;
  }
  return risultati;
}

/**
 * Da "Via Roma 12, Formia" ricava "Formia": l'ultimo pezzo dopo la virgola,
 * oppure l'ultima parola che non sia un numero.
 */
function probabileComune(testo: string): string | null {
  if (testo.includes(",")) {
    const coda = testo.split(",").pop()?.trim();
    if (coda && coda.length >= 3) return coda;
  }
  const parole = testo.split(/\s+/).filter((p) => p.length >= 3 && !/^\d+$/.test(p));
  if (parole.length >= 2) return parole[parole.length - 1];
  return null;
}

export async function GET(richiesta: Request) {
  const testo = new URL(richiesta.url).searchParams.get("q")?.trim() ?? "";

  if (testo.length < 3) {
    return NextResponse.json({ risultati: [] });
  }

  const chiave = testo.toLowerCase();
  const salvato = memoria.get(chiave);
  if (salvato) {
    return NextResponse.json({ risultati: salvato, dallaMemoria: true });
  }

  try {
    let risultati = await interroga(testo);
    let ripiego = false;

    // Se l'indirizzo esatto non esiste in OpenStreetMap, invece di lasciare il
    // paziente a mani vuote si riprova col solo comune: la ricerca per
    // vicinanza resta comunque utile.
    if (risultati.length === 0) {
      const comune = probabileComune(testo);
      if (comune && comune.toLowerCase() !== chiave) {
        risultati = await interroga(comune);
        ripiego = risultati.length > 0;
      }
    }

    if (memoria.size >= LIMITE_MEMORIA) memoria.clear();
    memoria.set(chiave, risultati);

    return NextResponse.json({ risultati, ripiego });
  } catch {
    return NextResponse.json(
      { risultati: [], errore: "Non sono riuscito a contattare il servizio di ricerca." },
      { status: 502 }
    );
  }
}

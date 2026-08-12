import type { Fisioterapista } from "./demoData";

export interface Coordinate {
  lat: number;
  lng: number;
}

const RAGGIO_TERRA_KM = 6371;

function gradiInRadianti(gradi: number): number {
  return (gradi * Math.PI) / 180;
}

/**
 * Distanza in linea d'aria fra due punti (formula dell'emisenoverso).
 * Sulle distanze cittadine l'errore rispetto al percorso stradale reale
 * è sistematico: la strada è sempre più lunga della linea d'aria.
 */
export function distanzaKm(a: Coordinate, b: Coordinate): number {
  const dLat = gradiInRadianti(b.lat - a.lat);
  const dLng = gradiInRadianti(b.lng - a.lng);
  const lat1 = gradiInRadianti(a.lat);
  const lat2 = gradiInRadianti(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * RAGGIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** Distanza leggibile in italiano: "800 m", "2,4 km", "13 km". */
export function formattaDistanza(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

export interface FiltriRicerca {
  specializzazione?: string;
  soloDisponibili?: boolean;
  /** Esclude chi dichiara di non spingersi fino al domicilio del paziente. */
  soloRaggiungibili?: boolean;
}

export interface RisultatoRicerca {
  fisioterapista: Fisioterapista;
  distanzaKm: number;
  /** Il domicilio del paziente rientra nel raggio dichiarato dal Fisioterapista. */
  raggiungibile: boolean;
}

/**
 * Ordina i Fisioterapisti dal più vicino al più lontano rispetto al domicilio
 * del paziente, applicando i filtri richiesti.
 */
export function cercaFisioterapistiVicini(
  domicilio: Coordinate,
  elenco: Fisioterapista[],
  filtri: FiltriRicerca = {}
): RisultatoRicerca[] {
  return elenco
    .map((fisioterapista) => {
      const km = distanzaKm(domicilio, fisioterapista.base);
      return {
        fisioterapista,
        distanzaKm: km,
        raggiungibile: km <= fisioterapista.raggioKm,
      };
    })
    .filter(({ fisioterapista, raggiungibile }) => {
      if (filtri.soloDisponibili && !fisioterapista.disponibile) return false;
      if (filtri.soloRaggiungibili && !raggiungibile) return false;
      if (
        filtri.specializzazione &&
        !fisioterapista.specializzazioni.includes(filtri.specializzazione)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.distanzaKm - b.distanzaKm);
}

/** Tutte le specializzazioni presenti, in ordine alfabetico, senza ripetizioni. */
export function specializzazioniDisponibili(elenco: Fisioterapista[]): string[] {
  const insieme = new Set<string>();
  elenco.forEach((f) => f.specializzazioni.forEach((s) => insieme.add(s)));
  return Array.from(insieme).sort((a, b) => a.localeCompare(b, "it"));
}

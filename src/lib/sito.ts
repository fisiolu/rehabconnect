/**
 * Dati di identità del sito, in un posto solo.
 * Li usano i metadati della pagina, l'anteprima social, robots.txt e la sitemap.
 */

export const NOME_SITO = "Fisioterapista Domiciliare";

export const CLAIM = "Trova chi lavora vicino a te";

export const DESCRIZIONE =
  "Vedi sulla mappa quali Fisioterapisti a domicilio lavorano nella tua zona, con le loro specialità e la distanza da casa tua.";

/**
 * Indirizzo pubblico del sito.
 * In sviluppo è localhost; su Vercel viene preso automaticamente dall'ambiente.
 * Per fissare un dominio proprio basta impostare NEXT_PUBLIC_SITE_URL.
 */
export function urlSito(): string {
  const esplicito = process.env.NEXT_PUBLIC_SITE_URL;
  if (esplicito) return `https://${esplicito.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(dir, "schema.sql"), "utf8");

const raw = process.env.POSTGRES_URL_NON_POOLING;
if (!raw) {
  console.error("POSTGRES_URL_NON_POOLING non impostata.");
  process.exit(1);
}

// Rimuovo sslmode dalla stringa: altrimenti sovrascrive l'opzione ssl
// esplicita qui sotto (pg-connection-string tratta "require" come alias
// di "verify-full", che rifiuta il certificato del pooler Supabase).
const url = new URL(raw);
url.searchParams.delete("sslmode");
const connectionString = url.toString();

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("Schema applicato con successo.");
} catch (err) {
  console.error("Errore applicando lo schema:", err.message);
  process.exit(1);
} finally {
  await client.end();
}

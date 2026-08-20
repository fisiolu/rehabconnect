# RehabConnect (Fisioterapista Domiciliare) — CLAUDE.md

## Cos'è

App per collegare pazienti e fisioterapisti che lavorano a domicilio:
ricerca per vicinanza, messaggistica diretta, e il ciclo clinico formale
(richiesta → medico → assegnazione → referto). Online su
[app.fisioterapistadomiciliare.it](https://app.fisioterapistadomiciliare.it),
sottodominio del sito vetrina [fisioterapistadomiciliare.it](https://fisioterapistadomiciliare.it)
(repo separato `Fisioterapista-domiciliare`).

## Stack tecnico

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3**, palette in `tailwind.config.ts` — stessa famiglia
  cromatica del sito, con un accento (`primary`/`blue`) leggermente più
  freddo per differenziare le due schede del browser
- **Supabase**: Postgres + Auth, provisionato tramite l'integrazione
  nativa di Vercel Marketplace (`vercel integration add supabase`) —
  variabili d'ambiente in `.env.local`, mai versionate
- **Vercel**: hosting, deploy automatico ad ogni push su `main`
- Font di sistema, icone `lucide-react`, mappa `leaflet`

## Stato reale vs demo — la cosa più importante da sapere

**Fisioterapisti e pazienti hanno account veri** (Supabase Auth + tabelle
`fisioterapisti`/`pazienti`, RLS attiva). Login, registrazione, ricerca in
`/trova` e messaggistica diretta (`/messaggi`) leggono e scrivono lì.

**Il Medico e l'intero ciclo "Richiesta"** (triage del medico →
assegnazione → referto → valutazioni → foto esercizi) **sono ancora dati
finti**, in `src/lib/demoData.ts`. Non sono la stessa cosa delle
conversazioni dirette: c'è un commento nel codice (`Conversazione` in
`demoData.ts`) che lo spiega — la Conversazione nasce dalla ricerca e non
passa da un medico, la Richiesta sì. Migrarle è un passo successivo, non
ancora fatto.

Il Medico entra ancora con un ingresso demo dalla home
(`entraComeMedicoDemo` in `AppContext.tsx`) — l'unico ruolo rimasto così,
dichiarato esplicitamente nel codice.

### Cosa consultare per ciascun dominio

| Dominio | Reale (Supabase) | Ancora demo |
|---|---|---|
| Fisioterapisti | `src/lib/supabase/fisioterapisti.ts`, tabella `fisioterapisti` | — |
| Pazienti | `src/lib/supabase/pazienti.ts`, tabella `pazienti` | — |
| Conversazioni dirette | `src/lib/supabase/conversazioni.ts`, tabelle `conversazioni`/`messaggi_diretti` | — |
| Medico di riferimento (scheda recapiti) | tabella `medici_riferimento`, in `SchedaMedico.tsx` | — |
| Richieste, referto, valutazioni, foto esercizi | — | `src/lib/demoData.ts` + `AppContext.tsx` |
| Account Medico | — | `entraComeMedicoDemo` |

## Autenticazione

Supabase Auth (email + password), niente provider terzo. Il ruolo
dell'utente loggato non è un flag salvato da qualche parte: si scopre
cercando l'id nell'ordine `admins` → `fisioterapisti` → `pazienti` (vedi
`src/lib/supabase/ruolo.ts`, usato sia da `AppContext` che da `/accedi`).

- **Registrazione** (`/registrati/paziente`, `/registrati/fisioterapista`)
  passa da una Route Handler (`src/app/api/registrati/*`) con la
  service-role key: crea l'account già confermato e la scheda in un solo
  passaggio, con rollback dell'account se la scheda fallisce.
- **Fisioterapisti**: `stato_verifica` (`in_attesa`/`approvato`/`rifiutato`)
  decide se compaiono in ricerca. Approvazione/rifiuto passano da
  `src/app/api/admin/fisioterapisti/[id]/route.ts`, protetta da un
  controllo `admins` lato server (mai dal client).
- **Amministratori**: nessuna auto-iscrizione. Un admin è una riga nella
  tabella `admins` (`user_id` = id Supabase), aggiunta a mano via SQL —
  vedi `supabase/crea-admin.mjs`.
- Le guardie di accesso (`useEffect` + redirect su ogni pagina protetta)
  sono rimaste nella stessa forma di sempre: cambia solo la fonte di
  `utente` in `AppContext`, non le 9 pagine che lo consumano.

## Schema del database

`supabase/schema.sql` è la fonte di verità versionata (tabelle + RLS).
Per applicare modifiche allo schema in sviluppo: `supabase/run-migration.mjs`
(richiede `POSTGRES_URL_NON_POOLING` nell'ambiente, vedi `.env.local`).

Punti da tenere a mente:
- `pazienti` non è mai leggibile pubblicamente (RLS owner-only). Un
  fisioterapista vede nome/cognome/telefono di un paziente con cui ha una
  conversazione tramite la funzione `paziente_pubblico` (security definer,
  ricontrolla comunque che i due si conoscano) — non tramite una policy
  che apra la tabella.
- `fisioterapisti` è pubblico solo dove `stato_verifica = 'approvato'`
  (più il proprio profilo, più tutto per un admin).
- La service-role key (`SUPABASE_SERVICE_ROLE_KEY`) si usa solo in Route
  Handler server-side, mai in un componente client.

## Regole da rispettare quando modifichi il progetto

- **Non trattare `demoData.ts` come se fosse tutto finto**: `pazienti`,
  `medici`, `fisioterapisti` lì dentro servono solo al ciclo Richieste
  ancora da migrare — leggi il commento in cima a `pazienti` prima di
  aggiungere un nuovo consumo di quell'array.
- **Non reintrodurre un `setUtente` generico** in `AppContext`: rompe il
  modello di sicurezza (chiunque potrebbe fingersi un altro ruolo). Se
  serve un secondo ingresso demo temporaneo (es. per il Medico), seguilo
  come pattern esplicito e commentato, non come funzione generale.
- **RLS prima di tutto**: ogni nuova tabella va pensata con
  `alter table ... enable row level security` e policy esplicite, non
  lasciata aperta "per ora".
- **Non versionare `.env.local`** né incollare chiavi Supabase nei commit.
- Contenuti in italiano, stesso tono del sito gemello (semplice,
  rassicurante, senza tecnicismi).

## Attività ancora aperte

- Migrare il ciclo Richieste (medico, referto, valutazioni, foto esercizi)
  su Supabase — resta l'unico pezzo davvero "demo".
- Dare al Medico un account Supabase vero (oggi `entraComeMedicoDemo`).
- Tab "Richieste"/"Panoramica" di `/dashboard/admin`: ancora lettura pura
  di `demoData`, da collegare quando le Richieste diventano reali.
- Realtime per la chat diretta (oggi si aggiorna solo ricaricando dopo
  l'invio, niente sottoscrizione Supabase Realtime).
- Query di ricerca lato client (haversine su tutti i fisioterapisti
  approvati): va benissimo alla scala attuale, da rivalutare con
  PostGIS/`ST_DWithin` se il numero di iscritti cresce molto.

## Idee in discussione (agosto 2026, non ancora decise né iniziate)

Ragionate insieme prima di scrivere codice — nessuna delle tre è ancora
iniziata. Vanno riprese da qui, non da zero, alla prossima sessione.

- **Campi di accessibilità sulla scheda paziente** (piano, ascensore
  sì/no, note d'accesso tipo parcheggio/citofono): il fisioterapista li
  vedrebbe prima di accettare/spostarsi, non dopo essere già arrivato.
  Costo di sviluppo basso (pochi campi in più su `pazienti` + un modulo),
  valore alto. Non ancora costruito.
- **Servizio/pubblicità per fisioterapisti** (assicurazioni, officine,
  offerte legate ai costi di spostamento): **rimandato esplicitamente
  dall'utente**. Motivo: oggi la piattaforma ha zero fisioterapisti
  iscritti — vendere spazi a inserzionisti non ha senso senza un pubblico
  vero, ed è comunque un cambio di natura del progetto (da incontro
  paziente-fisioterapista a media/concessionaria). Se si riprende in
  futuro, partire da una pagina statica di convenzioni negoziate a mano,
  non da un sistema di gestione inserzionisti.
- **Telemedicina**: forma concordata con l'utente — non un pulsante
  video generico sempre visibile, ma un passo dentro la conversazione
  già esistente fra paziente e fisioterapista (stessa `Conversazione`
  di oggi, non una funzione a sé). Il percorso:
  1. Il paziente trova il fisioterapista in `/trova` (già reale).
  2. Prima di scrivere liberamente, compila un **breve questionario
     guidato** (4 domande a scelta, non testo libero libero):
     da quanto ha il disturbo, se ha già diagnosi/prescrizione del
     medico, qual è la zona/il problema principale (unico campo di
     testo libero), quanto riesce a muoversi da solo in casa. Va
     salvato come dati strutturati (non testo semplice) e mostrato al
     fisioterapista come una scheda riassuntiva, non come un messaggio
     di chat qualunque — diventa il primo "messaggio" della
     conversazione.
  3. Il fisioterapista risponde in chat come oggi; se ha bisogno di
     vedere il paziente muoversi o fargli domande dal vivo prima di
     decidere se e come venire, propone lui una videochiamata — un
     link generato al volo dentro quella stessa conversazione.
  4. Solo dopo si fissa (se ha senso) la visita vera a domicilio.
  Nota tecnica discussa: per il video, partire dalla versione economica
  (link a una stanza tipo Jitsi, nessuna infrastruttura nuova da
  mantenere) invece di un SDK a pagamento (Daily.co/Twilio), che resta
  un'opzione per dopo se serve più controllo/qualità.

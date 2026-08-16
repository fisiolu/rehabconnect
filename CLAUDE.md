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

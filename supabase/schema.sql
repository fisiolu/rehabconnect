-- Schema per la Fase 1: fisioterapisti e pazienti veri, con approvazione
-- manuale dei fisioterapisti. Vedi /Users/luckyl_luciano/.claude/plans/
-- silly-booping-patterson.md per il contesto completo.
--
-- Niente tabella "profiles" condivisa: rispecchia demoData.ts, che ha
-- interfacce separate per ruolo. id di ogni tabella = auth.users.id.

-- ---------------------------------------------------------------------
-- Fisioterapisti
-- ---------------------------------------------------------------------
create table if not exists fisioterapisti (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cognome text not null,
  telefono text not null,
  email text not null,
  specializzazioni text[] not null default '{}',
  disponibile boolean not null default true,
  valutazione numeric not null default 0,
  numero_albo text not null,
  -- Casella PEC dichiarata all'iscrizione, obbligatoria.
  -- Il numero d'albo è pubblico e chiunque può copiarlo: prova che il
  -- professionista esiste, non che sia chi si sta iscrivendo. La PEC è per
  -- legge obbligatoria per gli iscritti all'Ordine ed è la sola cosa che il
  -- professionista vero controlla. Prima di approvare va CONFRONTATA con
  -- quella ufficiale su inipec.gov.it: inviare alla PEC digitata senza
  -- confronto non protegge da nulla.
  pec text not null default '',
  tariffa_min int not null,
  tariffa_max int not null,
  assicurazioni text[] not null default '{}',
  base_lat double precision not null,
  base_lng double precision not null,
  base_citta text not null,
  base_provincia text not null,
  raggio_km int not null,
  anni_esperienza int not null,
  presentazione text not null default '',
  -- Percorso della foto dentro il bucket "foto-fisioterapisti", non un URL.
  -- Facoltativa. Non compare nella grant per il ruolo anon più sotto, quindi
  -- chi cerca senza aver fatto accesso non la riceve nemmeno come stringa:
  -- l'immagine vera sta in un bucket privato e richiede un link firmato,
  -- che solo un utente autenticato può ottenere.
  foto_path text,
  stato_verifica text not null default 'in_attesa'
    check (stato_verifica in ('in_attesa', 'approvato', 'rifiutato')),
  nota_admin text,
  created_at timestamptz not null default now()
);

-- Per gli archivi creati prima che la PEC diventasse obbligatoria:
-- "create table if not exists" qui sopra non tocca una tabella già esistente.
alter table fisioterapisti add column if not exists pec text not null default '';
alter table fisioterapisti add column if not exists foto_path text;

alter table fisioterapisti enable row level security;

create policy "fisioterapisti_select_pubblico_o_proprio"
  on fisioterapisti for select
  using (stato_verifica = 'approvato' or id = auth.uid());

-- L'admin deve vedere anche le schede in attesa/rifiutate altrui, per
-- poterle approvare dalla dashboard.
--
-- NB: qui NON si controlla aal2/auth.mfa_factors. Ci avevo provato (vedi
-- git log), ma il ruolo "authenticated" non ha grant di lettura su
-- auth.mfa_factors su questo progetto, quindi la subquery falliva con un
-- errore di permesso — e siccome un errore in una policy manda in errore
-- l'intera SELECT, l'admin smetteva di vedere fisioterapisti E pazienti,
-- non solo quelli col secondo fattore. Il doppio controllo per l'admin
-- resta comunque attivo dove serve davvero: al login (src/app/accedi) e
-- sulla route che approva/rifiuta (src/app/api/admin/fisioterapisti/[id]),
-- che passano dall'Auth API di Supabase invece che da una query SQL.
drop policy if exists "fisioterapisti_select_admin" on fisioterapisti;
create policy "fisioterapisti_select_admin"
  on fisioterapisti for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "fisioterapisti_insert_proprio"
  on fisioterapisti for insert
  with check (id = auth.uid());

create policy "fisioterapisti_update_proprio"
  on fisioterapisti for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Il fisioterapista non decide da solo se è approvato: solo la route
-- admin (service role, che scavalca la RLS) può toccare questi due campi.
revoke update on fisioterapisti from authenticated;
grant update (
  nome, cognome, telefono, email, specializzazioni, disponibile,
  numero_albo, tariffa_min, tariffa_max, assicurazioni,
  base_lat, base_lng, base_citta, base_provincia, raggio_km,
  anni_esperienza, presentazione, foto_path
) on fisioterapisti to authenticated;

-- Chi cerca senza aver fatto login vede la scheda per intero tranne
-- cognome, telefono ed email: bastano per farsi un'idea, ma per
-- contattare davvero il professionista serve registrarsi. RLS filtra le
-- righe (solo gli approvati), questo filtra le colonne: la policy da
-- sola non basta, Postgres nega colonna per colonna solo con GRANT/REVOKE.
revoke select on fisioterapisti from anon;
grant select (
  id, nome, specializzazioni, disponibile, valutazione, numero_albo,
  tariffa_min, tariffa_max, assicurazioni, base_lat, base_lng,
  base_citta, base_provincia, raggio_km, anni_esperienza, presentazione,
  stato_verifica, created_at
) on fisioterapisti to anon;

-- ---------------------------------------------------------------------
-- Foto dei fisioterapisti (facoltative)
--
-- Bucket PRIVATO, non pubblico: un bucket pubblico servirebbe l'immagine a
-- chiunque conosca l'URL, e la foto tornerebbe visibile a chi non si è
-- registrato — proprio ciò che vogliamo evitare. Da privato, l'immagine si
-- ottiene solo con un link firmato a scadenza, che il database rilascia
-- soltanto a un utente autenticato.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('foto-fisioterapisti', 'foto-fisioterapisti', false)
on conflict (id) do update set public = false;

-- Ognuno gestisce solo la propria foto: il percorso deve iniziare con il
-- proprio id utente (es. "<uid>/profilo.jpg").
drop policy if exists "foto_fisio_scrittura_propria" on storage.objects;
create policy "foto_fisio_scrittura_propria"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'foto-fisioterapisti'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "foto_fisio_aggiornamento_proprio" on storage.objects;
create policy "foto_fisio_aggiornamento_proprio"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'foto-fisioterapisti'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "foto_fisio_cancellazione_propria" on storage.objects;
create policy "foto_fisio_cancellazione_propria"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'foto-fisioterapisti'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Chi ha fatto accesso può vedere le foto: è il permesso che rende possibile
-- generare il link firmato. Al ruolo anon non è concesso nulla, quindi chi
-- non si è registrato non può ottenere né il percorso né l'immagine.
drop policy if exists "foto_fisio_lettura_autenticati" on storage.objects;
create policy "foto_fisio_lettura_autenticati"
  on storage.objects for select to authenticated
  using (bucket_id = 'foto-fisioterapisti');

-- ---------------------------------------------------------------------
-- Pazienti
-- ---------------------------------------------------------------------
create table if not exists pazienti (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cognome text not null,
  -- Niente data di nascita né codice fiscale: per far incontrare un paziente
  -- e un Fisioterapista vicino servono nome, indirizzo e telefono. Il codice
  -- fiscale non entra in nessun calcolo e contiene già data e luogo di
  -- nascita: conservarlo senza usarlo sarebbe solo un rischio in più, contro
  -- il principio di minimizzazione. La fattura la emette il professionista,
  -- che quel dato se lo fa dare direttamente.
  telefono text not null,
  email text not null,
  indirizzo text not null,
  domicilio_lat double precision not null,
  domicilio_lng double precision not null,
  created_at timestamptz not null default now()
);

-- Per gli archivi creati quando questi due campi erano ancora richiesti.
-- ATTENZIONE: cancella definitivamente i dati già raccolti. È voluto — sono
-- dati che non dobbiamo più conservare — ma è irreversibile.
alter table pazienti drop column if exists data_nascita;
alter table pazienti drop column if exists codice_fiscale;

alter table pazienti enable row level security;

create policy "pazienti_select_proprio"
  on pazienti for select
  using (id = auth.uid());

create policy "pazienti_insert_proprio"
  on pazienti for insert
  with check (id = auth.uid());

create policy "pazienti_update_proprio"
  on pazienti for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Stesso motivo della policy analoga su fisioterapisti: l'admin deve
-- poter vedere l'elenco reale degli iscritti dalla propria dashboard.
-- Stesso motivo per cui NON controlla aal2 qui: vedi il commento sopra
-- su fisioterapisti_select_admin.
drop policy if exists "pazienti_select_admin" on pazienti;
create policy "pazienti_select_admin"
  on pazienti for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- Limite di registrazioni per indirizzo IP (anti-abuso, non anti-frode:
-- un IP domestico è spesso condiviso da più persone, per questo il
-- limite applicato in src/lib/limiteRegistrazioni.ts resta permissivo).
-- Una riga per ogni registrazione riuscita, letta e scritta solo dalle
-- route server con la service-role key: nessuna policy pubblica.
-- ---------------------------------------------------------------------
create table if not exists limite_registrazioni (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  creato_at timestamptz not null default now()
);

create index if not exists limite_registrazioni_ip_creato_at
  on limite_registrazioni (ip, creato_at);

alter table limite_registrazioni enable row level security;

-- ---------------------------------------------------------------------
-- Medico di riferimento (scheda di soli recapiti, auto-dichiarata)
-- ---------------------------------------------------------------------
create table if not exists medici_riferimento (
  paziente_id uuid primary key references pazienti(id) on delete cascade,
  nome text,
  cognome text,
  ruolo text,
  ambulatorio text,
  telefono text,
  email text,
  orari text,
  note text
);

alter table medici_riferimento enable row level security;

create policy "medici_riferimento_tutto_proprio"
  on medici_riferimento for all
  using (paziente_id = auth.uid())
  with check (paziente_id = auth.uid());

-- ---------------------------------------------------------------------
-- Admin: la presenza di una riga = amministratore. Righe inserite a mano
-- da voi (via SQL editor) — nessuna route dell'app scrive qui.
-- L'unica policy permette a ciascuno di verificare solo se stesso, mai di
-- elencare gli altri admin: serve al client per sapere il proprio ruolo
-- dopo il login, senza aprire una lettura pubblica della tabella.
-- ---------------------------------------------------------------------
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

create policy "admins_select_solo_se_stesso"
  on admins for select
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Conversazioni dirette paziente <-> fisioterapista (nate da /trova,
-- indipendenti dal ciclo "Richiesta" ancora a dati finti).
-- ---------------------------------------------------------------------
create table if not exists conversazioni (
  id uuid primary key default gen_random_uuid(),
  paziente_id uuid not null references pazienti(id) on delete cascade,
  fisioterapista_id uuid not null references fisioterapisti(id) on delete cascade,
  iniziata timestamptz not null default now(),
  unique (paziente_id, fisioterapista_id)
);

alter table conversazioni enable row level security;

create policy "conversazioni_solo_partecipanti"
  on conversazioni for select
  using (paziente_id = auth.uid() or fisioterapista_id = auth.uid());

create policy "conversazioni_insert_partecipante"
  on conversazioni for insert
  with check (paziente_id = auth.uid() or fisioterapista_id = auth.uid());

-- Un fisioterapista non può leggere la tabella pazienti (è privata), ma
-- deve poter vedere nome/cognome/telefono di chi gli scrive: una funzione
-- con privilegi elevati, che internamente ricontrolla comunque che i due
-- si conoscano davvero tramite una conversazione, tiene tutto il resto
-- della scheda (codice fiscale, indirizzo, data di nascita...) invisibile.
create or replace function paziente_pubblico(p_id uuid)
returns table (id uuid, nome text, cognome text, telefono text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.nome, p.cognome, p.telefono
  from pazienti p
  where p.id = p_id
    and exists (
      select 1 from conversazioni c
      where c.paziente_id = p.id and c.fisioterapista_id = auth.uid()
    );
$$;

grant execute on function paziente_pubblico(uuid) to authenticated;

create table if not exists messaggi_diretti (
  id uuid primary key default gen_random_uuid(),
  conversazione_id uuid not null references conversazioni(id) on delete cascade,
  mittente_id uuid not null,
  ruolo text not null check (ruolo in ('paziente', 'fisioterapista')),
  testo text not null,
  timestamp timestamptz not null default now(),
  letto boolean not null default false
);

alter table messaggi_diretti enable row level security;

create policy "messaggi_diretti_solo_partecipanti_select"
  on messaggi_diretti for select
  using (
    exists (
      select 1 from conversazioni c
      where c.id = messaggi_diretti.conversazione_id
        and (c.paziente_id = auth.uid() or c.fisioterapista_id = auth.uid())
    )
  );

create policy "messaggi_diretti_insert_partecipante"
  on messaggi_diretti for insert
  with check (
    mittente_id = auth.uid()
    and exists (
      select 1 from conversazioni c
      where c.id = messaggi_diretti.conversazione_id
        and (c.paziente_id = auth.uid() or c.fisioterapista_id = auth.uid())
    )
  );

-- Serve solo per segnare come letti i messaggi dell'altra persona: si
-- limita alla colonna "letto", non si può riscrivere il testo altrui.
create policy "messaggi_diretti_update_partecipante"
  on messaggi_diretti for update
  using (
    exists (
      select 1 from conversazioni c
      where c.id = messaggi_diretti.conversazione_id
        and (c.paziente_id = auth.uid() or c.fisioterapista_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from conversazioni c
      where c.id = messaggi_diretti.conversazione_id
        and (c.paziente_id = auth.uid() or c.fisioterapista_id = auth.uid())
    )
  );

revoke update on messaggi_diretti from authenticated;
grant update (letto) on messaggi_diretti to authenticated;

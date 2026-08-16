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
  stato_verifica text not null default 'in_attesa'
    check (stato_verifica in ('in_attesa', 'approvato', 'rifiutato')),
  nota_admin text,
  created_at timestamptz not null default now()
);

alter table fisioterapisti enable row level security;

create policy "fisioterapisti_select_pubblico_o_proprio"
  on fisioterapisti for select
  using (stato_verifica = 'approvato' or id = auth.uid());

-- L'admin deve vedere anche le schede in attesa/rifiutate altrui, per
-- poterle approvare dalla dashboard.
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
  anni_esperienza, presentazione
) on fisioterapisti to authenticated;

-- ---------------------------------------------------------------------
-- Pazienti
-- ---------------------------------------------------------------------
create table if not exists pazienti (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cognome text not null,
  data_nascita date not null,
  codice_fiscale text not null,
  telefono text not null,
  email text not null,
  indirizzo text not null,
  domicilio_lat double precision not null,
  domicilio_lng double precision not null,
  created_at timestamptz not null default now()
);

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

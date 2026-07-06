-- Run this once in the Supabase SQL editor, AFTER 0008_notifications.sql.
-- Adds internship-fee tracking: a fixed fee amount per session, and a ledger
-- of cumulative payments per stagiaire (status is derived client-side by
-- comparing the sum of payments to the session's fee amount).

alter table public.stage_sessions
  add column if not exists frais_montant numeric(10, 2);

-- New notification kind for payment records (see 0008_notifications.sql).
alter type public.notification_type add value if not exists 'paiement';

create table if not exists public.paiements (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stage_sessions (id) on delete cascade,
  stagiaire_id uuid not null references public.stagiaires (id) on delete cascade,
  montant numeric(10, 2) not null check (montant > 0),
  moyen text,
  date_paiement date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists paiements_session_stagiaire_idx
  on public.paiements (session_id, stagiaire_id);

alter table public.paiements enable row level security;

drop policy if exists "Admins manage paiements" on public.paiements;
create policy "Admins manage paiements" on public.paiements
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Stagiaires read own paiements" on public.paiements;
create policy "Stagiaires read own paiements" on public.paiements
  for select using (
    exists (
      select 1 from public.stagiaires s
      where s.id = paiements.stagiaire_id and s.user_id = auth.uid()
    )
  );

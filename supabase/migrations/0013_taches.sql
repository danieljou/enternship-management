-- Run this once in the Supabase SQL editor, AFTER 0012_encadrants.sql.
-- Adds an internal task-tracking table for admins/encadrants (the "Tâches"
-- sidebar entry, previously an empty placeholder).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tache_statut') then
    create type public.tache_statut as enum ('a_faire', 'en_cours', 'termine');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tache_priorite') then
    create type public.tache_priorite as enum ('basse', 'normale', 'haute');
  end if;
end $$;

create table if not exists public.taches (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  statut public.tache_statut not null default 'a_faire',
  priorite public.tache_priorite not null default 'normale',
  echeance date,
  stagiaire_id uuid references public.stagiaires (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists taches_assigned_to_idx on public.taches (assigned_to);
create index if not exists taches_statut_idx on public.taches (statut);

alter table public.taches enable row level security;

drop policy if exists "Admins manage taches" on public.taches;
create policy "Admins manage taches" on public.taches
  for all using (public.is_admin()) with check (public.is_admin());

-- Assignees (encadrants) can see and update their own assigned tasks, but
-- not reassign, retitle for others, or see the whole list.
drop policy if exists "Assignees read own taches" on public.taches;
create policy "Assignees read own taches" on public.taches
  for select using (assigned_to = auth.uid());

drop policy if exists "Assignees update own taches status" on public.taches;
create policy "Assignees update own taches status" on public.taches
  for update using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());

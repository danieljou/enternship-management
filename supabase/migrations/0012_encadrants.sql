-- Run this once in the Supabase SQL editor, AFTER 0011_profiles_stagiaires_fields.sql.
-- Adds a third role, "encadrant" (supervisor): each stagiaire can be assigned
-- one encadrant, who can view that stagiaire's roadmap progress, review their
-- livrables, and write evaluations for them - all scoped to their own
-- assignees only, never the whole roster (that stays admin-only).

alter type public.app_role add value if not exists 'encadrant';

alter table public.stagiaires
  add column if not exists encadrant_id uuid references public.profiles (id) on delete set null;

create index if not exists stagiaires_encadrant_idx on public.stagiaires (encadrant_id);

-- profiles never had an admin-manage-all policy (only self-read/self-update
-- from earlier migrations) - needed so an admin can set a new encadrant's
-- role/name right after inviting them.
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Helper used by RLS policies below - true if the given stagiaire is
-- assigned to the currently authenticated encadrant.
create or replace function public.is_own_stagiaire(target_stagiaire_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.stagiaires
    where id = target_stagiaire_id and encadrant_id = auth.uid()
  );
$$;

-- Stagiaires ------------------------------------------------------------

drop policy if exists "Encadrants read assigned stagiaires" on public.stagiaires;
create policy "Encadrants read assigned stagiaires" on public.stagiaires
  for select using (encadrant_id = auth.uid());

-- Evaluations -------------------------------------------------------------
-- This table already exists in production but was never captured in a
-- tracked migration - defined here (idempotent) so its schema and RLS are
-- version-controlled going forward.

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stage_sessions (id) on delete cascade,
  stagiaire_id uuid not null references public.stagiaires (id) on delete cascade,
  note integer not null check (note between 0 and 20),
  commentaire text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evaluations_stagiaire_idx on public.evaluations (stagiaire_id);
create index if not exists evaluations_session_idx on public.evaluations (session_id);

alter table public.evaluations enable row level security;

drop policy if exists "Admins manage evaluations" on public.evaluations;
create policy "Admins manage evaluations" on public.evaluations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Stagiaires read own evaluations" on public.evaluations;
create policy "Stagiaires read own evaluations" on public.evaluations
  for select using (
    exists (
      select 1 from public.stagiaires s
      where s.id = evaluations.stagiaire_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Encadrants manage evaluations of their stagiaires" on public.evaluations;
create policy "Encadrants manage evaluations of their stagiaires" on public.evaluations
  for all
  using (public.is_own_stagiaire(stagiaire_id))
  with check (public.is_own_stagiaire(stagiaire_id));

-- Roadmap progress visibility for encadrants -----------------------------
-- Encadrants get read access to their assignees' roadmap instances and
-- progress, and can update livrable review status/comments (validation),
-- mirroring the admin policies but scoped via is_own_stagiaire().

drop policy if exists "Encadrants read assigned roadmap_instances" on public.roadmap_instances;
create policy "Encadrants read assigned roadmap_instances" on public.roadmap_instances
  for select using (public.is_own_stagiaire(stagiaire_id));

drop policy if exists "Encadrants read assigned roadmap_progress" on public.roadmap_progress;
create policy "Encadrants read assigned roadmap_progress" on public.roadmap_progress
  for select using (
    exists (
      select 1 from public.roadmap_instances i
      where i.id = roadmap_progress.instance_id and public.is_own_stagiaire(i.stagiaire_id)
    )
  );

drop policy if exists "Encadrants review assigned livrable_soumissions" on public.roadmap_livrable_soumissions;
create policy "Encadrants review assigned livrable_soumissions" on public.roadmap_livrable_soumissions
  for select using (
    exists (
      select 1 from public.roadmap_progress p
      join public.roadmap_instances i on i.id = p.instance_id
      where p.id = roadmap_livrable_soumissions.progress_id and public.is_own_stagiaire(i.stagiaire_id)
    )
  );

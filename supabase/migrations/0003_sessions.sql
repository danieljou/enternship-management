-- Run this once in the Supabase SQL editor, AFTER 0001_init.sql and 0002_roles.sql.
-- Adds stage sessions, their timeline steps (Kanban columns), stagiaire
-- enrollment, and the per-stagiaire Kanban tasks.

create table if not exists public.stage_sessions (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  date_debut date,
  date_fin date,
  created_at timestamptz not null default now()
);

create table if not exists public.session_etapes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stage_sessions (id) on delete cascade,
  nom text not null,
  description text,
  couleur text not null default 'cyan',
  icone text not null default 'target',
  ordre smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.session_stagiaires (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stage_sessions (id) on delete cascade,
  stagiaire_id uuid not null references public.stagiaires (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, stagiaire_id)
);

create table if not exists public.session_taches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stage_sessions (id) on delete cascade,
  stagiaire_id uuid not null references public.stagiaires (id) on delete cascade,
  etape_id uuid not null references public.session_etapes (id) on delete cascade,
  titre text not null,
  description text,
  ordre smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stage_sessions enable row level security;
alter table public.session_etapes enable row level security;
alter table public.session_stagiaires enable row level security;
alter table public.session_taches enable row level security;

-- Admins manage everything (same pattern as etablissements/filieres/stagiaires).
drop policy if exists "Admins manage stage_sessions" on public.stage_sessions;
create policy "Admins manage stage_sessions" on public.stage_sessions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage session_etapes" on public.session_etapes;
create policy "Admins manage session_etapes" on public.session_etapes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage session_stagiaires" on public.session_stagiaires;
create policy "Admins manage session_stagiaires" on public.session_stagiaires
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage session_taches" on public.session_taches;
create policy "Admins manage session_taches" on public.session_taches
  for all using (public.is_admin()) with check (public.is_admin());

-- Stagiaires can read the sessions/steps/enrollment they're part of, and
-- fully manage their own Kanban tasks (create sub-tasks, move them across
-- steps) — enforced here so no extra authorization logic is needed in code.
drop policy if exists "Stagiaires read own session_stagiaires" on public.session_stagiaires;
create policy "Stagiaires read own session_stagiaires" on public.session_stagiaires
  for select using (
    exists (
      select 1 from public.stagiaires s
      where s.id = session_stagiaires.stagiaire_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read enrolled stage_sessions" on public.stage_sessions;
create policy "Stagiaires read enrolled stage_sessions" on public.stage_sessions
  for select using (
    exists (
      select 1 from public.session_stagiaires ss
      join public.stagiaires s on s.id = ss.stagiaire_id
      where ss.session_id = stage_sessions.id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read enrolled session_etapes" on public.session_etapes;
create policy "Stagiaires read enrolled session_etapes" on public.session_etapes
  for select using (
    exists (
      select 1 from public.session_stagiaires ss
      join public.stagiaires s on s.id = ss.stagiaire_id
      where ss.session_id = session_etapes.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires manage own session_taches" on public.session_taches;
create policy "Stagiaires manage own session_taches" on public.session_taches
  for all using (
    exists (
      select 1 from public.stagiaires s
      where s.id = session_taches.stagiaire_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.stagiaires s
      where s.id = session_taches.stagiaire_id and s.user_id = auth.uid()
    )
  );

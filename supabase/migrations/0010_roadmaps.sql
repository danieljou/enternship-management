-- Run this once in the Supabase SQL editor, AFTER 0009_paiements.sql.
-- Adds the "Roadmap" learning-path feature: admins build roadmap templates
-- (semaines -> etapes, each with cours/exercice/quiz/livrable content),
-- publish them, then assign ("affecter") an instance to a stagiaire who
-- progresses step by step. Quiz grading and livrable review are only ever
-- written by trusted server-side code (service role) after an ownership
-- check, so stagiaires only get read access to their own progress rows -
-- this prevents a stagiaire from self-approving a livrable or a quiz via
-- a direct REST call.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'roadmap_statut') then
    create type public.roadmap_statut as enum ('brouillon', 'publie', 'archive');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'roadmap_livrable_statut') then
    create type public.roadmap_livrable_statut as enum ('non_soumis', 'soumis', 'valide', 'a_corriger');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'roadmap_livrable_mode') then
    create type public.roadmap_livrable_mode as enum ('lien', 'texte');
  end if;
end $$;

-- New notification kinds (see 0008_notifications.sql).
alter type public.notification_type add value if not exists 'roadmap_assignation';
alter type public.notification_type add value if not exists 'roadmap_quiz';
alter type public.notification_type add value if not exists 'roadmap_livrable';

create table if not exists public.roadmap_templates (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  branche text not null,
  niveau text,
  duree_semaines integer not null default 1 check (duree_semaines > 0),
  version text not null default '1.0',
  note text,
  statut public.roadmap_statut not null default 'brouillon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_semaines (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmap_templates (id) on delete cascade,
  numero integer not null,
  titre text not null,
  created_at timestamptz not null default now(),
  unique (roadmap_id, numero)
);

create table if not exists public.roadmap_etapes (
  id uuid primary key default gen_random_uuid(),
  semaine_id uuid not null references public.roadmap_semaines (id) on delete cascade,
  jour integer not null,
  titre text not null,
  objectifs jsonb not null default '[]',
  cours jsonb not null default '{"resume": "", "points_cles": [], "ressources": []}',
  exercice jsonb not null default '{"consigne": "", "criteres_reussite": []}',
  livrable_attendu text not null default '',
  quiz jsonb,
  created_at timestamptz not null default now(),
  unique (semaine_id, jour)
);

create table if not exists public.roadmap_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.roadmap_templates (id) on delete cascade,
  stagiaire_id uuid not null references public.stagiaires (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  version_snapshot text not null,
  date_debut date not null,
  date_fin date not null,
  note_interne text,
  created_at timestamptz not null default now()
);

create index if not exists roadmap_instances_stagiaire_idx on public.roadmap_instances (stagiaire_id);
create index if not exists roadmap_instances_template_idx on public.roadmap_instances (template_id);

create table if not exists public.roadmap_progress (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.roadmap_instances (id) on delete cascade,
  etape_id uuid not null references public.roadmap_etapes (id) on delete cascade,
  quiz_tentatives integer not null default 0,
  quiz_meilleur_score integer,
  quiz_reussi boolean not null default false,
  livrable_statut public.roadmap_livrable_statut not null default 'non_soumis',
  updated_at timestamptz not null default now(),
  unique (instance_id, etape_id)
);

create table if not exists public.roadmap_livrable_soumissions (
  id uuid primary key default gen_random_uuid(),
  progress_id uuid not null references public.roadmap_progress (id) on delete cascade,
  contenu text not null,
  mode public.roadmap_livrable_mode not null,
  statut public.roadmap_livrable_statut not null default 'soumis',
  commentaire text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists roadmap_livrable_soumissions_progress_idx
  on public.roadmap_livrable_soumissions (progress_id, created_at);

-- RLS -----------------------------------------------------------------

alter table public.roadmap_templates enable row level security;
alter table public.roadmap_semaines enable row level security;
alter table public.roadmap_etapes enable row level security;
alter table public.roadmap_instances enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.roadmap_livrable_soumissions enable row level security;

drop policy if exists "Admins manage roadmap_templates" on public.roadmap_templates;
create policy "Admins manage roadmap_templates" on public.roadmap_templates
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage roadmap_semaines" on public.roadmap_semaines;
create policy "Admins manage roadmap_semaines" on public.roadmap_semaines
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage roadmap_etapes" on public.roadmap_etapes;
create policy "Admins manage roadmap_etapes" on public.roadmap_etapes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage roadmap_instances" on public.roadmap_instances;
create policy "Admins manage roadmap_instances" on public.roadmap_instances
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage roadmap_progress" on public.roadmap_progress;
create policy "Admins manage roadmap_progress" on public.roadmap_progress
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage roadmap_livrable_soumissions" on public.roadmap_livrable_soumissions;
create policy "Admins manage roadmap_livrable_soumissions" on public.roadmap_livrable_soumissions
  for all using (public.is_admin()) with check (public.is_admin());

-- Stagiaires read the templates/semaines/etapes of any roadmap they have
-- an instance for, regardless of the template's current status (an
-- archived template must stay readable to a stagiaire already on it).
drop policy if exists "Stagiaires read assigned roadmap_templates" on public.roadmap_templates;
create policy "Stagiaires read assigned roadmap_templates" on public.roadmap_templates
  for select using (
    exists (
      select 1 from public.roadmap_instances i
      join public.stagiaires s on s.id = i.stagiaire_id
      where i.template_id = roadmap_templates.id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read assigned roadmap_semaines" on public.roadmap_semaines;
create policy "Stagiaires read assigned roadmap_semaines" on public.roadmap_semaines
  for select using (
    exists (
      select 1 from public.roadmap_instances i
      join public.stagiaires s on s.id = i.stagiaire_id
      where i.template_id = roadmap_semaines.roadmap_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read assigned roadmap_etapes" on public.roadmap_etapes;
create policy "Stagiaires read assigned roadmap_etapes" on public.roadmap_etapes
  for select using (
    exists (
      select 1 from public.roadmap_semaines sem
      join public.roadmap_instances i on i.template_id = sem.roadmap_id
      join public.stagiaires s on s.id = i.stagiaire_id
      where sem.id = roadmap_etapes.semaine_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read own roadmap_instances" on public.roadmap_instances;
create policy "Stagiaires read own roadmap_instances" on public.roadmap_instances
  for select using (
    exists (
      select 1 from public.stagiaires s
      where s.id = roadmap_instances.stagiaire_id and s.user_id = auth.uid()
    )
  );

-- Progress and livrable submissions are only ever written by server
-- actions using the service-role client (after verifying the acting
-- stagiaire owns the instance) - stagiaires only get read access here.
drop policy if exists "Stagiaires read own roadmap_progress" on public.roadmap_progress;
create policy "Stagiaires read own roadmap_progress" on public.roadmap_progress
  for select using (
    exists (
      select 1 from public.roadmap_instances i
      join public.stagiaires s on s.id = i.stagiaire_id
      where i.id = roadmap_progress.instance_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Stagiaires read own roadmap_livrable_soumissions" on public.roadmap_livrable_soumissions;
create policy "Stagiaires read own roadmap_livrable_soumissions" on public.roadmap_livrable_soumissions
  for select using (
    exists (
      select 1 from public.roadmap_progress p
      join public.roadmap_instances i on i.id = p.instance_id
      join public.stagiaires s on s.id = i.stagiaire_id
      where p.id = roadmap_livrable_soumissions.progress_id and s.user_id = auth.uid()
    )
  );

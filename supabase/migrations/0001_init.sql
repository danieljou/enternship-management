-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Schema for établissements, filières and stagiaires, with row-level security.

create table if not exists public.etablissements (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.filieres (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'stagiaire_section') then
    create type public.stagiaire_section as enum ('francophone', 'anglophone');
  end if;
end $$;

create table if not exists public.stagiaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  nom text not null,
  prenom text not null,
  email text not null unique,
  niveau smallint not null check (niveau between 1 and 5),
  etablissement_id uuid references public.etablissements (id) on delete set null,
  filiere_id uuid references public.filieres (id) on delete set null,
  section public.stagiaire_section not null,
  created_at timestamptz not null default now()
);

alter table public.etablissements enable row level security;
alter table public.filieres enable row level security;
alter table public.stagiaires enable row level security;

-- Every authenticated user is FUTURIX-iTech staff for now (no stagiaire-facing
-- portal yet). Tighten this with a proper roles table once one exists.
drop policy if exists "Authenticated users manage etablissements" on public.etablissements;
create policy "Authenticated users manage etablissements" on public.etablissements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users manage filieres" on public.filieres;
create policy "Authenticated users manage filieres" on public.filieres
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users manage stagiaires" on public.stagiaires;
create policy "Authenticated users manage stagiaires" on public.stagiaires
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Run this once in the Supabase SQL editor, AFTER 0001_init.sql.
-- Adds an application-level role (admin vs stagiaire) on top of Supabase Auth,
-- and tightens etablissements/filieres/stagiaires RLS to admins only.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'stagiaire');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'stagiaire',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Backfill profiles for accounts created before this migration (e.g. the
-- admin account you already signed up with).
insert into public.profiles (id, role)
select id, 'stagiaire' from auth.users
on conflict (id) do nothing;

-- Auto-create a profile (defaulting to 'stagiaire') for every new Auth user,
-- whether they sign up, get invited, or are created via the admin API.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'stagiaire')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by the RLS policies below. security definer so it can read
-- profiles regardless of the caller's own RLS visibility into that table.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Tighten access: only admins manage établissements/filières/stagiaires.
drop policy if exists "Authenticated users manage etablissements" on public.etablissements;
create policy "Admins manage etablissements" on public.etablissements
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated users manage filieres" on public.filieres;
create policy "Admins manage filieres" on public.filieres
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated users manage stagiaires" on public.stagiaires;
create policy "Admins manage stagiaires" on public.stagiaires
  for all using (public.is_admin()) with check (public.is_admin());

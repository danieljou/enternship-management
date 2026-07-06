-- Run this once in the Supabase SQL editor, AFTER 0010_roadmaps.sql.
-- The profile pages (src/app/dashboard/profil, src/app/espace-stagiaire/profil)
-- were already built against columns and self-update policies that never
-- existed in the database - this migration adds them.

alter table public.profiles
  add column if not exists nom text,
  add column if not exists prenom text;

alter table public.stagiaires
  add column if not exists telephone text,
  add column if not exists adresse text;

-- Self-service update of one's own profile/stagiaire row -----------------

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Stagiaires update own stagiaire row" on public.stagiaires;
create policy "Stagiaires update own stagiaire row" on public.stagiaires
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- The two self-update policies above are scoped to the caller's own row,
-- but RLS cannot restrict which columns an UPDATE touches - a self-update
-- policy would otherwise let a user promote their own role, or a stagiaire
-- reassign their own etablissement/filiere/section/user_id via a direct
-- REST call. These triggers reset those fields to their previous value
-- whenever the acting user isn't an admin, regardless of entry point.

create or replace function public.prevent_profile_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_self_change on public.profiles;
create trigger profiles_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_change();

create or replace function public.prevent_stagiaire_admin_fields_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.etablissement_id := old.etablissement_id;
    new.filiere_id := old.filiere_id;
    new.section := old.section;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists stagiaires_prevent_admin_fields_self_change on public.stagiaires;
create trigger stagiaires_prevent_admin_fields_self_change
  before update on public.stagiaires
  for each row execute function public.prevent_stagiaire_admin_fields_self_change();

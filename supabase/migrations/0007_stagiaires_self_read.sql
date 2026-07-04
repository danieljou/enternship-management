-- Run this once in the Supabase SQL editor, AFTER 0006_stagiaires_user_id_unique.sql.
-- public.stagiaires only had an admin-only policy ("Admins manage stagiaires"
-- from 0002_roles.sql) - a stagiaire could never read their own row, which
-- every stagiaire-facing page relies on to find "my" stagiaire id.

drop policy if exists "Stagiaires read own stagiaire row" on public.stagiaires;
create policy "Stagiaires read own stagiaire row" on public.stagiaires
  for select using (user_id = auth.uid());

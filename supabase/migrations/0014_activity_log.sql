-- Run this once in the Supabase SQL editor, AFTER 0013_taches.sql.
-- Lightweight audit trail for the admin dashboard's "Activité récente" widget.
-- Written only by trusted server code (service role) via lib/activity-log.ts,
-- so actor_nom/actor_prenom are captured at write time rather than joined.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_nom text,
  actor_prenom text,
  action_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "Admins read activity_log" on public.activity_log;
create policy "Admins read activity_log" on public.activity_log
  for select using (public.is_admin());

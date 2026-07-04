-- Run this once in the Supabase SQL editor, AFTER 0004_evaluations_documents.sql.
-- Adds a real-time chat: a single "general" channel visible to everyone, and
-- one private "inbox" channel per stagiaire shared with every admin.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'chat_channel_type') then
    create type public.chat_channel_type as enum ('general', 'inbox');
  end if;
end $$;

create table if not exists public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  type public.chat_channel_type not null,
  stagiaire_id uuid references public.stagiaires (id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists chat_channels_general_unique
  on public.chat_channels ((type)) where type = 'general';
create unique index if not exists chat_channels_stagiaire_inbox_unique
  on public.chat_channels (stagiaire_id) where type = 'inbox';

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.chat_channels (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  sender_role public.app_role not null,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_channel_created_idx
  on public.chat_messages (channel_id, created_at);

alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;

-- Helper used by RLS below. security definer so it can read chat_channels /
-- stagiaires regardless of the caller's own RLS visibility into those tables.
create or replace function public.stagiaire_can_access_channel(chan_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.chat_channels c
    left join public.stagiaires s on s.id = c.stagiaire_id
    where c.id = chan_id
      and (c.type = 'general' or (c.type = 'inbox' and s.user_id = auth.uid()))
  );
$$;

drop policy if exists "Admins manage chat_channels" on public.chat_channels;
create policy "Admins manage chat_channels" on public.chat_channels
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Members read their chat_channels" on public.chat_channels;
create policy "Members read their chat_channels" on public.chat_channels
  for select using (public.stagiaire_can_access_channel(id));

drop policy if exists "Admins manage chat_messages" on public.chat_messages;
create policy "Admins manage chat_messages" on public.chat_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Members read channel chat_messages" on public.chat_messages;
create policy "Members read channel chat_messages" on public.chat_messages
  for select using (public.stagiaire_can_access_channel(channel_id));

drop policy if exists "Members send channel chat_messages" on public.chat_messages;
create policy "Members send channel chat_messages" on public.chat_messages
  for insert with check (
    sender_id = auth.uid() and public.stagiaire_can_access_channel(channel_id)
  );

-- Auto-create a private inbox channel for every new stagiaire.
create or replace function public.handle_new_stagiaire_inbox()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chat_channels (type, stagiaire_id)
  values ('inbox', new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_stagiaire_created on public.stagiaires;
create trigger on_stagiaire_created
  after insert on public.stagiaires
  for each row execute function public.handle_new_stagiaire_inbox();

-- Backfill: inbox channels for stagiaires created before this migration, and
-- the single general channel.
insert into public.chat_channels (type, stagiaire_id)
select 'inbox', id from public.stagiaires
on conflict do nothing;

insert into public.chat_channels (type, stagiaire_id)
select 'general', null
where not exists (select 1 from public.chat_channels where type = 'general');

-- Enable Realtime (postgres_changes) on chat_messages.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

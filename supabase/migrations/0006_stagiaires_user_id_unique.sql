-- Run this once in the Supabase SQL editor, AFTER 0005_chat.sql.
-- A stagiaire row must map to at most one auth account. Without this
-- constraint, two stagiaires rows could silently share the same user_id,
-- which breaks every "find my stagiaire row" lookup (.single()/.maybeSingle()
-- return an ambiguous-rows error instead of the expected row).

alter table public.stagiaires
  add constraint stagiaires_user_id_key unique (user_id);

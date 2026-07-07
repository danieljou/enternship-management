"use server";

import { createClient } from "@/lib/supabase/server";

export interface GlobalSearchResults {
  stagiaires: { id: string; nom: string; prenom: string; email: string }[];
  sessions: { id: string; nom: string }[];
  roadmaps: { id: string; titre: string }[];
}

const EMPTY_RESULTS: GlobalSearchResults = { stagiaires: [], sessions: [], roadmaps: [] };

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return EMPTY_RESULTS;

  const supabase = await createClient();
  const pattern = `%${trimmed.replace(/[%_]/g, "\\$&")}%`;

  const [{ data: stagiaires }, { data: sessions }, { data: roadmaps }] = await Promise.all([
    supabase
      .from("stagiaires")
      .select("id, nom, prenom, email")
      .or(`nom.ilike.${pattern},prenom.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),
    supabase.from("stage_sessions").select("id, nom").ilike("nom", pattern).limit(5),
    supabase.from("roadmap_templates").select("id, titre").ilike("titre", pattern).limit(5),
  ]);

  return {
    stagiaires: stagiaires ?? [],
    sessions: sessions ?? [],
    roadmaps: roadmaps ?? [],
  };
}

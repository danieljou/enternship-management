import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { TacheWithRelations } from "@/lib/types";

import { getAssignableUsers } from "./actions";
import { TachesManager } from "./taches-manager";

export const metadata: Metadata = {
  title: "Tâches - FUTURIX-iTech",
};

export default async function TachesPage() {
  const supabase = await createClient();

  const [{ data: taches }, { data: stagiaires }, assignableUsers] = await Promise.all([
    supabase
      .from("taches")
      .select("*, stagiaire:stagiaires(id, nom, prenom), assignee:profiles!taches_assigned_to_fkey(id, nom, prenom)")
      .order("created_at", { ascending: false }),
    supabase.from("stagiaires").select("id, nom, prenom").order("nom", { ascending: true }),
    getAssignableUsers(),
  ]);

  return (
    <TachesManager
      data={(taches as TacheWithRelations[] | null) ?? []}
      stagiaires={stagiaires ?? []}
      assignableUsers={assignableUsers}
    />
  );
}

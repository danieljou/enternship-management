import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ActivityActionType =
  | "stagiaire_created"
  | "encadrant_created"
  | "roadmap_assigned"
  | "tache_created"
  | "paiement_recorded";

interface LogActivityInput {
  actorId: string | null | undefined;
  actionType: ActivityActionType;
  description: string;
}

export async function logActivity({ actorId, actionType, description }: LogActivityInput) {
  const admin = createAdminClient();

  let actorNom: string | null = null;
  let actorPrenom: string | null = null;

  if (actorId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("nom, prenom")
      .eq("id", actorId)
      .maybeSingle();
    actorNom = profile?.nom ?? null;
    actorPrenom = profile?.prenom ?? null;
  }

  await admin.from("activity_log").insert({
    actor_id: actorId ?? null,
    actor_nom: actorNom,
    actor_prenom: actorPrenom,
    action_type: actionType,
    description,
  });
}

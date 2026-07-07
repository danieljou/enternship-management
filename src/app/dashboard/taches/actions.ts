"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { tacheSchema, type TacheValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

function toRow(values: TacheValues) {
  return {
    titre: values.titre,
    description: values.description || null,
    statut: values.statut,
    priorite: values.priorite,
    echeance: values.echeance || null,
    stagiaire_id: values.stagiaireId || null,
    assigned_to: values.assignedTo || null,
  };
}

export async function createTache(values: TacheValues): Promise<ActionResult> {
  const parsed = tacheSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "taches.create_error" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("taches").insert({
    ...toRow(parsed.data),
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: "taches.create_error" };
  }

  await logActivity({
    actorId: user?.id,
    actionType: "tache_created",
    description: `Tâche créée : ${parsed.data.titre}`,
  });

  revalidatePath("/dashboard/taches");
  return { success: true };
}

export async function updateTache(id: string, values: TacheValues): Promise<ActionResult> {
  const parsed = tacheSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "taches.update_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("taches")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: "taches.update_error" };
  }

  revalidatePath("/dashboard/taches");
  return { success: true };
}

export async function updateTacheStatut(id: string, statut: TacheValues["statut"]): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("taches")
    .update({ statut, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: "taches.update_error" };
  }

  revalidatePath("/dashboard/taches");
  return { success: true };
}

export async function deleteTache(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("taches").delete().eq("id", id);

  if (error) {
    return { error: "taches.delete_error" };
  }

  revalidatePath("/dashboard/taches");
  return { success: true };
}

export interface AssignableUser {
  userId: string;
  nom: string;
  prenom: string;
}

/** Admins and encadrants can be assigned a task - only admins manage the list itself. */
export async function getAssignableUsers(): Promise<AssignableUser[]> {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nom, prenom")
    .in("role", ["admin", "encadrant"]);

  return (profiles ?? [])
    .map((profile) => ({
      userId: profile.id,
      nom: profile.nom ?? "",
      prenom: profile.prenom ?? "",
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom));
}

"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity-log";
import { createNotifications } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapStatut } from "@/lib/types";

import {
  bulkAssignRoadmapSchema,
  etapeSchema,
  livrableReviewSchema,
  roadmapTemplateSchema,
  semaineSchema,
  type BulkAssignRoadmapValues,
  type EtapeValues,
  type LivrableReviewValues,
  type RoadmapTemplateValues,
  type SemaineValues,
} from "./schema";

export type ActionResult = { error: string } | { success: true };

/** reviewLivrable is reachable from both the admin validation queue and the
 * encadrant portal, both of which call it with a service-role client that
 * bypasses RLS - this replaces that missing row-level check by hand. */
async function assertCanReviewInstance(instanceId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "admin") return true;
  if (profile?.role !== "encadrant") return false;

  const { data: instance } = await admin
    .from("roadmap_instances")
    .select("stagiaire:stagiaires(encadrant_id)")
    .eq("id", instanceId)
    .single();

  const stagiaire = instance?.stagiaire as unknown as { encadrant_id: string | null } | null;
  return stagiaire?.encadrant_id === user.id;
}

function toTemplateRow(values: RoadmapTemplateValues) {
  return {
    titre: values.titre,
    branche: values.branche,
    niveau: values.niveau || null,
    duree_semaines: Number(values.dureeSemaines),
    version: values.version,
    note: values.note || null,
  };
}

export async function createRoadmapTemplate(
  values: RoadmapTemplateValues,
): Promise<ActionResult & { id?: string }> {
  const parsed = roadmapTemplateSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.create_error" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmap_templates")
    .insert(toTemplateRow(parsed.data))
    .select("id")
    .single();

  if (error || !data) return { error: "roadmaps.create_error" };

  revalidatePath("/dashboard/roadmaps");
  return { success: true, id: data.id };
}

export async function updateRoadmapTemplate(
  id: string,
  values: RoadmapTemplateValues,
): Promise<ActionResult> {
  const parsed = roadmapTemplateSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.update_error" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("roadmap_templates")
    .update({ ...toTemplateRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "roadmaps.update_error" };

  revalidatePath("/dashboard/roadmaps");
  revalidatePath(`/dashboard/roadmaps/${id}`);
  return { success: true };
}

export async function deleteRoadmapTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("roadmap_templates").delete().eq("id", id);
  if (error) return { error: "roadmaps.delete_error" };

  revalidatePath("/dashboard/roadmaps");
  return { success: true };
}

export async function setRoadmapStatus(id: string, statut: RoadmapStatut): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("roadmap_templates")
    .update({ statut, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "roadmaps.status_error" };

  revalidatePath("/dashboard/roadmaps");
  revalidatePath(`/dashboard/roadmaps/${id}`);
  return { success: true };
}

export async function createSemaine(roadmapId: string, values: SemaineValues): Promise<ActionResult> {
  const parsed = semaineSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.semaine_create_error" };

  const supabase = await createClient();
  const { count } = await supabase
    .from("roadmap_semaines")
    .select("id", { count: "exact", head: true })
    .eq("roadmap_id", roadmapId);

  const { error } = await supabase.from("roadmap_semaines").insert({
    roadmap_id: roadmapId,
    numero: (count ?? 0) + 1,
    titre: parsed.data.titre,
  });

  if (error) return { error: "roadmaps.semaine_create_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

export async function updateSemaine(
  id: string,
  roadmapId: string,
  values: SemaineValues,
): Promise<ActionResult> {
  const parsed = semaineSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.semaine_update_error" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("roadmap_semaines")
    .update({ titre: parsed.data.titre })
    .eq("id", id);

  if (error) return { error: "roadmaps.semaine_update_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

export async function deleteSemaine(id: string, roadmapId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("roadmap_semaines").delete().eq("id", id);
  if (error) return { error: "roadmaps.semaine_delete_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

function toEtapeRow(values: EtapeValues) {
  return {
    titre: values.titre,
    objectifs: values.objectifs,
    cours: values.cours,
    exercice: values.exercice,
    livrable_attendu: values.livrable_attendu,
    quiz: values.quiz,
  };
}

export async function createEtape(
  semaineId: string,
  roadmapId: string,
  values: EtapeValues,
): Promise<ActionResult> {
  const parsed = etapeSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.etape_create_error" };

  const supabase = await createClient();
  const { count } = await supabase
    .from("roadmap_etapes")
    .select("id", { count: "exact", head: true })
    .eq("semaine_id", semaineId);

  const { error } = await supabase.from("roadmap_etapes").insert({
    semaine_id: semaineId,
    jour: (count ?? 0) + 1,
    ...toEtapeRow(parsed.data),
  });

  if (error) return { error: "roadmaps.etape_create_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

export async function updateEtape(
  id: string,
  roadmapId: string,
  values: EtapeValues,
): Promise<ActionResult> {
  const parsed = etapeSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.etape_update_error" };

  const supabase = await createClient();
  const { error } = await supabase.from("roadmap_etapes").update(toEtapeRow(parsed.data)).eq("id", id);

  if (error) return { error: "roadmaps.etape_update_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

export async function deleteEtape(id: string, roadmapId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("roadmap_etapes").delete().eq("id", id);
  if (error) return { error: "roadmaps.etape_delete_error" };

  revalidatePath(`/dashboard/roadmaps/${roadmapId}`);
  return { success: true };
}

export async function bulkAssignRoadmap(
  templateId: string,
  stagiaireIds: string[],
  values: BulkAssignRoadmapValues,
): Promise<ActionResult> {
  const parsed = bulkAssignRoadmapSchema.safeParse(values);
  if (!parsed.success || stagiaireIds.length === 0) return { error: "roadmaps.assign_error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: template } = await supabase
    .from("roadmap_templates")
    .select("version")
    .eq("id", templateId)
    .single();

  // Skip stagiaires already assigned to this template rather than failing the whole batch.
  const { data: existing } = await supabase
    .from("roadmap_instances")
    .select("stagiaire_id")
    .eq("template_id", templateId)
    .in("stagiaire_id", stagiaireIds);
  const alreadyAssigned = new Set((existing ?? []).map((row) => row.stagiaire_id));
  const targetIds = stagiaireIds.filter((id) => !alreadyAssigned.has(id));

  if (targetIds.length === 0) return { error: "roadmaps.assign_error" };

  const { error } = await supabase.from("roadmap_instances").insert(
    targetIds.map((stagiaireId) => ({
      template_id: templateId,
      stagiaire_id: stagiaireId,
      assigned_by: user?.id ?? null,
      version_snapshot: template?.version ?? "1.0",
      date_debut: parsed.data.dateDebut,
      date_fin: parsed.data.dateFin,
    })),
  );

  if (error) return { error: "roadmaps.assign_error" };

  const { data: stagiaires } = await supabase.from("stagiaires").select("user_id").in("id", targetIds);

  await createNotifications({
    userIds: (stagiaires ?? []).map((row) => row.user_id),
    type: "roadmap_assignation",
    title: "Nouvelle roadmap assignée",
    body: "Une nouvelle roadmap vous a été assignée.",
    link: "/espace-stagiaire/roadmap",
  });

  await logActivity({
    actorId: user?.id,
    actionType: "roadmap_assigned",
    description:
      targetIds.length === 1
        ? "Une roadmap a été affectée à un stagiaire"
        : `Une roadmap a été affectée à ${targetIds.length} stagiaires`,
  });

  revalidatePath(`/dashboard/roadmaps/${templateId}`);
  revalidatePath("/espace-stagiaire/roadmap");
  return { success: true };
}

export async function deleteInstance(id: string, templateId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("roadmap_instances").delete().eq("id", id);
  if (error) return { error: "roadmaps.instance_delete_error" };

  revalidatePath(`/dashboard/roadmaps/${templateId}`);
  revalidatePath("/espace-stagiaire/roadmap");
  return { success: true };
}

export async function reviewLivrable(
  progressId: string,
  instanceId: string,
  values: LivrableReviewValues,
): Promise<ActionResult> {
  const parsed = livrableReviewSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.livrable_review_error" };

  if (!(await assertCanReviewInstance(instanceId))) {
    return { error: "roadmaps.livrable_review_error" };
  }

  const admin = createAdminClient();

  const { data: lastSoumission } = await admin
    .from("roadmap_livrable_soumissions")
    .select("id")
    .eq("progress_id", progressId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastSoumission) {
    await admin
      .from("roadmap_livrable_soumissions")
      .update({ statut: parsed.data.decision, commentaire: parsed.data.commentaire ?? "" })
      .eq("id", lastSoumission.id);
  }

  const { error } = await admin
    .from("roadmap_progress")
    .update({ livrable_statut: parsed.data.decision, updated_at: new Date().toISOString() })
    .eq("id", progressId);

  if (error) return { error: "roadmaps.livrable_review_error" };

  const { data: instance } = await admin
    .from("roadmap_instances")
    .select("stagiaire_id")
    .eq("id", instanceId)
    .single();

  const { data: stagiaire } = instance
    ? await admin.from("stagiaires").select("user_id").eq("id", instance.stagiaire_id).single()
    : { data: null };

  await createNotifications({
    userIds: [stagiaire?.user_id],
    type: "roadmap_livrable",
    title: parsed.data.decision === "valide" ? "Livrable validé" : "Livrable à corriger",
    body:
      parsed.data.decision === "valide" ? "Votre livrable a été validé." : "Votre livrable est à corriger.",
    link: "/espace-stagiaire/roadmap",
  });

  revalidatePath("/dashboard/roadmaps/validation");
  revalidatePath("/espace-stagiaire/roadmap");
  return { success: true };
}

export async function unlockEtape(progressId: string): Promise<ActionResult> {
  const admin = createAdminClient();

  const { data: progress } = await admin
    .from("roadmap_progress")
    .select("instance_id")
    .eq("id", progressId)
    .single();

  if (!progress || !(await assertCanReviewInstance(progress.instance_id))) {
    return { error: "roadmaps.unlock_error" };
  }

  const { error } = await admin
    .from("roadmap_progress")
    .update({ quiz_tentatives: 0, updated_at: new Date().toISOString() })
    .eq("id", progressId);

  if (error) return { error: "roadmaps.unlock_error" };

  revalidatePath("/dashboard/roadmaps/validation");
  revalidatePath("/espace-stagiaire/roadmap");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { createNotifications, getAdminUserIds } from "@/lib/notifications";
import { gradeQuiz } from "@/lib/roadmap-logic";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapQuiz } from "@/lib/types";

import { livrableSubmitSchema, type LivrableSubmitValues } from "./schema";

export type ActionResult = { error: string } | { success: true };
export type QuizSubmitResult =
  | { error: string }
  | {
      success: true;
      score: number;
      reussi: boolean;
      corrections: { correct: boolean; reponseAttendue: string }[] | null;
    };

async function ensureOwnInstance(instanceId: string) {
  const supabase = await createClient();
  // RLS already restricts this select to the caller's own instance.
  const { data: instance } = await supabase
    .from("roadmap_instances")
    .select("id, stagiaire_id")
    .eq("id", instanceId)
    .single();

  return instance;
}

export async function submitQuizAttempt(
  instanceId: string,
  etapeId: string,
  answers: unknown[],
): Promise<QuizSubmitResult> {
  const instance = await ensureOwnInstance(instanceId);
  if (!instance) return { error: "roadmaps.not_authorized" };

  const supabase = await createClient();
  const { data: etape } = await supabase
    .from("roadmap_etapes")
    .select("quiz")
    .eq("id", etapeId)
    .single();

  const quiz = etape?.quiz as RoadmapQuiz | null | undefined;
  if (!quiz) return { error: "roadmaps.quiz_missing" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("roadmap_progress")
    .select("*")
    .eq("instance_id", instanceId)
    .eq("etape_id", etapeId)
    .maybeSingle();

  if (existing && existing.quiz_tentatives >= quiz.tentatives_max && !existing.quiz_reussi) {
    return { error: "roadmaps.quiz_no_attempts_left" };
  }

  const result = gradeQuiz(quiz, answers);
  const nextTentatives = (existing?.quiz_tentatives ?? 0) + 1;
  const nextMeilleurScore = Math.max(existing?.quiz_meilleur_score ?? 0, result.score);
  const nextReussi = Boolean(existing?.quiz_reussi) || result.reussi;

  if (existing) {
    await admin
      .from("roadmap_progress")
      .update({
        quiz_tentatives: nextTentatives,
        quiz_meilleur_score: nextMeilleurScore,
        quiz_reussi: nextReussi,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin.from("roadmap_progress").insert({
      instance_id: instanceId,
      etape_id: etapeId,
      quiz_tentatives: nextTentatives,
      quiz_meilleur_score: nextMeilleurScore,
      quiz_reussi: nextReussi,
    });
  }

  const [adminIds, { data: stagiaire }] = await Promise.all([
    getAdminUserIds(),
    admin.from("stagiaires").select("nom, prenom").eq("id", instance.stagiaire_id).single(),
  ]);

  await createNotifications({
    userIds: adminIds,
    type: "roadmap_quiz",
    title: result.reussi ? "Quiz réussi" : "Quiz échoué",
    body: `${stagiaire?.prenom ?? ""} ${stagiaire?.nom ?? ""} — ${result.score}%`.trim(),
    link: "/dashboard/roadmaps/validation",
  });

  revalidatePath(`/espace-stagiaire/roadmap/${instanceId}`);
  revalidatePath(`/espace-stagiaire/roadmap/${instanceId}/etape/${etapeId}`);

  return {
    success: true,
    score: result.score,
    reussi: result.reussi,
    corrections: quiz.afficher_corrige ? result.corrections : null,
  };
}

export async function submitLivrable(
  instanceId: string,
  etapeId: string,
  values: LivrableSubmitValues,
): Promise<ActionResult> {
  const parsed = livrableSubmitSchema.safeParse(values);
  if (!parsed.success) return { error: "roadmaps.livrable_submit_error" };

  const instance = await ensureOwnInstance(instanceId);
  if (!instance) return { error: "roadmaps.not_authorized" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("roadmap_progress")
    .select("id, livrable_statut")
    .eq("instance_id", instanceId)
    .eq("etape_id", etapeId)
    .maybeSingle();

  if (existing && existing.livrable_statut !== "non_soumis" && existing.livrable_statut !== "a_corriger") {
    return { error: "roadmaps.livrable_already_submitted" };
  }

  let progressId = existing?.id;
  if (!progressId) {
    const { data: created, error } = await admin
      .from("roadmap_progress")
      .insert({ instance_id: instanceId, etape_id: etapeId, livrable_statut: "soumis" })
      .select("id")
      .single();
    if (error || !created) return { error: "roadmaps.livrable_submit_error" };
    progressId = created.id;
  } else {
    await admin
      .from("roadmap_progress")
      .update({ livrable_statut: "soumis", updated_at: new Date().toISOString() })
      .eq("id", progressId);
  }

  const { error } = await admin.from("roadmap_livrable_soumissions").insert({
    progress_id: progressId,
    contenu: parsed.data.contenu,
    mode: parsed.data.mode,
    statut: "soumis",
  });

  if (error) return { error: "roadmaps.livrable_submit_error" };

  const [adminIds, { data: stagiaire }] = await Promise.all([
    getAdminUserIds(),
    admin.from("stagiaires").select("nom, prenom").eq("id", instance.stagiaire_id).single(),
  ]);

  await createNotifications({
    userIds: adminIds,
    type: "roadmap_livrable",
    title: "Livrable soumis",
    body: `${stagiaire?.prenom ?? ""} ${stagiaire?.nom ?? ""} a soumis un livrable.`.trim(),
    link: "/dashboard/roadmaps/validation",
  });

  revalidatePath(`/espace-stagiaire/roadmap/${instanceId}`);
  revalidatePath(`/espace-stagiaire/roadmap/${instanceId}/etape/${etapeId}`);
  revalidatePath("/dashboard/roadmaps/validation");
  return { success: true };
}

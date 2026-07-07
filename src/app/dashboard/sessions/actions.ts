"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity-log";
import { createNotifications } from "@/lib/notifications";
import { formatMontant } from "@/lib/payment-status";
import { createClient } from "@/lib/supabase/server";
import type { SessionEtape } from "@/lib/types";

import {
  documentSchema,
  etapeSchema,
  evaluationSchema,
  paiementSchema,
  sessionSchema,
  type DocumentValues,
  type EtapeValues,
  type EvaluationValues,
  type PaiementValues,
  type SessionValues,
} from "./schema";

export type ActionResult = { error: string } | { success: true };

function toSessionRow(values: SessionValues) {
  return {
    nom: values.nom,
    description: values.description || null,
    date_debut: values.dateDebut || null,
    date_fin: values.dateFin || null,
    frais_montant: values.fraisMontant ? Number(values.fraisMontant) : null,
  };
}

export async function createSession(
  values: SessionValues,
): Promise<ActionResult> {
  const parsed = sessionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.create_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stage_sessions")
    .insert(toSessionRow(parsed.data));
  if (error) {
    return { error: "sessions.create_error" };
  }

  revalidatePath("/dashboard/sessions");
  return { success: true };
}

export async function updateSession(
  id: string,
  values: SessionValues,
): Promise<ActionResult> {
  const parsed = sessionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.update_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stage_sessions")
    .update(toSessionRow(parsed.data))
    .eq("id", id);
  if (error) {
    return { error: "sessions.update_error" };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${id}`);
  return { success: true };
}

export async function deleteSession(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("stage_sessions").delete().eq("id", id);
  if (error) {
    return { error: "sessions.delete_error" };
  }

  revalidatePath("/dashboard/sessions");
  return { success: true };
}

export async function createEtape(
  sessionId: string,
  values: EtapeValues,
): Promise<ActionResult> {
  const parsed = etapeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.etape_create_error" };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("session_etapes")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const { error } = await supabase.from("session_etapes").insert({
    session_id: sessionId,
    nom: parsed.data.nom,
    description: parsed.data.description || null,
    couleur: parsed.data.couleur,
    icone: parsed.data.icone,
    ordre: count ?? 0,
  });

  if (error) {
    return { error: "sessions.etape_create_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function updateEtape(
  id: string,
  sessionId: string,
  values: EtapeValues,
): Promise<ActionResult> {
  const parsed = etapeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.etape_update_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("session_etapes")
    .update({
      nom: parsed.data.nom,
      description: parsed.data.description || null,
      couleur: parsed.data.couleur,
      icone: parsed.data.icone,
    })
    .eq("id", id);

  if (error) {
    return { error: "sessions.etape_update_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function deleteEtape(
  id: string,
  sessionId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("session_etapes").delete().eq("id", id);
  if (error) {
    return { error: "sessions.etape_delete_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function moveEtape(
  sessionId: string,
  etapeId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("session_etapes")
    .select("*")
    .eq("session_id", sessionId)
    .order("ordre", { ascending: true });

  const etapes = (data as SessionEtape[] | null) ?? [];
  const index = etapes.findIndex((e) => e.id === etapeId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= etapes.length) {
    return { success: true };
  }

  const current = etapes[index];
  const target = etapes[targetIndex];

  const [{ error: error1 }, { error: error2 }] = await Promise.all([
    supabase
      .from("session_etapes")
      .update({ ordre: target.ordre })
      .eq("id", current.id),
    supabase
      .from("session_etapes")
      .update({ ordre: current.ordre })
      .eq("id", target.id),
  ]);

  if (error1 || error2) {
    return { error: "sessions.etape_reorder_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function reorderEtapes(
  sessionId: string,
  orderedEtapeIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedEtapeIds.map((id, index) =>
      supabase.from("session_etapes").update({ ordre: index }).eq("id", id),
    ),
  );

  if (results.some((result) => result.error)) {
    return { error: "sessions.etape_reorder_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function enrollStagiaires(
  sessionId: string,
  stagiaireIds: string[],
): Promise<ActionResult> {
  if (stagiaireIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("session_stagiaires")
    .insert(
      stagiaireIds.map((stagiaireId) => ({
        session_id: sessionId,
        stagiaire_id: stagiaireId,
      })),
    );

  if (error) {
    return { error: "sessions.enroll_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function unenrollStagiaire(
  sessionId: string,
  stagiaireId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("session_stagiaires")
    .delete()
    .eq("session_id", sessionId)
    .eq("stagiaire_id", stagiaireId);

  if (error) {
    return { error: "sessions.unenroll_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { success: true };
}

export async function createEvaluation(
  sessionId: string,
  stagiaireId: string,
  values: EvaluationValues,
): Promise<ActionResult> {
  const parsed = evaluationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.evaluation_create_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("evaluations").insert({
    session_id: sessionId,
    stagiaire_id: stagiaireId,
    note: Number(parsed.data.note),
    commentaire: parsed.data.commentaire || null,
  });

  if (error) {
    return { error: "sessions.evaluation_create_error" };
  }

  const [{ data: stagiaire }, { data: session }] = await Promise.all([
    supabase
      .from("stagiaires")
      .select("user_id")
      .eq("id", stagiaireId)
      .single(),
    supabase.from("stage_sessions").select("nom").eq("id", sessionId).single(),
  ]);

  await createNotifications({
    userIds: [stagiaire?.user_id],
    type: "evaluation",
    title: "Nouvelle évaluation",
    body: `${parsed.data.note}/20 - ${session?.nom ?? ""}`,
    link: "/espace-stagiaire/evaluations",
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/evaluations");
  revalidatePath(`/espace-encadrant/stagiaires/${stagiaireId}`);
  return { success: true };
}

export async function updateEvaluation(
  id: string,
  sessionId: string,
  values: EvaluationValues,
): Promise<ActionResult> {
  const parsed = evaluationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.evaluation_update_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("evaluations")
    .update({
      note: Number(parsed.data.note),
      commentaire: parsed.data.commentaire || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "sessions.evaluation_update_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/evaluations");
  return { success: true };
}

export async function deleteEvaluation(
  id: string,
  sessionId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("evaluations").delete().eq("id", id);

  if (error) {
    return { error: "sessions.evaluation_delete_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/evaluations");
  return { success: true };
}

export async function createSessionDocument(
  sessionId: string,
  values: DocumentValues,
  file: { storagePath: string; taille: number; typeMime: string },
): Promise<ActionResult> {
  const parsed = documentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.document_create_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("session_documents").insert({
    session_id: sessionId,
    titre: parsed.data.titre,
    description: parsed.data.description || null,
    storage_path: file.storagePath,
    taille: file.taille,
    type_mime: file.typeMime,
  });

  if (error) {
    return { error: "sessions.document_create_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/documents");
  return { success: true };
}

export async function deleteSessionDocument(
  id: string,
  sessionId: string,
  storagePath: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.storage.from("documents").remove([storagePath]);

  const { error } = await supabase
    .from("session_documents")
    .delete()
    .eq("id", id);
  if (error) {
    return { error: "sessions.document_delete_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/documents");
  return { success: true };
}

export async function createPaiement(
  sessionId: string,
  stagiaireId: string,
  values: PaiementValues
): Promise<ActionResult> {
  const parsed = paiementSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "sessions.paiement_create_error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("paiements").insert({
    session_id: sessionId,
    stagiaire_id: stagiaireId,
    montant: Number(parsed.data.montant),
    moyen: parsed.data.moyen || null,
    date_paiement: parsed.data.datePaiement,
    note: parsed.data.note || null,
  });

  if (error) {
    return { error: "sessions.paiement_create_error" };
  }

  const [{ data: stagiaire }, { data: session }] = await Promise.all([
    supabase.from("stagiaires").select("user_id, nom, prenom").eq("id", stagiaireId).single(),
    supabase.from("stage_sessions").select("nom").eq("id", sessionId).single(),
  ]);

  await createNotifications({
    userIds: [stagiaire?.user_id],
    type: "paiement",
    title: "Paiement enregistré",
    body: `${formatMontant(Number(parsed.data.montant))} — ${session?.nom ?? ""}`,
    link: "/espace-stagiaire/paiements",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await logActivity({
    actorId: user?.id,
    actionType: "paiement_recorded",
    description: `Paiement de ${formatMontant(Number(parsed.data.montant))} enregistré pour ${stagiaire?.prenom ?? ""} ${stagiaire?.nom ?? ""}`.trim(),
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/dashboard/paiements");
  revalidatePath("/espace-stagiaire/paiements");
  return { success: true };
}

export async function deletePaiement(id: string, sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("paiements").delete().eq("id", id);

  if (error) {
    return { error: "sessions.paiement_delete_error" };
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/dashboard/paiements");
  revalidatePath("/espace-stagiaire/paiements");
  return { success: true };
}

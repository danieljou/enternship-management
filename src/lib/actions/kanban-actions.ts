"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { success: true };

const tacheSchema = z.object({
  titre: z.string().min(1, "kanban.titre_required"),
  description: z.string().optional(),
});

export type TacheValues = z.infer<typeof tacheSchema>;

function revalidateBoard(sessionId: string) {
  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire");
}

export async function createTache(
  sessionId: string,
  stagiaireId: string,
  etapeId: string,
  values: TacheValues
): Promise<ActionResult> {
  const parsed = tacheSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "kanban.titre_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("session_taches").insert({
    session_id: sessionId,
    stagiaire_id: stagiaireId,
    etape_id: etapeId,
    titre: parsed.data.titre,
    description: parsed.data.description || null,
  });

  if (error) {
    return { error: "kanban.create_error" };
  }

  revalidateBoard(sessionId);
  return { success: true };
}

export async function updateTache(
  id: string,
  sessionId: string,
  values: TacheValues
): Promise<ActionResult> {
  const parsed = tacheSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "kanban.titre_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("session_taches")
    .update({
      titre: parsed.data.titre,
      description: parsed.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "kanban.update_error" };
  }

  revalidateBoard(sessionId);
  return { success: true };
}

export async function deleteTache(id: string, sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("session_taches").delete().eq("id", id);

  if (error) {
    return { error: "kanban.delete_error" };
  }

  revalidateBoard(sessionId);
  return { success: true };
}

export async function moveTache(
  id: string,
  etapeId: string,
  sessionId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("session_taches")
    .update({ etape_id: etapeId, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: "kanban.move_error" };
  }

  revalidateBoard(sessionId);
  return { success: true };
}

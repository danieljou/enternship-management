"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { etablissementSchema, type EtablissementValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

export async function createEtablissement(
  values: EtablissementValues
): Promise<ActionResult> {
  const parsed = etablissementSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "etablissements.nom_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("etablissements").insert(parsed.data);
  if (error) {
    return { error: "etablissements.create_error" };
  }

  revalidatePath("/dashboard/etablissements");
  return { success: true };
}

export async function updateEtablissement(
  id: string,
  values: EtablissementValues
): Promise<ActionResult> {
  const parsed = etablissementSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "etablissements.nom_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("etablissements")
    .update(parsed.data)
    .eq("id", id);
  if (error) {
    return { error: "etablissements.update_error" };
  }

  revalidatePath("/dashboard/etablissements");
  return { success: true };
}

export async function deleteEtablissement(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("etablissements").delete().eq("id", id);
  if (error) {
    return { error: "etablissements.delete_error" };
  }

  revalidatePath("/dashboard/etablissements");
  return { success: true };
}

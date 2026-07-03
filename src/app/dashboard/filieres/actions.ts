"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { filiereSchema, type FiliereValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

export async function createFiliere(values: FiliereValues): Promise<ActionResult> {
  const parsed = filiereSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "filieres.nom_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("filieres").insert(parsed.data);
  if (error) {
    return { error: "filieres.create_error" };
  }

  revalidatePath("/dashboard/filieres");
  return { success: true };
}

export async function updateFiliere(
  id: string,
  values: FiliereValues
): Promise<ActionResult> {
  const parsed = filiereSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "filieres.nom_required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("filieres").update(parsed.data).eq("id", id);
  if (error) {
    return { error: "filieres.update_error" };
  }

  revalidatePath("/dashboard/filieres");
  return { success: true };
}

export async function deleteFiliere(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("filieres").delete().eq("id", id);
  if (error) {
    return { error: "filieres.delete_error" };
  }

  revalidatePath("/dashboard/filieres");
  return { success: true };
}

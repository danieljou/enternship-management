"use server";

import { createClient } from "@/lib/supabase/server";

import { adminProfileSchema, stagiaireProfileSchema, type AdminProfileValues, type StagiaireProfileValues } from "./schema";

export type ActionResult = { success: true } | { error: string };

export async function updateAdminProfile(
  userId: string,
  values: AdminProfileValues,
): Promise<ActionResult> {
  const parsed = adminProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "profile.error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ nom: parsed.data.nom, prenom: parsed.data.prenom })
    .eq("id", userId);

  if (error) {
    return { error: "profile.error" };
  }

  return { success: true };
}

export async function updateStagiaireProfile(
  stagiaireId: string,
  values: StagiaireProfileValues,
): Promise<ActionResult> {
  const parsed = stagiaireProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "profile.error" };
  }

  const supabase = await createClient();

  const { error: stagiaireError } = await supabase
    .from("stagiaires")
    .update({
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      email: parsed.data.email,
      niveau: parsed.data.niveau,
      telephone: parsed.data.telephone ?? null,
      adresse: parsed.data.adresse ?? null,
    })
    .eq("id", stagiaireId);

  if (stagiaireError) {
    return { error: "profile.error" };
  }

  return { success: true };
}

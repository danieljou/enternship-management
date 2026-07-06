"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { error: string };

export const adminProfileSchema = z.object({
  nom: z.string().min(1, "profile.required"),
  prenom: z.string().min(1, "profile.required"),
});

export type AdminProfileValues = z.infer<typeof adminProfileSchema>;

export const stagiaireProfileSchema = z.object({
  nom: z.string().min(1, "profile.required"),
  prenom: z.string().min(1, "profile.required"),
  email: z.string().email("profile.email_invalid"),
  niveau: z.coerce.number().int().min(1).max(6),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

export type StagiaireProfileValues = z.infer<typeof stagiaireProfileSchema>;

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

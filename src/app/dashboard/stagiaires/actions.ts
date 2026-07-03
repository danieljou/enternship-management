"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { stagiaireSchema, type StagiaireValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

function toRow(values: StagiaireValues) {
  return {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    niveau: Number(values.niveau),
    etablissement_id: values.etablissementId,
    filiere_id: values.filiereId,
    section: values.section,
  };
}

export async function createStagiaire(values: StagiaireValues): Promise<ActionResult> {
  const parsed = stagiaireSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "stagiaires.create_error" };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { redirectTo: `${siteUrl}/set-password` }
  );

  if (inviteError || !invited.user) {
    const alreadyExists = inviteError?.message?.toLowerCase().includes("already");
    return { error: alreadyExists ? "stagiaires.email_taken" : "stagiaires.create_error" };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from("stagiaires")
    .insert({ ...toRow(parsed.data), user_id: invited.user.id });

  if (insertError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: "stagiaires.create_error" };
  }

  revalidatePath("/dashboard/stagiaires");
  redirect("/dashboard/stagiaires?created=1");
}

export async function updateStagiaire(
  id: string,
  userId: string | null,
  values: StagiaireValues
): Promise<ActionResult> {
  const parsed = stagiaireSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "stagiaires.update_error" };
  }

  if (userId) {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      email: parsed.data.email,
    });
    if (authError) {
      return { error: "stagiaires.update_error" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stagiaires").update(toRow(parsed.data)).eq("id", id);
  if (error) {
    return { error: "stagiaires.update_error" };
  }

  revalidatePath("/dashboard/stagiaires");
  return { success: true };
}

export async function deleteStagiaire(id: string, userId: string | null): Promise<ActionResult> {
  if (userId) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stagiaires").delete().eq("id", id);
  if (error) {
    return { error: "stagiaires.delete_error" };
  }

  revalidatePath("/dashboard/stagiaires");
  return { success: true };
}

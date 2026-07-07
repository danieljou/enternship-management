"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { encadrantSchema, type EncadrantValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

export async function createEncadrant(values: EncadrantValues): Promise<ActionResult> {
  const parsed = encadrantSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "encadrants.create_error" };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { redirectTo: `${siteUrl}/auth/confirm?next=/set-password` }
  );

  if (inviteError || !invited.user) {
    const alreadyExists = inviteError?.message?.toLowerCase().includes("already");
    return { error: alreadyExists ? "encadrants.email_taken" : "encadrants.create_error" };
  }

  // Request-scoped client (authenticated as the acting admin) so the
  // "Admins manage profiles" RLS policy applies and the role-change guard
  // trigger sees a real is_admin() actor.
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "encadrant", nom: parsed.data.nom, prenom: parsed.data.prenom })
    .eq("id", invited.user.id);

  if (updateError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: "encadrants.create_error" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await logActivity({
    actorId: user?.id,
    actionType: "encadrant_created",
    description: `${parsed.data.prenom} ${parsed.data.nom} a été ajouté(e) comme encadrant`,
  });

  revalidatePath("/dashboard/encadrants");
  return { success: true };
}

export async function deleteEncadrant(userId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { error: "encadrants.delete_error" };
  }

  revalidatePath("/dashboard/encadrants");
  revalidatePath("/dashboard/stagiaires");
  return { success: true };
}

export interface EncadrantOption {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  stagiairesCount: number;
}

export async function getEncadrants(): Promise<EncadrantOption[]> {
  const admin = createAdminClient();

  const [{ data: usersPage }, { data: profiles }, { data: stagiaires }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, nom, prenom").eq("role", "encadrant"),
    admin.from("stagiaires").select("encadrant_id").not("encadrant_id", "is", null),
  ]);

  const emailById = new Map((usersPage?.users ?? []).map((user) => [user.id, user.email ?? ""]));
  const countByEncadrant = new Map<string, number>();
  for (const row of stagiaires ?? []) {
    if (!row.encadrant_id) continue;
    countByEncadrant.set(row.encadrant_id, (countByEncadrant.get(row.encadrant_id) ?? 0) + 1);
  }

  return (profiles ?? [])
    .map((profile) => ({
      userId: profile.id,
      nom: profile.nom ?? "",
      prenom: profile.prenom ?? "",
      email: emailById.get(profile.id) ?? "",
      stagiairesCount: countByEncadrant.get(profile.id) ?? 0,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom));
}

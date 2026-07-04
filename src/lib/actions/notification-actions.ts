"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { success: true };

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

  if (error) {
    return { error: "notifications.mark_read_error" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/espace-stagiaire");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "notifications.mark_read_error" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { error: "notifications.mark_read_error" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/espace-stagiaire");
  return { success: true };
}

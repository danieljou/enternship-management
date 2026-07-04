"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { success: true };

const messageSchema = z.object({
  body: z.string().trim().min(1, "chat.message_required"),
});

export async function sendMessage(channelId: string, body: string): Promise<ActionResult> {
  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) {
    return { error: "chat.message_required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "chat.send_error" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "stagiaire";
  let senderName = user.email ?? "?";

  if (role === "stagiaire") {
    const { data: stagiaire } = await supabase
      .from("stagiaires")
      .select("nom, prenom")
      .eq("user_id", user.id)
      .single();

    if (stagiaire) {
      senderName = `${stagiaire.prenom} ${stagiaire.nom}`;
    }
  }

  const { error } = await supabase.from("chat_messages").insert({
    channel_id: channelId,
    sender_id: user.id,
    sender_role: role,
    sender_name: senderName,
    body: parsed.data.body,
  });

  if (error) {
    return { error: "chat.send_error" };
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/espace-stagiaire/messagerie");
  return { success: true };
}

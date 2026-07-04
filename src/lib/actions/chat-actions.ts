"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  createNotifications,
  getAdminUserIds,
  getAllUserIds,
} from "@/lib/notifications";

export type ActionResult = { error: string } | { success: true };

const messageSchema = z.object({
  body: z.string().trim().min(1, "chat.message_required"),
});

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function sendMessage(
  channelId: string,
  body: string,
): Promise<ActionResult> {
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

  const { data: channel } = await supabase
    .from("chat_channels")
    .select("type, stagiaire:stagiaires(user_id)")
    .eq("id", channelId)
    .single();

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

  const preview = truncate(parsed.data.body, 100);
  const stagiaireUserId = (channel?.stagiaire as unknown as { user_id: string } | null)
    ?.user_id;

  if (channel?.type === "general") {
    const adminIds = await getAdminUserIds(user.id);
    const allIds = await getAllUserIds(user.id);
    const stagiaireIds = allIds.filter((id) => !adminIds.includes(id));

    await Promise.all([
      createNotifications({
        userIds: adminIds,
        type: "chat_message",
        title: `${senderName} - Général`,
        body: preview,
        link: `/dashboard/messages?channel=${channelId}`,
      }),
      createNotifications({
        userIds: stagiaireIds,
        type: "chat_message",
        title: "Nouveau message dans Général",
        body: preview,
        link: `/espace-stagiaire/messagerie?channel=${channelId}`,
      }),
    ]);
  } else if (channel?.type === "inbox") {
    if (role === "admin") {
      await createNotifications({
        userIds: [stagiaireUserId],
        type: "chat_message",
        title: `${senderName} vous a écrit`,
        body: preview,
        link: `/espace-stagiaire/messagerie?channel=${channelId}`,
      });
    } else {
      const adminIds = await getAdminUserIds(user.id);
      await createNotifications({
        userIds: adminIds,
        type: "chat_message",
        title: `${senderName} - message privé`,
        body: preview,
        link: `/dashboard/messages?channel=${channelId}`,
      });
    }
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/espace-stagiaire/messagerie");
  return { success: true };
}

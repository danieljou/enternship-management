import type { Metadata } from "next";

import { ChatPage } from "@/components/chat/chat-page";
import { createClient } from "@/lib/supabase/server";
import type { ChatChannelWithStagiaire, ChatMessage } from "@/lib/types";

export const metadata: Metadata = {
  title: "Messages - FUTURIX-iTech",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel: requestedChannelId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: channels } = await supabase
    .from("chat_channels")
    .select("*, stagiaire:stagiaires(id, nom, prenom, email)")
    .order("created_at", { ascending: true });

  const sorted = ((channels as ChatChannelWithStagiaire[] | null) ?? []).sort(
    (a, b) => {
      if (a.type !== b.type) return a.type === "general" ? -1 : 1;
      return (a.stagiaire?.nom ?? "").localeCompare(b.stagiaire?.nom ?? "");
    },
  );

  const generalChannel = sorted.find((channel) => channel.type === "general");
  const requestedChannel = sorted.find(
    (channel) => channel.id === requestedChannelId,
  );
  const initialChannelId =
    requestedChannel?.id ?? generalChannel?.id ?? sorted[0]?.id ?? "";

  const { data: messages } = initialChannelId
    ? await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel_id", initialChannelId)
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <ChatPage
      titleKey="chat.title"
      descriptionKey="chat.description_admin"
      channels={sorted}
      initialChannelId={initialChannelId}
      initialMessages={(messages as ChatMessage[] | null) ?? []}
      currentUserId={user!.id}
    />
  );
}

import type { Metadata } from "next";

import { ChatPage } from "@/components/chat/chat-page";
import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { ChatChannelWithStagiaire, ChatMessage } from "@/lib/types";

export const metadata: Metadata = {
  title: "Messagerie — FUTURIX-iTech",
};

export default async function StagiaireMessageriePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: channels } = await supabase
    .from("chat_channels")
    .select("*, stagiaire:stagiaires(id, nom, prenom, email)")
    .order("created_at", { ascending: true });

  const sorted = ((channels as ChatChannelWithStagiaire[] | null) ?? []).sort((a, b) =>
    a.type === b.type ? 0 : a.type === "general" ? -1 : 1
  );

  const generalChannel = sorted.find((channel) => channel.type === "general");
  const initialChannelId = generalChannel?.id ?? sorted[0]?.id ?? "";

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
      descriptionKey="chat.description_stagiaire"
      channels={sorted}
      initialChannelId={initialChannelId}
      initialMessages={(messages as ChatMessage[] | null) ?? []}
      currentUserId={user!.id}
    />
  );
}

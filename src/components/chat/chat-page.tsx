"use client";

import { useTranslation } from "react-i18next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import type { ChatChannelWithStagiaire, ChatMessage } from "@/lib/types";

import { ChatShell } from "./chat-shell";

export function ChatPage({
  titleKey,
  descriptionKey,
  channels,
  initialChannelId,
  initialMessages,
  currentUserId,
}: {
  titleKey: string;
  descriptionKey: string;
  channels: ChatChannelWithStagiaire[];
  initialChannelId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t(titleKey)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(descriptionKey)}</p>
      </div>

      {channels.length === 0 ? (
        <EmptyStateMessage messageKey="chat.no_channels" />
      ) : (
        <ChatShell
          channels={channels}
          initialChannelId={initialChannelId}
          initialMessages={initialMessages}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

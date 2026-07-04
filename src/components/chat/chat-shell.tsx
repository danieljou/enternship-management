"use client";

import { useState } from "react";

import { useChatMessages } from "@/hooks/use-chat-messages";
import { cn } from "@/lib/utils";
import type { ChatChannelWithStagiaire, ChatMessage } from "@/lib/types";

import { ChatChannelList } from "./chat-channel-list";
import { ChatConversation } from "./chat-conversation";

export function ChatShell({
  channels,
  initialChannelId,
  initialMessages,
  currentUserId,
}: {
  channels: ChatChannelWithStagiaire[];
  initialChannelId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
}) {
  const [selectedChannelId, setSelectedChannelId] = useState(initialChannelId);
  const [mobileShowConversation, setMobileShowConversation] = useState(false);
  const messages = useChatMessages(selectedChannelId, initialMessages);
  const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? channels[0];

  function selectChannel(id: string) {
    setSelectedChannelId(id);
    setMobileShowConversation(true);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-card">
      <div
        className={cn(
          "w-full shrink-0 border-r sm:block sm:w-72",
          mobileShowConversation ? "hidden" : "block"
        )}
      >
        <ChatChannelList channels={channels} selectedId={selectedChannelId} onSelect={selectChannel} />
      </div>

      <div className={cn("flex-1", mobileShowConversation ? "block" : "hidden sm:block")}>
        {selectedChannel && (
          <ChatConversation
            channel={selectedChannel}
            messages={messages}
            currentUserId={currentUserId}
            onBack={() => setMobileShowConversation(false)}
          />
        )}
      </div>
    </div>
  );
}

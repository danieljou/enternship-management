"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

export function useChatMessages(channelId: string, initialMessages: ChatMessage[]) {
  const [messages, setMessages] = useState(initialMessages);
  const loadedChannelId = useRef(channelId);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      if (loadedChannelId.current !== channelId) {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true });

        if (!cancelled) setMessages((data as ChatMessage[] | null) ?? []);
      }
      loadedChannelId.current = channelId;
    }

    load();

    const channel = supabase
      .channel(`chat-messages-${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return messages;
}

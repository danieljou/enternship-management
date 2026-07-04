"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/actions/chat-actions";
import { cn } from "@/lib/utils";
import type { ChatChannelWithStagiaire, ChatMessage } from "@/lib/types";

import { getChannelLabel } from "./chat-utils";

export function ChatConversation({
  channel,
  messages,
  currentUserId,
  onBack,
}: {
  channel: ChatChannelWithStagiaire;
  messages: ChatMessage[];
  currentUserId: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const title = getChannelLabel(channel, t);

  function submit() {
    const body = text.trim();
    if (!body) return;

    setText("");
    startTransition(async () => {
      const result = await sendMessage(channel.id, body);
      if ("error" in result) {
        toast.error(t(result.error));
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("chat.empty_conversation")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isMine = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn("flex flex-col gap-0.5", isMine ? "items-end" : "items-start")}
                >
                  {!isMine && (
                    <span className="px-1 text-xs text-muted-foreground">{message.sender_name}</span>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                      isMine
                        ? "bg-cyan-500 text-white dark:bg-cyan-400 dark:text-neutral-950"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.body}
                  </div>
                  <span className="px-1 text-[10px] text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={t("chat.message_placeholder")}
          className="min-h-10 flex-1 resize-none"
          rows={1}
        />
        <Button type="submit" size="icon" disabled={isPending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

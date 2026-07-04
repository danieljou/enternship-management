"use client";

import { useTranslation } from "react-i18next";
import { Hash, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatChannelWithStagiaire } from "@/lib/types";

import { getChannelLabel } from "./chat-utils";

export function ChatChannelList({
  channels,
  selectedId,
  onSelect,
}: {
  channels: ChatChannelWithStagiaire[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <ul className="flex h-full flex-col gap-1 overflow-y-auto p-2">
      {channels.map((channel) => {
        const isGeneral = channel.type === "general";
        const label = getChannelLabel(channel, t);
        const isActive = channel.id === selectedId;
        const Icon = isGeneral ? Hash : Inbox;

        return (
          <li key={channel.id}>
            <button
              type="button"
              onClick={() => onSelect(channel.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

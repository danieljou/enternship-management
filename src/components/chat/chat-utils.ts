import type { TFunction } from "i18next";

import type { ChatChannelWithStagiaire } from "@/lib/types";

export function getChannelLabel(channel: ChatChannelWithStagiaire, t: TFunction): string {
  if (channel.type === "general") return t("chat.general_channel");
  if (channel.stagiaire) return `${channel.stagiaire.prenom} ${channel.stagiaire.nom}`;
  return t("chat.inbox_channel");
}

import type { Metadata } from "next";

import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata: Metadata = {
  title: "Paramètres - FUTURIX-iTech",
};

export default function ParametresPage() {
  return <SettingsPanel />;
}

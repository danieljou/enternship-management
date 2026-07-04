import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Tâches - FUTURIX-iTech",
};

export default function TachesPage() {
  return <ComingSoon titleKey="sidebar.taches" />;
}

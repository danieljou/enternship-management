import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Rapports — FUTURIX-iTech",
};

export default function RapportsPage() {
  return <ComingSoon titleKey="sidebar.rapports" />;
}

import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Paramètres - FUTURIX-iTech",
};

export default function ParametresPage() {
  return <ComingSoon titleKey="sidebar.parametres" />;
}

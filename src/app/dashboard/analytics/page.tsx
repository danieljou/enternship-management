import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Analytics — FUTURIX-iTech",
};

export default function AnalyticsPage() {
  return <ComingSoon titleKey="sidebar.analytics" />;
}

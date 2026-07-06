import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { RoadmapTemplate } from "@/lib/types";

import { RoadmapsManager } from "./roadmaps-manager";

export const metadata: Metadata = {
  title: "Roadmaps - FUTURIX-iTech",
};

export default async function RoadmapsPage() {
  const supabase = await createClient();

  const [{ data: templates }, { data: instances }] = await Promise.all([
    supabase.from("roadmap_templates").select("*").order("created_at", { ascending: false }),
    supabase.from("roadmap_instances").select("id, template_id"),
  ]);

  const instancesCount = new Map<string, number>();
  for (const row of instances ?? []) {
    instancesCount.set(row.template_id, (instancesCount.get(row.template_id) ?? 0) + 1);
  }

  const data = ((templates as RoadmapTemplate[] | null) ?? []).map((template) => ({
    ...template,
    instances_count: instancesCount.get(template.id) ?? 0,
  }));

  return <RoadmapsManager data={data} />;
}

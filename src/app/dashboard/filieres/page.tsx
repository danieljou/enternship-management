import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { Filiere } from "@/lib/types";

import { FilieresManager } from "./filieres-manager";

export const metadata: Metadata = {
  title: "Filières — FUTURIX-iTech",
};

export default async function FilieresPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("filieres").select("*").order("nom", { ascending: true });

  return <FilieresManager data={(data as Filiere[] | null) ?? []} />;
}

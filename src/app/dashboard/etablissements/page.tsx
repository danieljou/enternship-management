import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { Etablissement } from "@/lib/types";

import { EtablissementsManager } from "./etablissements-manager";

export const metadata: Metadata = {
  title: "Établissements - FUTURIX-iTech",
};

export default async function EtablissementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("etablissements")
    .select("*")
    .order("nom", { ascending: true });

  return (
    <EtablissementsManager data={(data as Etablissement[] | null) ?? []} />
  );
}

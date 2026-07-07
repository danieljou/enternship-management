import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { Etablissement, Filiere } from "@/lib/types";

import { getEncadrants } from "../../encadrants/actions";
import { getUnlinkedStagiaireAccounts } from "../actions";
import { StagiaireCreateForm } from "./create-form";

export const metadata: Metadata = {
  title: "Nouveau stagiaire - FUTURIX-iTech",
};

export default async function NouveauStagiairePage() {
  const supabase = await createClient();
  const [{ data: etablissements }, { data: filieres }, unlinkedAccounts, encadrants] =
    await Promise.all([
      supabase
        .from("etablissements")
        .select("*")
        .order("nom", { ascending: true }),
      supabase.from("filieres").select("*").order("nom", { ascending: true }),
      getUnlinkedStagiaireAccounts(),
      getEncadrants(),
    ]);

  return (
    <StagiaireCreateForm
      etablissements={(etablissements as Etablissement[] | null) ?? []}
      filieres={(filieres as Filiere[] | null) ?? []}
      unlinkedAccounts={unlinkedAccounts}
      encadrants={encadrants}
    />
  );
}

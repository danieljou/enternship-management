import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type {
  Etablissement,
  Filiere,
  StagiaireWithRelations,
} from "@/lib/types";

import { StagiaireCreatedToast } from "./created-toast";
import { StagiairesManager } from "./stagiaires-manager";

export const metadata: Metadata = {
  title: "Stagiaires - FUTURIX-iTech",
};

export default async function StagiairesPage() {
  const supabase = await createClient();

  const [{ data: stagiaires }, { data: etablissements }, { data: filieres }] =
    await Promise.all([
      supabase
        .from("stagiaires")
        .select(
          "*, etablissement:etablissements(id, nom), filiere:filieres(id, nom)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("etablissements")
        .select("*")
        .order("nom", { ascending: true }),
      supabase.from("filieres").select("*").order("nom", { ascending: true }),
    ]);

  return (
    <>
      <StagiaireCreatedToast />
      <StagiairesManager
        data={(stagiaires as StagiaireWithRelations[] | null) ?? []}
        etablissements={(etablissements as Etablissement[] | null) ?? []}
        filieres={(filieres as Filiere[] | null) ?? []}
      />
    </>
  );
}

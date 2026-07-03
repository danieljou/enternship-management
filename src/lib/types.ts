export type StagiaireSection = "francophone" | "anglophone";

export type AppRole = "admin" | "stagiaire";

export interface Etablissement {
  id: string;
  nom: string;
  created_at: string;
}

export interface Filiere {
  id: string;
  nom: string;
  created_at: string;
}

export interface Stagiaire {
  id: string;
  user_id: string | null;
  nom: string;
  prenom: string;
  email: string;
  niveau: number;
  etablissement_id: string | null;
  filiere_id: string | null;
  section: StagiaireSection;
  created_at: string;
}

export interface StagiaireWithRelations extends Stagiaire {
  etablissement: Pick<Etablissement, "id" | "nom"> | null;
  filiere: Pick<Filiere, "id" | "nom"> | null;
}

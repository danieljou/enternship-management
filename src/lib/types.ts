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

export interface StageSession {
  id: string;
  nom: string;
  description: string | null;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
}

export interface SessionWithCounts extends StageSession {
  etapes_count: number;
  stagiaires_count: number;
}

export interface SessionEtape {
  id: string;
  session_id: string;
  nom: string;
  description: string | null;
  couleur: string;
  icone: string;
  ordre: number;
  created_at: string;
}

export interface SessionStagiaire {
  id: string;
  session_id: string;
  stagiaire_id: string;
  created_at: string;
}

export interface SessionStagiaireWithRelations extends SessionStagiaire {
  stagiaire: Pick<Stagiaire, "id" | "nom" | "prenom" | "email"> | null;
}

export interface SessionTache {
  id: string;
  session_id: string;
  stagiaire_id: string;
  etape_id: string;
  titre: string;
  description: string | null;
  ordre: number;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  session_id: string;
  stagiaire_id: string;
  note: number;
  commentaire: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvaluationWithSession extends Evaluation {
  session: Pick<StageSession, "id" | "nom"> | null;
}

export interface SessionDocument {
  id: string;
  session_id: string;
  titre: string;
  description: string | null;
  storage_path: string;
  taille: number | null;
  type_mime: string | null;
  created_at: string;
}

export interface SessionDocumentWithSession extends SessionDocument {
  session: Pick<StageSession, "id" | "nom"> | null;
}

export type ChatChannelType = "general" | "inbox";

export interface ChatChannel {
  id: string;
  type: ChatChannelType;
  stagiaire_id: string | null;
  created_at: string;
}

export interface ChatChannelWithStagiaire extends ChatChannel {
  stagiaire: Pick<Stagiaire, "id" | "nom" | "prenom" | "email"> | null;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_role: AppRole;
  sender_name: string;
  body: string;
  created_at: string;
}

export type StagiaireSection = "francophone" | "anglophone";

export type AppRole = "admin" | "stagiaire";

export interface Profile {
  id: string;
  role: AppRole;
  nom: string | null;
  prenom: string | null;
  created_at: string;
}

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
  telephone: string | null;
  adresse: string | null;
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
  frais_montant: number | null;
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

export interface Paiement {
  id: string;
  session_id: string;
  stagiaire_id: string;
  montant: number;
  moyen: string | null;
  date_paiement: string;
  note: string | null;
  created_at: string;
}

export interface PaiementWithSession extends Paiement {
  session: Pick<StageSession, "id" | "nom" | "frais_montant"> | null;
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

export type NotificationType =
  | "chat_message"
  | "evaluation"
  | "document"
  | "paiement"
  | "roadmap_assignation"
  | "roadmap_quiz"
  | "roadmap_livrable";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type RoadmapStatut = "brouillon" | "publie" | "archive";
export type RoadmapLivrableStatut = "non_soumis" | "soumis" | "valide" | "a_corriger";
export type RoadmapLivrableMode = "lien" | "texte";
export type RoadmapEtapeState = "a_venir" | "en_cours" | "validee" | "bloquee";
export type RoadmapRessourceType = "documentation" | "video" | "api" | "outil";

export type RoadmapQuizQuestion =
  | { type: "qcm_unique"; question: string; choix: string[]; reponse_correcte: string }
  | { type: "vrai_faux"; question: string; reponse_correcte: boolean }
  | { type: "qcm_multiple"; question: string; choix: string[]; reponses_correctes: string[] };

export interface RoadmapQuiz {
  titre: string;
  score_minimum: number;
  tentatives_max: number;
  afficher_corrige: boolean;
  questions: RoadmapQuizQuestion[];
}

/** Same shape as RoadmapQuiz but with every correct-answer field stripped, safe to send to a stagiaire before grading. */
export type RoadmapQuizSanitized = Omit<RoadmapQuiz, "questions"> & {
  questions: { type: RoadmapQuizQuestion["type"]; question: string; choix?: string[] }[];
};

export interface RoadmapRessource {
  type: RoadmapRessourceType;
  titre: string;
  url: string;
}

export interface RoadmapCours {
  resume: string;
  points_cles: string[];
  ressources: RoadmapRessource[];
}

export interface RoadmapExercice {
  consigne: string;
  criteres_reussite: string[];
}

export interface RoadmapTemplate {
  id: string;
  titre: string;
  branche: string;
  niveau: string | null;
  duree_semaines: number;
  version: string;
  note: string | null;
  statut: RoadmapStatut;
  created_at: string;
  updated_at: string;
}

export interface RoadmapSemaine {
  id: string;
  roadmap_id: string;
  numero: number;
  titre: string;
  created_at: string;
}

export interface RoadmapEtape {
  id: string;
  semaine_id: string;
  jour: number;
  titre: string;
  objectifs: string[];
  cours: RoadmapCours;
  exercice: RoadmapExercice;
  livrable_attendu: string;
  quiz: RoadmapQuiz | null;
  created_at: string;
}

export interface RoadmapSemaineWithEtapes extends RoadmapSemaine {
  etapes: RoadmapEtape[];
}

export interface RoadmapTemplateWithContenu extends RoadmapTemplate {
  semaines: RoadmapSemaineWithEtapes[];
}

export interface RoadmapInstance {
  id: string;
  template_id: string;
  stagiaire_id: string;
  assigned_by: string | null;
  version_snapshot: string;
  date_debut: string;
  date_fin: string;
  note_interne: string | null;
  created_at: string;
}

export interface RoadmapInstanceWithRelations extends RoadmapInstance {
  template: Pick<RoadmapTemplate, "id" | "titre" | "branche" | "duree_semaines" | "statut"> | null;
  stagiaire: Pick<Stagiaire, "id" | "nom" | "prenom" | "email"> | null;
}

export interface RoadmapProgress {
  id: string;
  instance_id: string;
  etape_id: string;
  quiz_tentatives: number;
  quiz_meilleur_score: number | null;
  quiz_reussi: boolean;
  livrable_statut: RoadmapLivrableStatut;
  updated_at: string;
}

export interface RoadmapLivrableSoumission {
  id: string;
  progress_id: string;
  contenu: string;
  mode: RoadmapLivrableMode;
  statut: RoadmapLivrableStatut;
  commentaire: string;
  created_at: string;
}

// src/types/index.ts
export interface Employee {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  tele?: string;
  poste?: string;
  adresse?: string;
  role?: Role;
  departement?: string;
  actif?: boolean;
  dateNaissance?: string;
  nomDeUtilisateur?: string;
  motDePasse?: string;
  telephone?: string;
  imageProfil?: string;
  genre?: string;
  dateEmbauche?: string;
  matricule?: string;
  salaire?: number;
}

export enum Role {
  ADMIN = "ADMIN",
  SUPERVISEUR = "SUPERVISEUR",
  ENQUETEUR = "ENQUETEUR"
}

export interface Absence {
  id?: number;
  dateDebut: string;
  dateFin: string;
  motif: string;
  employe?: Employee;
}

export interface DemandeAdministrative {
  id?: number;
  typeDemande: string;
  statut?: string;
  dateDemande: string;
  employe?: Employee;
}

export interface Contrat {
  id?: number;
  dateDebut: string;
  dateFin: string;
  typeContrat: string;
  employe?: Employee;
}

export interface Salaire {
  id?: number;
  montant: number;
  datePaiement: string;
  employe?: Employee;
}

export interface Etude {
  id?: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  objectifQuotas: number;
  superviseur?: Employee;
  enqueteurs?: Employee[];
  quotas?: Quota[];
  adresses?: Adresse[];
  taches?: Tache[];
  ganttPlan?: GanttPlan;
}

export interface Quota {
  id?: number;
  // Add quota fields as needed
}

export interface Adresse {
  id?: number;
  // Add address fields as needed
}

export interface Tache {
  id?: number;
  // Add task fields as needed
}

export interface GanttPlan {
  id?: number;
  // Add Gantt plan fields as needed
}

export interface Questionnaire {
  id?: number;
  titre: string;
  questions?: Question[];
}

export interface Question {
  id?: number;
  texte: string;
  choix: string[];
  questionnaire?: { id: number };
}

export interface ReponseQuestion {
  id?: number;
  questionId: number;
  choixSelectionne: string;
  reponseQuestionnaireId?: number;
}

export interface ReponseQuestionnaire {
  id?: number;
  enqueteurId: number;
  questionnaireId: number;
  reponses?: ReponseQuestion[];
}
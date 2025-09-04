import axios from "axios";

const API_BASE = "http://localhost:8081/api";

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
}

export interface ReponseQuestionnaire {
  id?: number;
  enqueteurId: number;
  questionnaireId: number;
  reponses: ReponseQuestion[];
}

// Questionnaire API
export const getQuestionnaires = () =>
  axios.get<Questionnaire[]>(`${API_BASE}/questionnaires`);

export const createQuestionnaire = (q: Questionnaire) =>
  axios.post<Questionnaire>(`${API_BASE}/questionnaires`, q);

// Question API
export const createQuestion = (q: Question) =>
  axios.post<Question>(`${API_BASE}/questions`, q);

export const getQuestionsByQuestionnaire = (id: number) =>
  axios.get<Question[]>(`${API_BASE}/questions/by-questionnaire/${id}`);

// Response API
export const submitReponseQuestionnaire = (data: ReponseQuestionnaire) =>
  axios.post<ReponseQuestionnaire>(`${API_BASE}/reponses/questionnaire`, data);

export const getReponsesByQuestionnaire = (questionnaireId: number) =>
  axios.get<ReponseQuestionnaire[]>(`${API_BASE}/reponses/questionnaire/${questionnaireId}`);

export const getReponsesByEnqueteur = (employeId: number) =>
  axios.get<ReponseQuestionnaire[]>(`${API_BASE}/reponses/enqueteur/${employeId}`);
import axios from "axios";

const API_URL = "http://localhost:8081/api/etudes";

export interface Etude {
  id?: number;
  nom: string;
  dateDebut: string;
  dateFin: string;     
  objectifQuotas: number;
  superviseur?: any | null;
  quotas?: any[];
  adresses?: any[];
  taches?: any[];
  ganttPlan?: any | null;
}

export const getEtudes = () => axios.get<Etude[]>(API_URL);
export const getEtudeById = (id: number) => axios.get<Etude>(`${API_URL}/${id}`);
export const createEtude = (etude: Etude) => axios.post(API_URL, etude);
export const updateEtude = (id: number, etude: Etude) => axios.put(`${API_URL}/${id}`, etude);
export const deleteEtude = (id: number) => axios.delete(`${API_URL}/${id}`);
export const assignEnqueteurToEtude = (etudeId: number, employeId: number) =>
  axios.post(`${API_URL}/${etudeId}/enqueteurs/${employeId}`);
export const removeEnqueteurFromEtude = (etudeId: number, employeId: number) =>
  axios.delete(`${API_URL}/${etudeId}/enqueteurs/${employeId}`);
export const getSuperviseurByEtude = (id: number) => axios.get(`${API_URL}/${id}/superviseur`);
export const getEnqueteursByEtude = (id: number) => axios.get(`${API_URL}/${id}/enqueteurs`);
export const getEtudesBySuperviseur = (superviseurId: number) => axios.get(`${API_URL}/superviseur/${superviseurId}`);
export const getEtudesByEnqueteur = (employeId: number) => axios.get(`${API_URL}/enqueteur/${employeId}`);
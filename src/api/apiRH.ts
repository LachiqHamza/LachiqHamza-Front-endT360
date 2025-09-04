import axios, { AxiosResponse } from "axios";

const API_BASE = "http://localhost:8081"; 

export interface Employee {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  tele?: string;
  poste?: string;
  adresse?: string;
  role?: string;
  departement?: string;
  actif?: boolean;
  dateNaissance?: string;
  nomDeUtilisateur?: string;
  telephone?: string;
  genre?: string;
  dateEmbauche?: string;
  matricule?: string;
  salaire?: number;
}

export interface Absence {
  id?: number;
  dateDebut: string;
  dateFin: string;
  motif: string;
}

export interface DemandeAdministrative {
  id?: number;
  typeDemande: string;
  description: string;
  statut?: string;
  dateDemande: string;
}

export interface Contrat {
  id?: number;
  dateDebut: string;
  dateFin: string;
  typeContrat: string;
}

export interface Salaire {
  id?: number;
  montant: number;
  datePaiement: string;
}

// Employees
export const getEmployees = (): Promise<AxiosResponse<Employee[]>> => axios.get(`${API_BASE}/api/employees`);
export const getEmployeeById = (id: number): Promise<AxiosResponse<Employee>> => axios.get(`${API_BASE}/api/employees/${id}`);
export const addEmployee = (data: Employee): Promise<AxiosResponse<Employee>> => axios.post(`${API_BASE}/api/employees`, data);
export const updateEmployee = (id: number, data: Employee): Promise<AxiosResponse<Employee>> => axios.put(`${API_BASE}/api/employees/${id}`, data);
export const deleteEmployee = (id: number): Promise<AxiosResponse<void>> => axios.delete(`${API_BASE}/api/employees/${id}`);

// Absences
export const getAbsencesByEmployee = (employeeId: number): Promise<AxiosResponse<Absence[]>> => axios.get(`${API_BASE}/absences/employee/${employeeId}`);
export const addAbsence = (employeeId: number, data: Absence): Promise<AxiosResponse<Absence>> => axios.post(`${API_BASE}/absences/employee/${employeeId}`, data);

// Demandes Administratives
export const getDemandesByEmployee = (employeeId: number): Promise<AxiosResponse<DemandeAdministrative[]>> =>
  axios.get(`${API_BASE}/demandes/employe/${employeeId}`);
export const addDemande = (employeeId: number, data: DemandeAdministrative): Promise<AxiosResponse<DemandeAdministrative>> =>
  axios.post(`${API_BASE}/demandes/employe/${employeeId}`, data);
export const validerDemande = (demandeId: number): Promise<AxiosResponse<DemandeAdministrative>> =>
  axios.put(`${API_BASE}/demandes/${demandeId}/valider`);
export const refuserDemande = (demandeId: number): Promise<AxiosResponse<DemandeAdministrative>> =>
  axios.put(`${API_BASE}/demandes/${demandeId}/refuser`);

// Contrats
export const getContratsByEmployee = (employeeId: number): Promise<AxiosResponse<Contrat[]>> =>
  axios.get(`${API_BASE}/contrats/employe/${employeeId}`);
export const addContrat = (employeeId: number, data: Contrat): Promise<AxiosResponse<Contrat>> =>
  axios.post(`${API_BASE}/contrats/employe/${employeeId}`, data);

// Salaires
export const getSalairesByEmployee = (employeeId: number): Promise<AxiosResponse<Salaire[]>> =>
  axios.get(`${API_BASE}/salaires/employe/${employeeId}`);
export const addSalaire = (employeeId: number, data: Salaire): Promise<AxiosResponse<Salaire>> =>
  axios.post(`${API_BASE}/salaires/employe/${employeeId}`, data);
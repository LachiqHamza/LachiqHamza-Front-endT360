// src/api/apiService.ts
import axios from 'axios';
import { 
  Employee, Absence, DemandeAdministrative, Contrat, 
  Salaire, Etude, Questionnaire, Question, 
  ReponseQuestion, ReponseQuestionnaire, Role 
} from '../types';

const API_BASE = "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Employees API
export const employeeApi = {
  getEmployees: (): Promise<Employee[]> => api.get('/api/employees').then(res => res.data),
  getEmployeeById: (id: number): Promise<Employee> => api.get(`/api/employees/${id}`).then(res => res.data),
  createEmployee: (data: Employee): Promise<Employee> => api.post('/api/employees', data).then(res => res.data),
  updateEmployee: (id: number, data: Partial<Employee>): Promise<Employee> => 
    api.put(`/api/employees/${id}`, data).then(res => res.data),
  deleteEmployee: (id: number): Promise<void> => api.delete(`/api/employees/${id}`).then(res => res.data),
  getEmployeesByRole: (role: Role): Promise<Employee[]> => 
    api.get(`/api/employees/role/${role}`).then(res => res.data),
};

// Absences API
export const absenceApi = {
  getAbsencesByEmployee: (employeeId: number): Promise<Absence[]> => 
    api.get(`/absences/employee/${employeeId}`).then(res => res.data),
  addAbsence: (employeeId: number, data: Omit<Absence, 'id'>): Promise<Absence> => 
    api.post(`/absences/employee/${employeeId}`, data).then(res => res.data),
};

// Administrative Requests API
export const demandeApi = {
  getDemandesByEmployee: (employeeId: number): Promise<DemandeAdministrative[]> => 
    api.get(`/demandes/employe/${employeeId}`).then(res => res.data),
  addDemande: (employeeId: number, data: Omit<DemandeAdministrative, 'id'>): Promise<DemandeAdministrative> => 
    api.post(`/demandes/employe/${employeeId}`, data).then(res => res.data),
  validerDemande: (demandeId: number): Promise<DemandeAdministrative> => 
    api.put(`/demandes/${demandeId}/valider`).then(res => res.data),
  refuserDemande: (demandeId: number): Promise<DemandeAdministrative> => 
    api.put(`/demandes/${demandeId}/refuser`).then(res => res.data),
};

// Contracts API
export const contratApi = {
  getContratsByEmployee: (employeeId: number): Promise<Contrat[]> => 
    api.get(`/contrats/employe/${employeeId}`).then(res => res.data),
  addContrat: (employeeId: number, data: Omit<Contrat, 'id'>): Promise<Contrat> => 
    api.post(`/contrats/employe/${employeeId}`, data).then(res => res.data),
};

// Salaries API
export const salaireApi = {
  getSalairesByEmployee: (employeeId: number): Promise<Salaire[]> => 
    api.get(`/salaires/employe/${employeeId}`).then(res => res.data),
  addSalaire: (employeeId: number, data: Omit<Salaire, 'id'>): Promise<Salaire> => 
    api.post(`/salaires/employe/${employeeId}`, data).then(res => res.data),
};

// Studies API
export const etudeApi = {
  getEtudes: (): Promise<Etude[]> => api.get('/api/etudes').then(res => res.data),
  getEtudeById: (id: number): Promise<Etude> => api.get(`/api/etudes/${id}`).then(res => res.data),
  createEtude: (data: Omit<Etude, 'id'>): Promise<Etude> => api.post('/api/etudes', data).then(res => res.data),
  updateEtude: (id: number, data: Partial<Etude>): Promise<Etude> => 
    api.put(`/api/etudes/${id}`, data).then(res => res.data),
  deleteEtude: (id: number): Promise<void> => api.delete(`/api/etudes/${id}`).then(res => res.data),
  assignEnqueteurToEtude: (etudeId: number, employeId: number): Promise<Etude> => 
    api.post(`/api/etudes/${etudeId}/enqueteurs/${employeId}`).then(res => res.data),
  removeEnqueteurFromEtude: (etudeId: number, employeId: number): Promise<Etude> => 
    api.delete(`/api/etudes/${etudeId}/enqueteurs/${employeId}`).then(res => res.data),
  getSuperviseurByEtude: (id: number): Promise<Employee> => 
    api.get(`/api/etudes/${id}/superviseur`).then(res => res.data),
  getEnqueteursByEtude: (id: number): Promise<Employee[]> => 
    api.get(`/api/etudes/${id}/enqueteurs`).then(res => res.data),
  getEtudesBySuperviseur: (superviseurId: number): Promise<Etude[]> => 
    api.get(`/api/etudes/superviseur/${superviseurId}`).then(res => res.data),
  getEtudesByEnqueteur: (employeId: number): Promise<Etude[]> => 
    api.get(`/api/etudes/enqueteur/${employeId}`).then(res => res.data),
};

// Questionnaires API
export const questionnaireApi = {
  getQuestionnaires: (): Promise<Questionnaire[]> => 
    api.get('/api/questionnaires').then(res => res.data),
  createQuestionnaire: (data: Omit<Questionnaire, 'id'>): Promise<Questionnaire> => 
    api.post('/api/questionnaires', data).then(res => res.data),
  getQuestionnaireById: (id: number): Promise<Questionnaire> => 
    api.get(`/api/questionnaires/${id}`).then(res => res.data),
};

// Questions API
export const questionApi = {
  getQuestionsByQuestionnaire: (questionnaireId: number): Promise<Question[]> => 
    api.get(`/api/questions/by-questionnaire/${questionnaireId}`).then(res => res.data),
  createQuestion: (data: Omit<Question, 'id'>): Promise<Question> => 
    api.post('/api/questions', data).then(res => res.data),
};

// Responses API
export const reponseApi = {
  submitReponseQuestionnaire: (data: Omit<ReponseQuestionnaire, 'id'>): Promise<ReponseQuestionnaire> => 
    api.post('/api/reponses/questionnaire', data).then(res => res.data),
  getReponsesByQuestionnaire: (questionnaireId: number): Promise<ReponseQuestionnaire[]> => 
    api.get(`/api/reponses/questionnaire/${questionnaireId}`).then(res => res.data),
  getReponsesByEnqueteur: (employeId: number): Promise<ReponseQuestionnaire[]> => 
    api.get(`/api/reponses/enqueteur/${employeId}`).then(res => res.data),
};

export default api;
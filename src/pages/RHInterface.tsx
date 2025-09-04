import React, { useEffect, useState } from "react";
import * as API from "./../api/apiRH";

type AbsenceForm = { dateDebut: string; dateFin: string; motif: string };
type ContratForm = { dateDebut: string; dateFin: string; typeContrat: string };
type DemandeForm = { typeDemande: string; description: string; dateDemande: string };
type SalaireForm = { montant: number; datePaiement: string };

export default function RHInterface() {
  const [employees, setEmployees] = useState<API.Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<API.Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showContratModal, setShowContratModal] = useState(false);
  const [showSalaireModal, setShowSalaireModal] = useState(false);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [loading, setLoading] = useState(false);

  const [absences, setAbsences] = useState<API.Absence[]>([]);
  const [demandes, setDemandes] = useState<API.DemandeAdministrative[]>([]);
  const [contrats, setContrats] = useState<API.Contrat[]>([]);
  const [salaires, setSalaires] = useState<API.Salaire[]>([]);

  const [formData, setFormData] = useState<API.Employee & { motDePasse?: string; nomDeUtilisateur?: string }>({ 
    nom: "", 
    prenom: "", 
    motDePasse: "",
    nomDeUtilisateur: ""
  });
  const [absenceForm, setAbsenceForm] = useState<AbsenceForm>({ dateDebut: "", dateFin: "", motif: "" });
  const [contratForm, setContratForm] = useState<ContratForm>({ dateDebut: "", dateFin: "", typeContrat: "" });
  const [salaireForm, setSalaireForm] = useState<SalaireForm>({ montant: 0, datePaiement: "" });
  const [demandeForm, setDemandeForm] = useState<DemandeForm>({ 
    typeDemande: "", 
    description: "", 
    dateDemande: new Date().toISOString().split('T')[0] 
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.getEmployees();
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employee: API.Employee) => {
    setLoading(true);
    try {
      setSelectedEmployee(employee);
      const [absRes, demRes, conRes, salRes] = await Promise.all([
        API.getAbsencesByEmployee(employee.id!),
        API.getDemandesByEmployee(employee.id!),
        API.getContratsByEmployee(employee.id!),
        API.getSalairesByEmployee(employee.id!),
      ]);
      setAbsences(absRes.data);
      setDemandes(demRes.data);
      setContrats(conRes.data);
      setSalaires(salRes.data);
      setActiveTab("details");
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEmployees(); 
  }, []);

  // Employee Modal
  const openEmployeeModal = (employee: API.Employee | null = null) => {
    setSelectedEmployee(employee);
    setFormData(employee || { 
      nom: "", 
      prenom: "", 
      email: "", 
      role: "",
      motDePasse: "",
      nomDeUtilisateur: ""
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async () => {
    setLoading(true);
    try {
      if (selectedEmployee?.id) {
        // For update, don't include password and username
        const { motDePasse, nomDeUtilisateur, ...updateData } = formData;
        await API.updateEmployee(selectedEmployee.id, updateData);
      } else {
        // For create, include all fields including password
        await API.addEmployee(formData);
      }
      setShowEmployeeModal(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => { 
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      setLoading(true);
      try {
        await API.deleteEmployee(id); 
        fetchEmployees(); 
      } catch (error) {
        console.error("Error deleting employee:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Absence Modal
  const openAbsenceModal = () => { 
    setAbsenceForm({ dateDebut: "", dateFin: "", motif: "" }); 
    setShowAbsenceModal(true); 
  };
  
  const handleAddAbsence = async () => { 
    if (selectedEmployee?.id) { 
      setLoading(true);
      try {
        await API.addAbsence(selectedEmployee.id, absenceForm); 
        fetchEmployeeDetails(selectedEmployee); 
        setShowAbsenceModal(false); 
      } catch (error) {
        console.error("Error adding absence:", error);
      } finally {
        setLoading(false);
      }
    } 
  };

  // Contrat Modal
  const openContratModal = () => { 
    setContratForm({ dateDebut: "", dateFin: "", typeContrat: "" }); 
    setShowContratModal(true); 
  };
  
  const handleAddContrat = async () => { 
    if (selectedEmployee?.id) { 
      setLoading(true);
      try {
        await API.addContrat(selectedEmployee.id, contratForm); 
        fetchEmployeeDetails(selectedEmployee); 
        setShowContratModal(false); 
      } catch (error) {
        console.error("Error adding contract:", error);
      } finally {
        setLoading(false);
      }
    } 
  };

  // Salaire Modal
  const openSalaireModal = () => { 
    setSalaireForm({ montant: 0, datePaiement: "" }); 
    setShowSalaireModal(true); 
  };
  
  const handleAddSalaire = async () => { 
    if (selectedEmployee?.id) { 
      setLoading(true);
      try {
        await API.addSalaire(selectedEmployee.id, salaireForm); 
        fetchEmployeeDetails(selectedEmployee); 
        setShowSalaireModal(false); 
      } catch (error) {
        console.error("Error adding salary:", error);
      } finally {
        setLoading(false);
      }
    } 
  };
  
  // Demande Modal
  const openDemandeModal = () => { 
    setDemandeForm({ 
      typeDemande: "", 
      description: "", 
      dateDemande: new Date().toISOString().split('T')[0]  
    }); 
    setShowDemandeModal(true); 
  };
  
  const handleAddDemande = async () => { 
    if (selectedEmployee?.id) { 
      setLoading(true);
      try {
        await API.addDemande(selectedEmployee.id, demandeForm); 
        fetchEmployeeDetails(selectedEmployee); 
        setShowDemandeModal(false); 
      } catch (error) {
        console.error("Error adding request:", error);
      } finally {
        setLoading(false);
      }
    } 
  };

  const handleDemandeAction = async (demandeId: number, action: "valider" | "refuser") => { 
    if (!selectedEmployee) return; 
    setLoading(true);
    try {
      if (action === "valider") await API.validerDemande(demandeId); 
      else await API.refuserDemande(demandeId); 
      fetchEmployeeDetails(selectedEmployee); 
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Function to generate random color based on employee name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8极 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 极7.938l3-2.647z"></path>
            </svg>
            <span>Chargement...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white rounded-xl shadow-sm p-极6 mb-6 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Interface Ressources Humaines</h1>
        <p className="text-gray-600">Gestion des employés, absences, contrats et salaires</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg overflow-hidden">
        <button
          className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === "employees" 
            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500" 
            : "text-gray-500 hover:text-gray-700 hover:极bg-gray-50"}`}
          onClick={() => setActiveTab("employees")}
        >
          Liste des Employés
        </button>
        {selectedEmployee && (
          <button
            className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === "details" 
              ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("details")}
          >
            Détails de {selectedEmployee.prenom} {selectedEmployee.nom}
          </button>
        )}
      </div>

      {/* Employee List */}
      {activeTab === "employees" && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Liste des Employés</h2>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center hover:shadow-md"
              onClick={() => openEmployeeModal()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter Employé
            </button>
          </div>
          
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto极 h-12 w-12 text-gray-400" fill="none" viewBox="极0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 极0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouvel employé.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => openEmployeeModal()}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M极10 5a1 1 极0 011 1v3h3a1 1 0 110 2h-3极v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nouvel employé
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.prenom}</td>
                      <td className="px-6极 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                            emp.role === 'SUPERVISEUR' ? 'bg-blue-100 text-blue-800' : 
                            emp.role === 'ENQUETEUR' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {emp.role || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-full hover:bg-blue-50"
                          onClick={() => fetchEmployeeDetails(emp)}
                          title="Voir détails"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          className="text-yellow-500 hover:text-yellow-700 transition-colors p-1.5 rounded-full hover:bg-yellow-50"
                          onClick={() => openEmployeeModal(emp)}
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20极" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-50"
                          onClick={() => handleDelete(emp.id!)}
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1极v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employee Details */}
      {activeTab === "details" && selectedEmployee && (
        <div className="space-y-6">
          {/* Employee Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="极flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getAvatarColor(selectedEmployee.nom)}`}>
                  <span className="text-2xl font-bold">{selectedEmployee.prenom[0]}{selectedEmployee.nom[0]}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedEmployee.prenom} {selectedEmployee.nom}</h2>
                  <p className="text-gray-500">{selectedEmployee.email}</p>
                  <p className="text-sm text-gray-600">Rôle: {selectedEmployee.role || "Non défini"}</p>
                </div>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                onClick={() => setActiveTab("employees")}
                title="Retour à la liste"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Absences Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Absences</h3>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-all duration-200 hover:shadow-md"
                  onClick={openAbsenceModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0极v-3H6a1 1 0 110-2h3V6a1 1 极0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter
                </button>
              </div>
              {absences.length === 0 ? (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8极 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 极0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucune absence enregistrée</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {absences.map((a) => (
                    <li key={a.id} className="border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded-r">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{a.motif}</p>
                          <p className="text-sm text-gray-500">{formatDate(a.dateDebut)} → {formatDate(a.dateFin)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Demandes Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Demandes Administratives</h3>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm极 flex items-center transition-all duration-200 hover:shadow-md"
                  onClick={openDemandeModal}
                >
                  <svg xmlns="极http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter
                </button>
              </div>
              {demandes.length === 0 ? (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucune demande administrative</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {demandes.map((d) => (
                    <li key={d.id} className={`border-l-4 pl-3 py-2 rounded-r ${d.statut === "VALIDE" ? "border-green-500 bg-green-50" : d.statut === "REFUSE" ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{d.typeDemande}</p>
                          <p className="text-sm text-gray-500">Date: {formatDate(d.dateDemande)}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${d.statut === "VALIDE" ? "bg-green-100 text-green-800" : d.statut === "REFUSE" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {d.statut}
                          </span>
                        </div>
                        {d.statut === "EN_ATTENTE" && (
                          <div className="flex space-x-1 ml-2">
                            <button 
                              className="text-green-500 hover:text-green-700 transition-colors p-1.5 rounded-full hover:bg-green-50"
                              onClick={() => handleDemandeAction(d.id!, "valider")}
                              title="Valider"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0极z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-50"
                              onClick={() => handleDemandeAction(d.id!, "refuser")}
                              title="Refuser"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 极1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contrats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Contrats</h3>
                <button 
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-all duration-200 hover:shadow-md"
                  onClick={openContratModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="current极Color">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3极h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter
                </button>
              </div>
              {contrats.length === 0 ? (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 极0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucun contrat enregistré</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {contrats.map((c) => (
                    <li key={c.id} className="border-l-4 border-purple-500 pl-3 py-2 bg-purple-50 rounded-r">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{c.typeContrat}</p>
                          <p className="text-sm text-gray-500">{formatDate(c.dateDebut)} → {formatDate(c.dateFin)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Salaires Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Salaires</h3>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-all duration-200 hover:shadow-md"
                  onClick={openSalaireModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter
                </button>
              </div>
              {salaires.length === 0 ? (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucun salaire enregistré</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {salaires.map((s) => (
                    <li key={s.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{s.montant} €</p>
                          <p className="text-sm text-gray-500">Payé le {formatDate(s.datePaiement)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedEmployee?.id ? "Modifier l'employé" : "Ajouter un employé"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom || ""}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom || ""}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPERVISEUR">Superviseur</option>
                  <option value="ENQUETEUR">Enquêteur</option>
                </select>
              </div>
              {!selectedEmployee?.id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                    <input
                      type="text"
                      value={formData.nomDeUtilisateur || ""}
                      onChange={(e) => setFormData({ ...formData, nomDeUtilisateur: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      value={formData.motDePasse || ""}
                      onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={() => setShowEmployeeModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                onClick={handleSaveEmployee}
                disabled={!formData.nom || !formData.prenom || (!selectedEmployee?.id && (!formData.nomDeUtilisateur || !formData.motDePasse))}
              >
                {selectedEmployee?.id ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Absence Modal */}
      {showAbsenceModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Ajouter une absence</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                <input
                  type="date"
                  value={absenceForm.dateDebut}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, dateDebut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                <input
                  type="date"
                  value={absenceForm.dateFin}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, dateFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
                <input
                  type="text"
                  value={absenceForm.motif}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={() => setShowAbsenceModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                onClick={handleAddAbsence}
                disabled={!absenceForm.dateDebut || !absenceForm.dateFin || !absenceForm.motif}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contrat Modal */}
      {showContratModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Ajouter un contrat</h3>
            </div>
            <div className="p-极6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
                <select
                  value={contratForm.typeContrat}
                  onChange={(e) => setContratForm({ ...contratForm, typeContrat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="INTERIM">Intérim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                <input
                  type="date"
                  value={contratForm.dateDebut}
                  onChange={(e) => setContratForm({ ...contratForm, dateDebut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={contratForm.dateFin}
                  onChange={(e) => setContratForm({ ...contratForm, dateFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={() => setShowContratModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                onClick={handleAddContrat}
                disabled={!contratForm.typeContrat || !contratForm.dateDebut}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salaire Modal */}
      {showSalaireModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Ajouter un salaire</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
                <input
                  type="number"
                  value={salaireForm.montant}
                  onChange={(e) => setSalaireForm({ ...salaireForm, montant: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
                <input
                  type="date"
                  value={salaireForm.datePaiement}
                  onChange={(e) => setSalaireForm({ ...salaireForm, datePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={() => setShowSalaireModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                onClick={handleAddSalaire}
                disabled={!salaireForm.montant || !salaireForm.datePaiement}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demande Modal */}
      {showDemandeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Ajouter une demande</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de demande *</label>
                <select
                  value={demandeForm.typeDemande}
                  onChange={(e) => setDemandeForm({ ...demandeForm, typeDemande: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="CONGE">Congé</option>
                  <option value="MISSION">Mission</option>
                  <option value="FORMATION">Formation</option>
                  <option value="MATERIEL">Matériel</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={demandeForm.description}
                  onChange={(e) => setDemandeForm({ ...demandeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de la demande *</label>
                <input
                  type="date"
                  value={demandeForm.dateDemande}
                  onChange={(e) => setDemandeForm({ ...demandeForm, dateDemande: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={() => setShowDemandeModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                onClick={handleAddDemande}
                disabled={!demandeForm.typeDemande || !demandeForm.description || !demandeForm.dateDemande}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
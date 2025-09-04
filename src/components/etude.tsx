// src/components/EtudeComponent.tsx
import React, { useState, useEffect } from "react";
import {
  getEtudes,
  getEtudeById,
  createEtude,
  updateEtude,
  deleteEtude,
  getSuperviseurByEtude,
  assignEnqueteurToEtude,
  getEnqueteursByEtude,
} from "../api/etudeApi";

interface Etude {
  id?: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  objectifQuotas: number;
}

interface Superviseur {
  id: number;
  nom: string;
  prenom: string;
}

interface Enqueteur {
  id: number;
  nom: string;
  prenom: string;
}

const EtudeComponent: React.FC = () => {
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [selectedEtude, setSelectedEtude] = useState<Etude | null>(null);
  const [superviseur, setSuperviseur] = useState<Superviseur | null>(null);
  const [enqueteurs, setEnqueteurs] = useState<Enqueteur[]>([]);
  const [assignedEnqueteurs, setAssignedEnqueteurs] = useState<Enqueteur[]>([]);
  const [selectedEnqueteurs, setSelectedEnqueteurs] = useState<number[]>([]);
  const [formData, setFormData] = useState<Etude>({
    nom: "",
    dateDebut: "",
    dateFin: "",
    objectifQuotas: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEtudes();
    fetchAllEnqueteurs();
  }, []);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchEtudes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching études from API...");
      
      const res = await getEtudes();
      console.log("📊 Full API response:", res);
      
      // Extract data from Axios response
      const etudesData = Array.isArray(res.data) ? res.data : [];
      console.log("✅ Number of études found:", etudesData.length);
      
      setEtudes(etudesData);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching etudes:", err);
      setError("Impossible de charger les études. Vérifiez le backend ou la connexion.");
      setEtudes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEnqueteurs = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/enqueteurs");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      const enqueteursData = Array.isArray(data) ? data : [];
      setEnqueteurs(enqueteursData);
    } catch (err) {
      console.error("Error fetching enqueteurs:", err);
      setEnqueteurs([]);
    }
  };

  const handleSelectEtude = async (id: number) => {
    try {
      const res = await getEtudeById(id);
      // Extract data from Axios response
      setSelectedEtude(res.data);

      // Fetch superviseur
      try {
        const superviseurRes = await getSuperviseurByEtude(id);
        setSuperviseur(superviseurRes.data);
      } catch (superviseurErr) {
        console.warn("No superviseur found for this étude:", superviseurErr);
        setSuperviseur(null);
      }

      // Fetch assigned enqueteurs
      try {
        const assignedRes = await getEnqueteursByEtude(id);
        const assignedData = Array.isArray(assignedRes.data) ? assignedRes.data : [];
        setAssignedEnqueteurs(assignedData);
      } catch (enqueteursErr) {
        console.warn("No enqueteurs found for this étude:", enqueteursErr);
        setAssignedEnqueteurs([]);
      }

      setSelectedEnqueteurs([]);
    } catch (err) {
      console.error("Error selecting etude:", err);
      setError("Erreur lors du chargement des détails de l'étude.");
    }
  };

  const handleDeleteEtude = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) {
      return;
    }
    
    try {
      await deleteEtude(id);
      fetchEtudes();
      if (selectedEtude?.id === id) setSelectedEtude(null);
      showSuccess("Étude supprimée avec succès !");
    } catch (err) {
      console.error("Error deleting etude:", err);
      setError("Erreur lors de la suppression de l'étude.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await updateEtude(formData.id, formData);
        showSuccess("Étude mise à jour avec succès !");
      } else {
        await createEtude(formData);
        showSuccess("Étude créée avec succès !");
      }
      setFormData({ nom: "", dateDebut: "", dateFin: "", objectifQuotas: 0 });
      setIsEditing(false);
      fetchEtudes();
      setError("");
    } catch (err) {
      console.error("Error saving etude:", err);
      setError("Erreur lors de la sauvegarde de l'étude.");
    }
  };

  const handleEdit = (etude: Etude) => {
    setFormData(etude);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedEnqueteurs((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleAssignEnqueteurs = async () => {
    if (!selectedEtude || selectedEnqueteurs.length === 0) return;
    try {
      for (const enqueteurId of selectedEnqueteurs) {
        await assignEnqueteurToEtude(selectedEtude.id!, enqueteurId);
      }
      showSuccess("Enquêteurs assignés avec succès !");
      setSelectedEnqueteurs([]);
      handleSelectEtude(selectedEtude.id!);
    } catch (err) {
      console.error("Error assigning enqueteurs:", err);
      setError("Erreur lors de l'assignation des enquêteurs.");
    }
  };

  // Check if your backend is running and accessible
  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/etudes');
      console.log('Backend connection status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  // Call this to check connection
  useEffect(() => {
    checkBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestion des Études</h1>
          <p className="text-gray-600">Créez et gérez vos études de marché</p>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
              <p>{success}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? "✏️ Modifier Étude" : "➕ Ajouter Étude"}
              </h2>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ nom: "", dateDebut: "", dateFin: "", objectifQuotas: 0 });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Annuler
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'étude
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Entrez le nom de l'étude"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectif Quotas
                </label>
                <input
                  type="number"
                  value={formData.objectifQuotas}
                  onChange={(e) =>
                    setFormData({ ...formData, objectifQuotas: parseInt(e.target.value) || 0 })
                  }
                  required
                  min={0}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="0"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:-translate-y-0.5 shadow-md"
              >
                {isEditing ? "Mettre à jour" : "Créer l'étude"}
              </button>
            </form>
          </div>

          {/* Liste des études */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📋 Liste des Études</h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {etudes.length} étude(s)
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement des études...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(etudes) && etudes.map((etude) => (
                  <div
                    key={etude.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      selectedEtude?.id === etude.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleSelectEtude(etude.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 hover:text-blue-600 transition">
                          {etude.nom}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>📅 {etude.dateDebut}</span>
                          <span className="mx-2">→</span>
                          <span>{etude.dateFin}</span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Quota: {etude.objectifQuotas}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(etude);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEtude(etude.id!);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {etudes.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune étude disponible</p>
                    <p className="text-sm mt-1">Créez votre première étude !</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Détails de l'étude */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 Détails de l'Étude</h2>
            
            {selectedEtude ? (
              <div className="space-y-6">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{selectedEtude.nom}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Début:</span>
                      <p className="font-medium">{selectedEtude.dateDebut}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fin:</span>
                      <p className="font-medium">{selectedEtude.dateFin}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Objectif Quotas:</span>
                      <p className="font-medium text-blue-600">{selectedEtude.objectifQuotas}</p>
                    </div>
                  </div>
                </div>

                {/* Superviseur */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">👨‍💼 Superviseur</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {superviseur ? (
                      <p className="text-sm">
                        {superviseur.prenom} {superviseur.nom}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">Non assigné</p>
                    )}
                  </div>
                </div>

                {/* Enquêteurs assignés */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">👥 Enquêteurs Assignés</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {assignedEnqueteurs.length > 0 ? (
                      <ul className="space-y-1">
                        {assignedEnqueteurs.map((enq) => (
                          <li key={enq.id} className="text-sm flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {enq.prenom} {enq.nom}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun enquêteur assigné</p>
                    )}
                  </div>
                </div>

                {/* Assigner des enquêteurs */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">➕ Assigner des Enquêteurs</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.isArray(enqueteurs) && enqueteurs.map((enq) => (
                      <label key={enq.id} className="flex items-center p-2 rounded hover:bg-gray-50 transition">
                        <input
                          type="checkbox"
                          checked={selectedEnqueteurs.includes(enq.id)}
                          onChange={() => handleCheckboxChange(enq.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm">
                          {enq.prenom} {enq.nom}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleAssignEnqueteurs}
                    disabled={selectedEnqueteurs.length === 0}
                    className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition ${
                      selectedEnqueteurs.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:-translate-y-0.5'
                    }`}
                  >
                    Assigner ({selectedEnqueteurs.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p>Sélectionnez une étude pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtudeComponent;
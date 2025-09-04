import React, { useState } from "react";

interface DemandeAdministrativeProps {
  enqueteurId: string;
}

const DemandeAdministrativeComponent: React.FC<DemandeAdministrativeProps> = ({ enqueteurId }) => {
  const [demande, setDemande] = useState("");

  const handleSubmit = () => {
    if (!demande.trim()) {
      alert("Veuillez saisir une demande avant d’envoyer.");
      return;
    }
    alert(`Demande envoyée par l'enquêteur ${enqueteurId}: ${demande}`);
    setDemande("");
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        📨 Demande Administrative (ID: {enqueteurId})
      </h3>
      <textarea
        value={demande}
        onChange={(e) => setDemande(e.target.value)}
        placeholder="Rédigez votre demande..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 mb-3"
        rows={4}
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Envoyer
      </button>
    </div>
  );
};

export default DemandeAdministrativeComponent;

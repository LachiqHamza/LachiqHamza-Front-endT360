import React, { useState } from "react";
import axios from "axios";

const CreateTache: React.FC = () => {
  const [description, setDescription] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [appelsPrevus, setAppelsPrevus] = useState<number>(0);
  const [enqueteurId, setEnqueteurId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tache = {
      description,
      dateEcheance,
      appelsPrevus,
      enqueteurId,
    };

    axios
      .post("http://localhost:8081/api/taches", tache)
      .then(() => {
        alert("Tâche créée avec succès !");
        setDescription("");
        setDateEcheance("");
        setAppelsPrevus(0);
        setEnqueteurId("");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Créer une Tâche</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded-lg space-y-4"
      >
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          value={dateEcheance}
          onChange={(e) => setDateEcheance(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Appels prévus"
          value={appelsPrevus}
          onChange={(e) => setAppelsPrevus(Number(e.target.value))}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="ID Enquêteur"
          value={enqueteurId}
          onChange={(e) => setEnqueteurId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Créer
        </button>
      </form>
    </div>
  );
};

export default CreateTache;

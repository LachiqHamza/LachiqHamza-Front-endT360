import React, { useEffect, useState } from "react";
import axios from "axios";

interface Tache {
  id: number;
  description: string;
  dateAssignation: string;
  dateEcheance: string;
}

interface MyTachesProps {
  enqueteurId: number;
}

const MyTaches: React.FC<MyTachesProps> = ({ enqueteurId }) => {
  const [taches, setTaches] = useState<Tache[]>([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/taches/enqueteur/${enqueteurId}`)
      .then((res) => setTaches(res.data))
      .catch((err) => console.error(err));
  }, [enqueteurId]);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">📋 Mes Tâches</h2>
      {taches.length === 0 ? (
        <p>Aucune tâche trouvée.</p>
      ) : (
        <ul className="space-y-3">
          {taches.map((tache) => (
            <li key={tache.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="font-semibold">{tache.description}</h3>
              <p className="text-sm text-gray-600">
                Assignée le: {tache.dateAssignation} | Échéance: {tache.dateEcheance}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyTaches;

import React, { useState, useEffect, useMemo } from "react";

interface Quota {
  id: number;
  region: string;
  enquêteur: string;
  quotaTotal: number;
  quotaComplété: number;
  dateDébut: string;
  dateFin: string;
  statut: string;
  tauxRésolution: number;
  qualitéDonnées: number;
  client: string;
  typeEnquête: string;
}

const QuotaTable: React.FC = () => {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof Quota | null; 
    direction: 'ascending' | 'descending' 
  }>({ 
    key: null, 
    direction: 'ascending' 
  });

  useEffect(() => {
    const staticQuotas: Quota[] = [
      {
        id: 1,
        region: "Île-de-France",
        enquêteur: "Pierre Martin",
        quotaTotal: 1000,
        quotaComplété: 250,
        dateDébut: "2023-10-01",
        dateFin: "2023-12-15",
        statut: "En cours",
        tauxRésolution: 78,
        qualitéDonnées: 92,
        client: "Ministère de la Santé",
        typeEnquête: "Santé publique"
      },
      {
        id: 2,
        region: "Provence-Alpes-Côte d'Azur",
        enquêteur: "Sophie Bernard",
        quotaTotal: 800,
        quotaComplété: 720,
        dateDébut: "2023-09-15",
        dateFin: "2023-11-30",
        statut: "Presque terminé",
        tauxRésolution: 85,
        qualitéDonnées: 88,
        client: "Institut National de la Statistique",
        typeEnquête: "Recensement"
      },
      {
        id: 3,
        region: "Auvergne-Rhône-Alpes",
        enquêteur: "Luc Dubois",
        quotaTotal: 1500,
        quotaComplété: 420,
        dateDébut: "2023-10-10",
        dateFin: "2024-01-20",
        statut: "En cours",
        tauxRésolution: 65,
        qualitéDonnées: 79,
        client: "Chambre de Commerce",
        typeEnquête: "Économie régionale"
      },
      {
        id: 4,
        region: "Nouvelle-Aquitaine",
        enquêteur: "Émilie Leroux",
        quotaTotal: 600,
        quotaComplété: 600,
        dateDébut: "2023-08-01",
        dateFin: "2023-10-31",
        statut: "Terminé",
        tauxRésolution: 90,
        qualitéDonnées: 95,
        client: "Université de Bordeaux",
        typeEnquête: "Recherche académique"
      },
      {
        id: 5,
        region: "Hauts-de-France",
        enquêteur: "Antoine Petit",
        quotaTotal: 1200,
        quotaComplété: 300,
        dateDébut: "2023-10-05",
        dateFin: "2023-12-20",
        statut: "En cours",
        tauxRésolution: 72,
        qualitéDonnées: 81,
        client: "Conseil Régional",
        typeEnquête: "Développement territorial"
      },
      {
        id: 6,
        region: "Occitanie",
        enquêteur: "Céline Blanc",
        quotaTotal: 900,
        quotaComplété: 180,
        dateDébut: "2023-09-20",
        dateFin: "2023-12-10",
        statut: "En retard",
        tauxRésolution: 58,
        qualitéDonnées: 76,
        client: "ARS Occitanie",
        typeEnquête: "Santé environnementale"
      },
      {
        id: 7,
        region: "Bretagne",
        enquêteur: "Thomas Legrand",
        quotaTotal: 750,
        quotaComplété: 675,
        dateDébut: "2023-08-15",
        dateFin: "2023-11-15",
        statut: "Presque terminé",
        tauxRésolution: 88,
        qualitéDonnées: 91,
        client: "Observatoire du Tourisme",
        typeEnquête: "Fréquentation touristique"
      },
      {
        id: 8,
        region: "Pays de la Loire",
        enquêteur: "Marie Moreau",
        quotaTotal: 1100,
        quotaComplété: 220,
        dateDébut: "2023-10-15",
        dateFin: "2024-01-31",
        statut: "Débuté",
        tauxRésolution: 62,
        qualitéDonnées: 84,
        client: "INSEE",
        typeEnquête: "Conditions de vie"
      }
    ];
    setQuotas(staticQuotas);
  }, []);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-green-600";
    if (percentage >= 50) return "bg-green-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case "Terminé": return "bg-green-100 text-green-800";
      case "Presque terminé": return "bg-blue-100 text-blue-800";
      case "En cours": return "bg-yellow-100 text-yellow-800";
      case "Débuté": return "bg-purple-100 text-purple-800";
      case "En retard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSort = (key: keyof Quota) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedQuotas = useMemo(() => {
    if (!sortConfig.key) return quotas;
    
    return [...quotas].sort((a, b) => {
      // Handle null or undefined values
      const aValue = a[sortConfig.key as keyof Quota];
      const bValue = b[sortConfig.key as keyof Quota];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [quotas, sortConfig]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Quotas d'Enquête</h1>
        <div className="flex space-x-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fas fa-file-export mr-2"></i> Exporter
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fas fa-plus mr-2"></i> Nouveau
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('region')}>
                Région {sortConfig.key === 'region' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('enquêteur')}>
                Enquêteur {sortConfig.key === 'enquêteur' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('quotaTotal')}>
                Quota Total {sortConfig.key === 'quotaTotal' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('quotaComplété')}>
                Complété {sortConfig.key === 'quotaComplété' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left">Progression</th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('statut')}>
                Statut {sortConfig.key === 'statut' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('tauxRésolution')}>
                Taux de Résolution {sortConfig.key === 'tauxRésolution' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('qualitéDonnées')}>
                Qualité {sortConfig.key === 'qualitéDonnées' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('client')}>
                Client {sortConfig.key === 'client' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('typeEnquête')}>
                Type d'Enquête {sortConfig.key === 'typeEnquête' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedQuotas.map(quota => {
              const progress = Math.round((quota.quotaComplété / quota.quotaTotal) * 100);
              return (
                <tr key={quota.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{quota.region}</td>
                  <td className="py-3 px-4">{quota.enquêteur}</td>
                  <td className="py-3 px-4">{quota.quotaTotal.toLocaleString()}</td>
                  <td className="py-3 px-4">{quota.quotaComplété.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quota.statut)}`}>
                      {quota.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">{quota.tauxRésolution}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="h-2.5 rounded-full bg-blue-500"
                          style={{ width: `${quota.qualitéDonnées}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{quota.qualitéDonnées}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{quota.client}</td>
                  <td className="py-3 px-4">{quota.typeEnquête}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Affichage de {sortedQuotas.length} enquêtes
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaTable;
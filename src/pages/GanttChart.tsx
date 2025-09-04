import React, { useEffect, useRef, useState } from "react";
import Gantt from "frappe-gantt";


interface GanttTask {
  id: number;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  supervisor?: string;
  client?: string;
  quotas?: number;
  completed_quotas?: number;
  required_enumerators?: number;
  available_enumerators?: number;
  status?: "on_track" | "at_risk" | "delayed";
}

interface Enumerator {
  id: number;
  name: string;
  availability: string[];
  productivity: number;
}

const GanttChart: React.FC = () => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [enumerators, setEnumerators] = useState<Enumerator[]>([]);
  const [selectedView, setSelectedView] = useState<"Day" | "Week" | "Month">("Week");
  const [selectedStudy, setSelectedStudy] = useState<GanttTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Static data for tasks/studies
    const staticTasks: GanttTask[] = [
      {
        id: 1,
        name: "Étude de marché - Produits alimentaires",
        start: "2023-10-01",
        end: "2023-11-15",
        progress: 75,
        dependencies: "",
        supervisor: "Marie Dupont",
        client: "Nestlé",
        quotas: 1000,
        completed_quotas: 750,
        required_enumerators: 15,
        available_enumerators: 12,
        status: "on_track"
      },
      {
        id: 2,
        name: "Satisfaction client - Services bancaires",
        start: "2023-10-10",
        end: "2023-11-30",
        progress: 40,
        dependencies: "",
        supervisor: "Pierre Martin",
        client: "BNP Paribas",
        quotas: 2000,
        completed_quotas: 800,
        required_enumerators: 20,
        available_enumerators: 18,
        status: "at_risk"
      },
      {
        id: 3,
        name: "Étude d'opinion politique",
        start: "2023-09-15",
        end: "2023-10-31",
        progress: 60,
        dependencies: "2",
        supervisor: "Sophie Lambert",
        client: "Ministère de l'Intérieur",
        quotas: 5000,
        completed_quotas: 3000,
        required_enumerators: 30,
        available_enumerators: 25,
        status: "delayed"
      },
      {
        id: 4,
        name: "Recherche sur les habitudes digitales",
        start: "2023-10-20",
        end: "2023-12-10",
        progress: 15,
        dependencies: "",
        supervisor: "Thomas Bernard",
        client: "Google",
        quotas: 3000,
        completed_quotas: 450,
        required_enumerators: 25,
        available_enumerators: 22,
        status: "on_track"
      },
      {
        id: 5,
        name: "Étude sur la mobilité urbaine",
        start: "2023-10-05",
        end: "2023-11-20",
        progress: 35,
        dependencies: "1",
        supervisor: "Julie Moreau",
        client: "RATP",
        quotas: 1500,
        completed_quotas: 525,
        required_enumerators: 18,
        available_enumerators: 15,
        status: "at_risk"
      }
    ];

    // Static data for enumerators
    const staticEnumerators: Enumerator[] = [
      {
        id: 1,
        name: "Jean Petit",
        availability: ["lundi", "mardi", "jeudi", "vendredi"],
        productivity: 8
      },
      {
        id: 2,
        name: "Claire Dubois",
        availability: ["mardi", "mercredi", "vendredi", "samedi"],
        productivity: 10
      },
      {
        id: 3,
        name: "Marc Lefevre",
        availability: ["lundi", "mercredi", "jeudi", "dimanche"],
        productivity: 7
      },
      {
        id: 4,
        name: "Émilie Blanc",
        availability: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
        productivity: 9
      },
      {
        id: 5,
        name: "Lucie Martin",
        availability: ["mercredi", "jeudi", "vendredi", "samedi"],
        productivity: 8
      },
      {
        id: 6,
        name: "Antoine Durand",
        availability: ["lundi", "mardi", "samedi", "dimanche"],
        productivity: 6
      },
      {
        id: 7,
        name: "Sofia Garcia",
        availability: ["mardi", "jeudi", "vendredi", "samedi", "dimanche"],
        productivity: 9
      },
      {
        id: 8,
        name: "Hugo Moreau",
        availability: ["lundi", "mercredi", "vendredi"],
        productivity: 7
      }
    ];

    setTasks(staticTasks);
    setEnumerators(staticEnumerators);
    setLoading(false);
  }, []);

  const calculateStatus = (task: GanttTask): "on_track" | "at_risk" | "delayed" => {
    const now = new Date();
    const endDate = new Date(task.end);
    const progress = task.progress || 0;
    
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const totalDays = Math.ceil((endDate.getTime() - new Date(task.start).getTime()) / (1000 * 3600 * 24));
    
    if (daysRemaining <= 0) {
      return progress >= 100 ? "on_track" : "delayed";
    }

    const expectedProgress = 100 - (daysRemaining / totalDays) * 100;

    if (progress >= expectedProgress + 10) return "on_track";
    if (progress >= expectedProgress - 10) return "at_risk";
    return "delayed";
  };

  const calculateRequiredEnumerators = (task: GanttTask): number => {
    const totalQuotas = task.quotas || 0;
    const days = Math.ceil((new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 3600 * 24));
    const avgProductivity = enumerators.reduce((sum, e) => sum + e.productivity, 0) / (enumerators.length || 1);
    
    return Math.ceil(totalQuotas / (days * avgProductivity));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track": return "bg-green-100 border-green-500 text-green-800";
      case "at_risk": return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case "delayed": return "bg-red-100 border-red-500 text-red-800";
      default: return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_track": return "✅";
      case "at_risk": return "⚠️";
      case "delayed": return "❌";
      default: return "📋";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_track": return "Dans les temps";
      case "at_risk": return "À risque";
      case "delayed": return "En retard";
      default: return "Statut inconnu";
    }
  };

  useEffect(() => {
    if (ganttRef.current && tasks.length > 0) {
      const ganttTasks = tasks.map(task => ({
        id: task.id.toString(),
        name: task.name,
        start: task.start,
        end: task.end,
        progress: task.progress,
        dependencies: task.dependencies,
        custom_class: task.status
      }));

      const gantt = new Gantt(ganttRef.current, ganttTasks, {
        view_mode: selectedView,
        on_click: (task) => {
          const selected = tasks.find(t => t.id.toString() === task.id);
          setSelectedStudy(selected || null);
        },
        on_date_change: (task, start, end) => {
          console.log("Date changed:", task, start, end);
          // Handle date changes
        }
      });

      // Add custom styling based on status
      const style = document.createElement('style');
      style.textContent = `
        .gantt .bar-wrapper .bar.on_track { 
          fill: #10b981;
          stroke: #047857;
        }
        .gantt .bar-wrapper .bar.at_risk { 
          fill: #f59e0b;
          stroke: #b45309;
        }
        .gantt .bar-wrapper .bar.delayed { 
          fill: #ef4444;
          stroke: #b91c1c;
        }
        .gantt .bar-progress { 
          fill: rgba(255,255,255,0.3); 
        }
        .gantt .grid-header { 
          fill: #f8fafc; 
          stroke: #e2e8f0;
        }
        .gantt .grid-row { 
          fill: #fff;
          stroke: #e2e8f0; 
        }
        .gantt .bar-label {
          fill: white;
          font-weight: 500;
          dominant-baseline: central;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [tasks, selectedView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planification des Études</h1>
              <p className="text-sm text-gray-600">Gestion avancée des études et ressources</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Études Actives</h3>
                <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => new Date(t.end) > new Date()).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Enquêteurs</h3>
                <p className="text-2xl font-semibold text-gray-900">{enumerators.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">À Risque</h3>
                <p className="text-2xl font-semibold text-yellow-600">{tasks.filter(t => t.status === "at_risk").length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-50">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 01118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">En Retard</h3>
                <p className="text-2xl font-semibold text-red-600">{tasks.filter(t => t.status === "delayed").length}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Planification des Études</h2>
            <p className="text-gray-600">Visualisez et gérez le planning de vos études</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as "Day" | "Week" | "Month")}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="Day">Vue Journalière</option>
                <option value="Week">Vue Hebdomadaire</option>
                <option value="Month">Vue Mensuelle</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div ref={ganttRef} className="gantt-container h-96"></div>
        </div>

        {/* Study Details Panel */}
        {selectedStudy && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de l'Étude</h3>
              <button 
                onClick={() => setSelectedStudy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'étude</label>
                  <p className="text-lg font-medium text-gray-900">{selectedStudy.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <p className="text-lg text-gray-800">{selectedStudy.client || "Non spécifié"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superviseur</label>
                  <p className="text-lg text-gray-800">{selectedStudy.supervisor || "Non assigné"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStudy.status || '')}`}>
                    <span className="mr-1">{getStatusIcon(selectedStudy.status || '')}</span>
                    {getStatusText(selectedStudy.status || '')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progression</label>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedStudy.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStudy.completed_quotas || 0} / {selectedStudy.quotas || 0} complétés ({selectedStudy.progress}%)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ressources</label>
                  <p className="text-lg text-gray-800">
                    {calculateRequiredEnumerators(selectedStudy)} enquêteurs requis
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedStudy.available_enumerators || 0} disponibles actuellement
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Exporter les Données
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
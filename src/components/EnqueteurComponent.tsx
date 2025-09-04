import React, { useState, useEffect } from "react";
import { getQuestionnaires, getQuestionsByQuestionnaire, submitReponseQuestionnaire, Questionnaire, Question, ReponseQuestion, ReponseQuestionnaire, } from "../api/enqueteurApi";
import ToDoListComponent from "./ToDoListComponent";
import DemandeAdministrativeComponent from "./DemandeAdministrativeComponent";

const EnqueteurComponent: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reponses, setReponses] = useState<Record<number, string>>({});
  const [enqueteurId, setEnqueteurId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingQuestionnaires, setIsLoadingQuestionnaires] = useState(false);
  const [activeTab, setActiveTab] = useState<"selection" | "questions">("selection");
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);

  // Sample to-do list data
  const [todos, setTodos] = useState([
    { id: 1, title: "Complete Household Survey", description: "Visit 10 households in District A", dueDate: "2023-12-15", status: "Pending" },
    { id: 2, title: "Submit Weekly Report", description: "Compile and submit data collected this week", dueDate: "2023-12-08", status: "Completed" },
    { id: 3, title: "Attend Training Session", description: "New data collection methodology training", dueDate: "2023-12-10", status: "Pending" },
    { id: 4, title: "Verify Collected Data", description: "Cross-check data from last month's surveys", dueDate: "2023-12-20", status: "In Progress" },
  ]);

  // 🔹 Charger questionnaires au montage
  useEffect(() => {
    setIsLoadingQuestionnaires(true);
    getQuestionnaires()
      .then((res) => {
        setQuestionnaires(res.data);
      })
      .catch((err: any) => {
        console.error("Erreur chargement questionnaires", err);
        setQuestionnaires([]);
      })
      .finally(() => setIsLoadingQuestionnaires(false));
  }, []);

  // 🔹 Charger questions pour un questionnaire
  const handleLoadQuestions = () => {
    if (!selectedQuestionnaire) {
      alert("Veuillez sélectionner un questionnaire d'abord.");
      return;
    }
    setIsLoadingQuestions(true);
    getQuestionsByQuestionnaire(selectedQuestionnaire)
      .then((res) => {
        setQuestions(res.data);
        setReponses({});
        setActiveTab("questions");
      })
      .catch((err: any) => console.error("Erreur chargement questions", err))
      .finally(() => setIsLoadingQuestions(false));
  };

  // 🔹 Changement de réponse
  const handleReponseChange = (questionId: number, valeur: string) => {
    setReponses({ ...reponses, [questionId]: valeur });
  };

  // 🔹 Soumission des réponses
  const handleSubmit = () => {
    if (!enqueteurId) {
      alert("Veuillez saisir votre ID d'enquêteur");
      return;
    }
    if (Object.keys(reponses).length < questions.length) {
      alert("Veuillez répondre à toutes les questions");
      return;
    }

    const reponsesToSubmit: ReponseQuestion[] = Object.entries(reponses).map(
      ([questionId, choixSelectionne]) => ({
        questionId: parseInt(questionId),
        choixSelectionne,
      })
    );

    const reponseQuestionnaire: ReponseQuestionnaire = {
      enqueteurId: parseInt(enqueteurId),
      questionnaireId: selectedQuestionnaire!,
      reponses: reponsesToSubmit,
    };

    setIsSubmitting(true);
    submitReponseQuestionnaire(reponseQuestionnaire)
      .then(() => {
        alert("Réponses enregistrées avec succès !");
        setReponses({});
        setSelectedQuestionnaire(null);
        setQuestions([]);
        setActiveTab("selection");
      })
      .catch((err: any) => {
        console.error("Erreur envoi réponses", err);
        alert(
          "Erreur lors de l'envoi des réponses: " + (err.response?.data?.message || err.message)
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const selectedQuestionnaireTitle = questionnaires.find((q) => q.id === selectedQuestionnaire)?.titre || "";

  const handleTodoClick = (id: number) => {
    setSelectedTodo(selectedTodo === id ? null : id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - To-Do List */}
<div className="w-1/4 bg-white shadow-lg p-4 overflow-y-auto">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-blue-800">To-Do List</h2>
    <button 
      onClick={() => {
        const title = prompt("Titre de la tâche :");
        if (!title) return;
        const dueDate = prompt("Date limite (YYYY-MM-DD) :");
        const description = prompt("Description :");
        const status = "Pending";

        setTodos([
          ...todos,
          { 
            id: todos.length + 1, 
            title, 
            description: description || "", 
            dueDate: dueDate || "2023-12-31", 
            status 
          }
        ]);
      }}
      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
    >
      + Ajouter
    </button>
  </div>

  <div className="space-y-2">
    {todos.map((todo) => (
      <div 
        key={todo.id} 
        className={`p-3 rounded-lg cursor-pointer transition-all ${
          selectedTodo === todo.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
        }`}
        onClick={() => handleTodoClick(todo.id)}
      >
        <div className="font-medium">{todo.title}</div>
        <div className="text-sm text-gray-500">Due: {todo.dueDate}</div>
        <div className={`text-xs inline-block px-2 py-1 rounded-full mt-1 ${
          todo.status === 'Completed' ? 'bg-green-100 text-green-800' : 
          todo.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>
          {todo.status}
        </div>
        
        {selectedTodo === todo.id && (
          <div className="mt-2 p-2 bg-white rounded border">
            <p className="text-sm">{todo.description}</p>
          </div>
        )}
      </div>
    ))}
  </div>
</div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Interface Enquêteur</h2>
                <p className="text-blue-100">Répondez aux questionnaires en ligne</p>
              </div>
            </div>
            
            {/* Create Administrative Request Button - Top Right */}
            <button 
              onClick={() => setShowDemandeForm(true)}
              className="absolute top-4 right-6 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Créer Demande Administrative
            </button>
          </div>

          {/* Administrative Request Modal */}
          {showDemandeForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Nouvelle Demande Administrative</h3>
                  <button 
                    onClick={() => setShowDemandeForm(false)} 
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
                <DemandeAdministrativeComponent enqueteurId={enqueteurId} />
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setShowDemandeForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button className={`py-2 px-4 font-medium text-sm ${
                activeTab === "selection" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`} onClick={() => setActiveTab("selection")}>
                Sélection
              </button>
              <button className={`py-2 px-4 font-medium text-sm ${
                activeTab === "questions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`} onClick={() => questions.length > 0 && setActiveTab("questions")} disabled={questions.length === 0}>
                Questions {questions.length > 0 && `(${questions.length})`}
              </button>
            </div>

            {/* Selection Tab */}
            {activeTab === "selection" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de l'enquêteur *
                  </label>
                  <input
                    type="number"
                    value={enqueteurId}
                    onChange={(e) => setEnqueteurId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Entrez votre ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionner un questionnaire *
                  </label>
                  {isLoadingQuestionnaires ? (
                    <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-500">Chargement des questionnaires...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedQuestionnaire || ""}
                      onChange={(e) => setSelectedQuestionnaire(parseInt(e.target.value) || null)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Choisissez un questionnaire</option>
                      {questionnaires.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.titre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleLoadQuestions}
                    disabled={!selectedQuestionnaire || !enqueteurId}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Commencer le questionnaire
                  </button>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-800">{selectedQuestionnaireTitle}</h3>
                  <p className="text-blue-600 text-sm">Veuillez répondre à toutes les questions</p>
                </div>
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className="text-gray-500">Chargement des questions...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 text-blue-800 font-semibold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{q.texte}</p>
                            {q.choix && q.choix.length > 0 ? (
                              <div className="space-y-2 mt-4">
                                {q.choix.map((option, optIndex) => (
                                  <label
                                    key={optIndex}
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      value={option}
                                      checked={reponses[q.id!] === option}
                                      onChange={() => handleReponseChange(q.id!, option)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-4">
                                <input
                                  type="text"
                                  value={reponses[q.id!] || ""}
                                  onChange={(e) => handleReponseChange(q.id!, e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                  placeholder="Saisissez votre réponse"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 🔹 Boutons */}
                    <div className="flex justify-between pt-4">
                      <button
                        onClick={() => setActiveTab("selection")}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || Object.keys(reponses).length < questions.length}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Envoi en cours...
                          </span>
                        ) : (
                          "Soumettre les réponses"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnqueteurComponent;
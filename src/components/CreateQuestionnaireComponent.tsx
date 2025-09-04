import React, { useState, useEffect } from 'react';
import {
  createQuestionnaire,
  createQuestion,
  getQuestionnaires,
  getQuestionsByQuestionnaire
} from '../api/enqueteurApi';

// Define TypeScript interfaces
interface ApiQuestion {
  id?: number;
  texte: string;
  choix: string[];
  questionnaire?: { id: number };
}

interface ApiQuestionnaire {
  id?: number;
  titre: string;
  questions?: ApiQuestion[];
}

interface LocalQuestion {
  id?: number;
  texte: string;
  choix: string[];
}

interface LocalQuestionnaire {
  id: number;
  titre: string;
  questions?: LocalQuestion[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const QuestionnaireManager = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [questionnaires, setQuestionnaires] = useState<LocalQuestionnaire[]>([]);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<LocalQuestionnaire | null>(null);
  const [titre, setTitre] = useState('');
  const [questions, setQuestions] = useState<LocalQuestion[]>([{ texte: '', choix: [''] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch questionnaires on component mount
  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setIsLoading(true);
      const response = await getQuestionnaires();
      const apiQuestionnaires: ApiQuestionnaire[] = response.data;
      
      // For each questionnaire, fetch its questions separately
      const questionnairesWithQuestions = await Promise.all(
        apiQuestionnaires.map(async (apiQuestionnaire) => {
          try {
            const questionsResponse = await getQuestionsByQuestionnaire(apiQuestionnaire.id!);
            return {
              id: apiQuestionnaire.id || 0,
              titre: apiQuestionnaire.titre,
              questions: questionsResponse.data || []
            };
          } catch (error) {
            console.error('Error fetching questions for questionnaire:', apiQuestionnaire.id, error);
            return {
              id: apiQuestionnaire.id || 0,
              titre: apiQuestionnaire.titre,
              questions: []
            };
          }
        })
      );
      
      setQuestionnaires(questionnairesWithQuestions);
    } catch (err) {
      const error = err as ApiError;
      console.error('Erreur lors de la récupération des questionnaires:', error);
      alert('Erreur lors du chargement des questionnaires');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new questionnaire (title only)
  const handleCreateQuestionnaire = async () => {
    if (!titre.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createQuestionnaire({ titre });
      const apiQuestionnaire: ApiQuestionnaire = response.data;
      
      const newQuestionnaire = {
        id: apiQuestionnaire.id || 0,
        titre: apiQuestionnaire.titre,
        questions: []
      };
      
      setQuestionnaires([...questionnaires, newQuestionnaire]);
      setTitre('');
      setView('list');
      alert('Questionnaire créé avec succès ! Vous pouvez maintenant y ajouter des questions.');
    } catch (err) {
      const error = err as ApiError;
      console.error('Erreur lors de la création du questionnaire:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message || 'Une erreur est survenue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open a questionnaire to add questions
  const openQuestionnaire = async (questionnaire: LocalQuestionnaire) => {
    try {
      // Fetch questions for this questionnaire
      const response = await getQuestionsByQuestionnaire(questionnaire.id);
      const apiQuestions: ApiQuestion[] = response.data || [];
      
      setCurrentQuestionnaire({
        ...questionnaire,
        questions: apiQuestions
      });
      setQuestions([{ texte: '', choix: [''] }]);
      setView('edit');
    } catch (err) {
      const error = err as ApiError;
      console.error('Erreur lors du chargement des questions:', error);
      alert('Erreur lors du chargement des questions existantes');
    }
  };

  // Add questions to an existing questionnaire
  const handleAddQuestions = async () => {
    if (!currentQuestionnaire || !currentQuestionnaire.id) {
      alert('Aucun questionnaire sélectionné');
      return;
    }

    const validQuestions = questions.filter(q => q.texte.trim() !== '')
      .map(q => ({
        ...q,
        choix: q.choix.filter(opt => opt.trim() !== '')
      }));

    if (validQuestions.length === 0) {
      alert('Veuillez ajouter au moins une question valide');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create all questions
      for (const q of validQuestions) {
        const questionData = {
          texte: q.texte,
          choix: q.choix,
          questionnaire: { id: currentQuestionnaire.id },
        };

        await createQuestion(questionData);
      }

      // Refresh the data
      await fetchQuestionnaires();
      
      setQuestions([{ texte: '', choix: [''] }]);
      alert('Questions ajoutées avec succès !');
      
      // Go back to list view
      setView('list');
    } catch (err) {
      const error = err as ApiError;
      console.error('Erreur lors de l\'ajout des questions:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message || 'Une erreur est survenue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Question handlers
  const handleAddQuestion = () => {
    setQuestions([...questions, { texte: '', choix: [''] }]);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].choix.push('');
    setQuestions(updated);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, index) => index !== qIndex);
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].choix.length <= 1) return;
    updated[qIndex].choix = updated[qIndex].choix.filter((_, index) => index !== oIndex);
    setQuestions(updated);
  };

  const handleChangeQuestionText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].texte = value;
    setQuestions(updated);
  };

  const handleChangeOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].choix[oIndex] = value;
    setQuestions(updated);
  };

  // Render questionnaire list view
  const renderQuestionnaireList = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mes Questionnaires</h2>
        <p className="text-gray-600">Gérez vos questionnaires existants</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des questionnaires...</p>
        </div>
      ) : questionnaires.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-400 text-6xl mb-4">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun questionnaire pour le moment</h3>
          <p className="text-gray-500 mb-6">Créez votre premier questionnaire pour commencer</p>
          <button
            onClick={() => setView('create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Créer un Questionnaire
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionnaires.map((questionnaire) => (
              <div key={questionnaire.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{questionnaire.titre}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{questionnaire.questions ? questionnaire.questions.length : 0} questions</span>
                  <span>ID: {questionnaire.id}</span>
                </div>
                <button
                  onClick={() => openQuestionnaire(questionnaire)}
                  className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  {questionnaire.questions && questionnaire.questions.length > 0 ? 'Modifier' : 'Ajouter des'} Questions
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <button
              onClick={() => setView('create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouveau Questionnaire
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Render questionnaire creation view
  const renderCreateQuestionnaire = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Créer un Questionnaire</h2>
        <p className="text-gray-600">Commencez par donner un titre à votre questionnaire</p>
      </div>

      {/* Title Section */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du Questionnaire *</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Entrez le titre de votre questionnaire"
          required
        />
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setView('list')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleCreateQuestionnaire}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Création...' : 'Créer le Questionnaire'}
        </button>
      </div>
    </div>
  );

  // Render questionnaire editing view (add questions)
  const renderEditQuestionnaire = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gérer les Questions</h2>
          <p className="text-gray-600">Questionnaire: {currentQuestionnaire?.titre}</p>
          {currentQuestionnaire?.questions && currentQuestionnaire.questions.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {currentQuestionnaire.questions.length} question(s) existante(s)
            </p>
          )}
        </div>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Existing Questions */}
      {currentQuestionnaire?.questions && currentQuestionnaire.questions.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions Existantes</h3>
          <div className="space-y-4">
            {currentQuestionnaire.questions.map((q, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-white p-4 rounded">
                <h4 className="font-medium text-gray-800">{q.texte}</h4>
                <ul className="mt-2 ml-4 list-disc text-gray-600">
                  {q.choix.map((option, oIndex) => (
                    <li key={oIndex}>{option}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Questions */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Nouvelles Questions</h3>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-700">Question {qIndex + 1}</h4>
              {questions.length > 1 && (
                <button
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte de la question *</label>
              <input
                type="text"
                value={q.texte}
                onChange={(e) => handleChangeQuestionText(qIndex, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre question ici"
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Options de réponse</label>
              {q.choix.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleChangeOption(qIndex, oIndex, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                  {q.choix.length > 1 && (
                    <button
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                      className="text-red-400 hover:text-red-600 transition-colors duration-200 p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => handleAddOption(qIndex)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter une option
              </button>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button 
          onClick={handleAddQuestion}
          className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter une question
        </button>
      </div>

      {/* Submit Button */}
      <div className="text-center pt-4">
        <button
          onClick={handleAddQuestions}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ajout en cours...
            </div>
          ) : (
            'Ajouter les Questions'
          )}
        </button>
      </div>
    </div>
  );

  // Render the appropriate view based on state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {view === 'list' && renderQuestionnaireList()}
      {view === 'create' && renderCreateQuestionnaire()}
      {view === 'edit' && renderEditQuestionnaire()}
    </div>
  );
};

export default QuestionnaireManager;
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Etudes from "./pages/Etudes";
import About from "./pages/About";
import RHInterface from "./pages/RHInterface";
import EnqueteurComponent from "./components/EnqueteurComponent";
import CreateQuestionnaireComponent from "./components/CreateQuestionnaireComponent";
import MyTaches from "./components/MyTaches";
import CreateTache from "./components/CreateTache";
import GanttChart from "./pages/GanttChart";
import QuotaTable from "./components/QuotaTable"
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white p-4 flex gap-6">
          <Link to="/" className="hover:underline">Accueil</Link>
          <Link to="/etudes" className="hover:underline">Etudes</Link>
          <Link to="/rh" className="hover:underline">Gestion RH</Link>
          <Link to="/enqueteur" className="hover:underline">Enquêteur</Link>
          <Link to="/create-questionnaire" className="hover:underline">Créer Questionnaire</Link>
          <Link to="/my-taches" className="hover:underline">Mes Tâches</Link>
          <Link to="/create-tache" className="hover:underline">Créer Tâche</Link>
          <Link to="/gantt" className="hover:underline">Gantt</Link>
          <Link to="/quotas" className="hover:underline">Quotas</Link>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/etudes" element={<Etudes />} />
            <Route path="/about" element={<About />} />
            <Route path="/rh" element={<RHInterface />} />
            <Route path="/enqueteur" element={<EnqueteurComponent />} />
            <Route path="/create-questionnaire" element={<CreateQuestionnaireComponent />} />
            <Route path="/my-taches" element={<MyTaches enqueteurId={3} />} />
            <Route path="/create-tache" element={<CreateTache />} />
            <Route path="/gantt" element={<GanttChart />} /> 
            <Route path="/quotas" element={<QuotaTable />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
import Login from './pages/Login/Login';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import MaraudrApp from "./pages/MaraudrApp.tsx";
import Stock from "./pages/Stock/Stock.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Plan from "./pages/plan/plan.tsx";
import Setting from "./pages/setting/setting.tsx";
import About from "./pages/About/About.tsx";
import Team from "./pages/team/team.tsx";

// Composant pour les routes protégées
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

function App() {
  const { i18n } = useTranslation();

  // Effet pour mettre à jour l'attribut lang de la balise html
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider>
      <Router>
        <Header />
        <main className="pt-16 px-4 min-h-screen bg-white dark:bg-gray-900 transition-colors">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/maraudApp"
                element={<ProtectedRoute element={<MaraudrApp />} />}
            >
              {/* Redirection par défaut vers le dashboard */}
              <Route index element={<Navigate to="/maraudApp/dashboard" replace />} />
              <Route path="dashboard" element={<DashBoard />} />
              <Route path="stock" element={<Stock />} />
              <Route path="map" element={<Plan/>} />
              <Route path="setting" element={<Setting/>} />
              <Route path="about" element={<About/>} />
              <Route path="team" element={<Team/>} />
              <Route path="profile" element={<ProtectedRoute element={<Profile />} />} />
            </Route>

            {/* autres routes */}
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;

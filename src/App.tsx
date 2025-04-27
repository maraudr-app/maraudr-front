import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
import Login from './pages/Login/Login';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

// Composant pour les routes protégées
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

function App() {
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effet pour vérifier l'authentification
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(auth === 'true');
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

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
            <Route path="/dashboard" element={<ProtectedRoute element={<DashBoard />} />} />
            <Route path="/login" element={<Login />} />
            {/* autres routes */}
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;

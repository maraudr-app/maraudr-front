import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
import Login from './pages/Login/Login';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';


// ... autres pages

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
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/login" element={<Login />} />
            {/* autres routes */}
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;

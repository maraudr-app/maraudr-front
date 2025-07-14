import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
import Login from './pages/Login/Login';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useAssoStore } from './store/assoStore';
import MaraudrApp from "./pages/MaraudrApp.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Plan from "./pages/plan/plan.tsx";
import Setting from "./pages/setting/setting.tsx";
import Team from "./pages/team/team.tsx";
import Planning from "./pages/planing/planing.tsx";
import CreateAccount from './pages/Register/createAccount.tsx';
import AcceptInvitation from './pages/Register/AcceptInvitation.tsx';
import CreateAsso from './pages/Association/CreateAsso.tsx';
import ForgotPassword from './pages/Login/ForgotPassword.tsx';
import ResetPassword from './pages/Login/ResetPassword.tsx';
import { Toaster } from 'react-hot-toast';
import AssoInformation from "./pages/Association/AssoInformation.tsx";
import { Stock } from './pages/Stock/Stock.tsx';
import NotificationManager from './pages/NotificationManager/NotificationManager.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAssociationRoute from './components/common/ProtectedAssociationRoute';
import Error401 from './pages/Error401';
import Error404 from './pages/Error404';
import Media from './pages/Media/Media';
import McpServer from './pages/McpServer';
import EventHistoryPage from './pages/planing/EventHistoryPage';

function App() {
  const { i18n } = useTranslation();
  const { isAuthenticated, user, fetchUser } = useAuthStore();
  const { associations } = useAssoStore();

  // Effet pour mettre à jour l'attribut lang de la balise html
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Effet pour initialiser l'authentification au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && user && (!user.firstName || !user.lastName)) {
        try {
          await fetchUser();
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, user, fetchUser]);

  // Fonction pour déterminer la redirection intelligente
  const getSmartRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Home />; // Page d'accueil
    }

    if (user.userType === 'Manager' && associations.length === 0) {
      return <Navigate to="/maraudApp/create-asso" replace />; // Créer association
    }

    return <Navigate to="/maraudApp/dashboard" replace />; // Dashboard
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Page d'erreur 401 sans Header (utilisateur non connecté) */}
          <Route path="/401" element={<Error401 />} />

          {/* Routes avec Header */}
          <Route path="*" element={
            <>
        <Header />
        <main className="pt-16 min-h-screen bg-white dark:bg-gray-900 transition-colors">
          <Routes>
                  {/* Routes publiques */}
            <Route path="/" element={getSmartRedirect()} />
                  <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
                  <Route path="/forgot-password" element={<ProtectedRoute requireAuth={false}><ForgotPassword /></ProtectedRoute>} />
                  <Route path="/reset-password" element={<ProtectedRoute requireAuth={false}><ResetPassword /></ProtectedRoute>} />
                  <Route path="/createAccount" element={<ProtectedRoute requireAuth={false}><CreateAccount /></ProtectedRoute>} />
                  <Route path="/register" element={<ProtectedRoute requireAuth={false}><CreateAccount /></ProtectedRoute>} />
                  <Route path="/accept-invitation" element={<ProtectedRoute requireAuth={false}><AcceptInvitation /></ProtectedRoute>} />

                  {/* Routes protégées */}
            <Route
                path="/maraudApp"
                      element={<ProtectedRoute><MaraudrApp /></ProtectedRoute>}
            >
              {/* Redirection par défaut vers le dashboard */}
              <Route index element={<Navigate to="/maraudApp/dashboard" replace />} />
                    <Route path="dashboard" element={
                      <ProtectedAssociationRoute 
                        title="Bienvenue sur votre dashboard"
                        message=""
                      >
                        <DashBoard />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="stock" element={
                      <ProtectedAssociationRoute 
                        title="Gestion du stock"
                        message=""
                      >
                        <Stock />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="map" element={
                      <ProtectedAssociationRoute 
                        title="Planification des maraudes"
                        message=""
                      >
                        <Plan/>
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="setting" element={
                      <ProtectedAssociationRoute 
                        title="Paramètres"
                        message=""
                      >
                        <Setting/>
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="team" element={
                      <ProtectedAssociationRoute 
                        title="Gestion d'équipe"
                        message=""
                      >
                        <Team/>
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="planing" element={
                      <ProtectedAssociationRoute 
                        title="Planning"
                        message=""
                      >
                        <Planning/>
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="planing/history" element={
                      <ProtectedAssociationRoute title="Historique des événements" message="">
                        <EventHistoryPage />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedAssociationRoute 
                        title="Profil"
                        message=""
                      >
                        <Profile />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="notification-manager" element={
                      <ProtectedAssociationRoute 
                        title="Notifications"
                        message=""
                      >
                        <NotificationManager />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="create-asso" element={<CreateAsso />} />
                    <Route path="gallery" element={
                      <ProtectedAssociationRoute 
                        title="Galerie et documents"
                        message=""
                      >
                        <Media />
                      </ProtectedAssociationRoute>
                    } />
                    <Route path="mcp-server" element={
                      <ProtectedAssociationRoute 
                        title="Assistance IA"
                        message=""
                      >
                        <McpServer />
                      </ProtectedAssociationRoute>
                    } />

            </Route>
                  
                  {/* Route publique pour les informations d'association */}
            <Route path="/association-info" element={<AssoInformation/>} />

                  {/* Page d'erreur 404 avec Header (utilisateur connecté ou page publique inexistante) */}
                  <Route path="/404" element={<><Header noSidebar={true} /><Error404 /></>} />

                  {/* Route 404 par défaut - doit être en dernier */}
                  <Route path="*" element={<><Header noSidebar={true} /><Error404 /></>} />
          </Routes>
        </main>
            </>
          } />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;

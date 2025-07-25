import { useState } from 'react';
import { GoogleButton } from '../../components/common/button/googleButton';
import { MicrosoftButton } from '../../components/common/button/microsoftButton';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/pictures/access-key.jpg';
import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useLoginNavigation } from '../../hooks/useLoginNavigation';
import { useAuthStore } from '../../store/authStore';
import { assoService } from '../../services/assoService';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleCloseLoginPage } = useLoginNavigation();
  const login = useAuthStore(state => state.login);

  // Fonction pour les traductions d'authentification (même pattern que les autres composants)
  const t_auth = (key: string): string => {
    return t(`auth.${key}` as any);
  };

  // Hide login button in navbar when on home page
  const isHomePage = location.pathname === '/';
  if (isHomePage) {
    // Vérifier si le bouton est visible dans la vue
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
      const rect = loginButton.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      // Si le bouton n'est pas visible, on affiche le bouton dans la navbar
      if (!isVisible) {
        return null;
      }
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        const user = useAuthStore.getState().user;
        if (!user || !user.sub) {
          throw new Error('User not authenticated or user ID not found.');
        }

        // Toujours rediriger vers le dashboard après connexion
        // Le dashboard et MaraudrApp géreront le chargement des associations
          navigate('/maraudApp/dashboard');
      } else {
        // Si login retourne false, c'est une erreur d'authentification
       
        setError(t_auth('invalidCredentials'));
      }
    } catch (error: any) {

      
      // Gérer différents types d'erreurs avec les traductions appropriées
      if (error.message?.includes('User not authenticated')) {
        setError(t_auth('authenticationError'));
      } else if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
        setError(t_auth('networkError'));
      } else if (error.response?.status === 401) {
        setError(t_auth('invalidCredentials'));
      } else if (error.response?.status === 403) {
        setError(t_auth('accountBlocked'));
      } else if (error.response?.status >= 500) {
        setError(t_auth('serverError'));
      } else if (error.response?.data?.message) {
        // Si le backend retourne un message d'erreur spécifique, l'utiliser
        setError(error.response.data.message);
      } else {
        setError(t_auth('loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'aide pour gérer le clic du bouton
  const handleButtonClick = () => {
    // Ne fait rien, car le formulaire gère déjà la soumission
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center mt-10 pt-10 pb-10 transition-colors">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
          {/* Partie gauche - Formulaire */}
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 pb-10 border-r border-gray-200 dark:border-gray-700 transition-colors">
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <LockClosedIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
     
                {t_auth('welcome')}
              </h2>
        
              <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">{t_auth('login')}</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  required
       
                  placeholder={t_auth('email')}
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
      
                  placeholder={t_auth('password')}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
       
                    {t_auth('remember')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
     
                    {t_auth('forgot')}
                  </Link>
                </div>
              </div>

              {/* Afficher l'erreur s'il y en a une */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mt-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de connexion avec état de chargement */}
              <Button
                onClick={handleButtonClick}
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
      
                {t_auth('loginButton')}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
      
                  {t_auth('noAccount')}{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
      
                    {t_auth('register')}
                  </Link>
                </span>
              </div>
            </form>

           
          </div>

          {/* Partie droite - Image */}
          <div className="hidden md:block w-1/2 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <button
              onClick={handleCloseLoginPage}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
              aria-label="Close"
              data-testid="close-login-button"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <img 
              src={loginImage} 
              alt="Illustration" 
              className="w-full h-full object-cover opacity-100 dark:opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

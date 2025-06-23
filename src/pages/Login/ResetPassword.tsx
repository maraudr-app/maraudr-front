import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/common/button/button';
import { Input } from '../../components/common/input/input';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import loginImage from '../../assets/pictures/access-key.jpg';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Récupérer le token depuis l'URL
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Token de réinitialisation manquant ou invalide.');
    }
  }, [searchParams]);

  const validatePassword = (password: string): boolean => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }

    if (!token) {
      setError('Token de réinitialisation manquant.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.confirmResetPassword(token, newPassword);
      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen transition-colors">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
            {/* Partie gauche - Message de succès */}
            <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 pb-10 border-r border-gray-200 dark:border-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Mot de passe réinitialisé !
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Votre mot de passe a été mis à jour avec succès.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Vous allez être redirigé vers la page de connexion dans quelques secondes...
                </p>
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  Se connecter maintenant
                </Link>
              </div>
            </div>

            {/* Partie droite - Image */}
            <div className="w-full md:w-1/2 relative">
              <img 
                src={loginImage} 
                alt="Password reset success" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-green-900 opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">Bienvenue !</h3>
                  <p className="text-green-100">
                    Votre compte est maintenant sécurisé
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen transition-colors">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
          {/* Partie gauche - Formulaire */}
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 pb-10 border-r border-gray-200 dark:border-gray-700 transition-colors">
            <div className="mb-6">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
              >
                ← Retour à la connexion
              </Link>

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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Nouveau mot de passe
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors mt-2">
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <Input
                  id="new-password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Indicateur de force du mot de passe */}
              {newPassword && (
                <div className="text-sm">
                  <div className="flex space-x-1 mb-2">
                    <div className={`h-1 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Le mot de passe doit contenir 8 caractères, une majuscule, une minuscule et un chiffre.
                  </p>
                </div>
              )}

              {/* Afficher l'erreur s'il y en a une */}
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  {error}
                </div>
              )}

              {/* Bouton de soumission */}
              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || !token}
                isLoading={isLoading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </div>

          {/* Partie droite - Image */}
          <div className="w-full md:w-1/2 relative">
            <img 
              src={loginImage} 
              alt="Reset password" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900 opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Sécurité renforcée</h3>
                <p className="text-blue-100">
                  Créez un mot de passe fort pour protéger votre compte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 
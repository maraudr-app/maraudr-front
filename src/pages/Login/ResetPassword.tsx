import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/common/button/button';
import { Input } from '../../components/common/input/input';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import loginImage from '../../assets/pictures/access-key.jpg';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { getPasswordStrength } from '../../utils/passwordStrength';
import PasswordStrengthToast from '../../components/common/toast/PasswordStrengthToast';

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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);
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

  const passwordStrength = getPasswordStrength(newPassword);

  const isValid = {
    password: passwordStrength.strength >= 3,
    confirmPassword: newPassword === confirmPassword && confirmPassword.length > 0
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
    if (value.length > 0) {
      const { strength } = getPasswordStrength(value);
      if (strength < 2) {
        setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre");
      } else {
        setPasswordError(undefined);
      }
    } else {
      setPasswordError(undefined);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value.length > 0) {
      if (value !== newPassword) {
        setConfirmPasswordError("Les mots de passe ne correspondent pas");
      } else {
        setConfirmPasswordError(undefined);
      }
    } else {
      setConfirmPasswordError(undefined);
    }
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

    if (passwordStrength.strength < 3) {
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
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  error={passwordError}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pr-10"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
                {isPasswordFocused && (
                  <PasswordStrengthToast 
                    strength={passwordStrength.strength * 25}
                    label={passwordStrength.label}
                    message={passwordStrength.message}
                  />
                )}
              </div>

              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  error={confirmPasswordError}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pr-10"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

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
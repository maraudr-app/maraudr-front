import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/button/button';
import { Input } from '../../components/common/input/input';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import loginImage from '../../assets/pictures/access-key.jpg';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
      setIsEmailSent(true);
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen transition-colors">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
            {/* Partie gauche - Message de confirmation */}
            <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 pb-10 border-r border-gray-200 dark:border-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Email envoyé !
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email de réinitialisation.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Vérifiez votre boîte de réception et vos spams. Le lien expire dans 24 heures.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setIsEmailSent(false);
                      setEmail('');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Renvoyer l'email
                  </Button>
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>

            {/* Partie droite - Image */}
            <div className="w-full md:w-1/2 relative">
              <img 
                src={loginImage} 
                alt="Forgot password" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900 opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">Récupération sécurisée</h3>
                  <p className="text-blue-100">
                    Votre sécurité est notre priorité
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
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>

              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <EnvelopeIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Mot de passe oublié ?
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors mt-2">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Afficher l'erreur s'il y en a une */}
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  {error}
                </div>
              )}

              {/* Bouton d'envoi avec état de chargement */}
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                isLoading={isLoading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Se connecter
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Partie droite - Image */}
          <div className="w-full md:w-1/2 relative">
            <img 
              src={loginImage} 
              alt="Forgot password" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900 opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Récupération de compte</h3>
                <p className="text-blue-100">
                  Nous vous aidons à retrouver l'accès à votre compte en toute sécurité
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 
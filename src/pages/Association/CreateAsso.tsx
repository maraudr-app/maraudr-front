import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { FaCheckCircle, FaTimesCircle, FaBuilding } from 'react-icons/fa';
import { validateSiret } from '../../utils/siretValidation';
import { toast } from 'react-hot-toast';
import { assoService } from '../../services/assoService';
import { useAuthStore } from '../../store/authStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateAsso = () => {
  const [siret, setSiret] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
    setSiret(value);
    
    if (value.length === 14) {
      setIsValid(validateSiret(value));
    } else {
      setIsValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast.error('Veuillez entrer un numéro SIRET valide');
      return;
    }

    setIsLoading(true);
    try {
      const user = useAuthStore.getState().user;
      if (!user || !user.sub) {
        throw new Error('User not authenticated or user ID not found.');
      }
      const response = await assoService.createAssociation(siret, user.sub);
      toast.success('Association créée avec succès !');
      navigate('/maraudApp/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue lors de la création de l\'association';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden relative">
          {/* Bouton de fermeture */}
          <button
            onClick={() => navigate('/maraudApp/dashboard')}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Partie gauche - Fond coloré avec icône */}
          <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center">
            <div className="text-center text-white p-8">
              <FaBuilding className="h-24 w-24 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Créez votre association</h3>
              <p className="text-blue-100">
                Commencez votre aventure en entrant le numéro SIRET de votre association
              </p>
            </div>
          </div>

          {/* Partie droite - Formulaire */}
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Créer votre association
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Entrez le numéro SIRET de votre association pour commencer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro SIRET
                </label>
                <div className="relative">
                  <Input
                    id="siret"
                    name="siret"
                    type="text"
                    value={siret}
                    onChange={handleSiretChange}
                    placeholder="Entrez les 14 chiffres du SIRET"
                    className={`pr-10 ${
                      isValid === null
                        ? 'border-gray-300'
                        : isValid
                        ? 'border-green-500'
                        : 'border-red-500'
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isValid === null ? null : isValid ? (
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FaTimesCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                {siret.length > 0 && siret.length < 14 && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {14 - siret.length} chiffres restants
                  </p>
                )}
                {isValid === false && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Numéro SIRET invalide
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                Valider
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAsso; 
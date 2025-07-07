import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { FaCheckCircle, FaTimesCircle, FaBuilding, FaUsers, FaChartLine, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { validateSiret } from '../../utils/siretValidation';
import { toast } from 'react-hot-toast';
import { assoService } from '../../services/assoService';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';

const CreateAsso = () => {
  const [siret, setSiret] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const associations = useAssoStore(state => state.associations);
  const isManager = user?.userType === 'Manager';
  const isLoadingAssociations = useAssoStore(state => state.isLoading);

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Attendre la fin du chargement des associations avant d'afficher le formulaire
  useEffect(() => {
    if (isLoadingAssociations) return;
    // On ne redirige plus automatiquement - un manager peut créer plusieurs associations
  }, [isLoadingAssociations]);

  // Afficher un loader tant que le chargement n'est pas terminé
  if (isLoadingAssociations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des associations...</p>
        </div>
      </div>
    );
  }

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
    setSiret(value);
    
    // Effacer l'erreur API quand l'utilisateur modifie le SIRET
    setApiError(null);
    
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
    setApiError(null); // Effacer les erreurs précédentes
    
    try {
      const user = useAuthStore.getState().user;
      if (!user || !user.sub) {
        throw new Error('User not authenticated or user ID not found.');
      }
      
      // Créer l'association avec uniquement le SIRET
      const response = await assoService.createAssociation(siret);
      toast.success('Association créée avec succès !');
      
      // Récupérer la nouvelle association créée et la définir comme courante
      try {
        // Récupérer toutes les associations de l'utilisateur (incluant la nouvelle)
        await useAssoStore.getState().fetchUserAssociations();
        
        // Trouver la nouvelle association créée (celle avec le SIRET qu'on vient de créer)
        const associations = useAssoStore.getState().associations;
        const newAssociation = associations.find(asso => asso.siret === siret);
        
        if (newAssociation) {
          // Définir cette nouvelle association comme association courante
          useAssoStore.getState().setSelectedAssociation(newAssociation);
          toast.success(`Association "${newAssociation.name}" sélectionnée !`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la nouvelle association:', error);
        // Même en cas d'erreur, on continue vers le dashboard
      }
      
      // Rediriger vers le dashboard
      navigate('/maraudApp/dashboard');
    } catch (error: any) {
      // Récupérer le message d'erreur spécifique de l'API
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Une erreur est survenue lors de la création de l\'association';
      setApiError(errorMessage);
      console.error('Erreur création association:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900">
      {/* Header compact */}
      <div className="py-6 border-b border-orange-200/50 dark:border-gray-700 sticky top-0 z-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-maraudr-blue dark:text-maraudr-orange mb-2 text-center">
              Créer une association
            </h1>

          </div>
                    </div>
                  </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* En-tête de la carte */}
          <div className="bg-gradient-to-r from-maraudr-blue to-maraudr-orange p-6 dark:text-white text-white">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FaBuilding className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Nouvelle association</h2>
                    </div>
            <p className="text-white/90">
              Créez votre association pour commencer à gérer vos équipes et vos actions
                    </p>
                  </div>

          {/* Formulaire */}
          <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="siret" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Numéro SIRET de votre association
                      </label>
                      <div className="relative">
                        <Input
                          id="siret"
                          name="siret"
                          type="text"
                          value={siret}
                          onChange={handleSiretChange}
                          placeholder="Ex: 12345678901234"
                    className="text-lg py-4 pr-12 border-2 border-gray-200 dark:border-gray-600 focus:border-maraudr-blue dark:focus:border-maraudr-orange bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          {isValid === null ? (
                            <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-600"></div>
                          ) : isValid ? (
                            <FaCheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <FaTimesCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Indicateur de progression */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progression</span>
                          <span>{siret.length}/14</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
                          <div 
                      className="bg-gradient-to-r from-maraudr-blue to-maraudr-orange h-2 rounded transition-all duration-300"
                            style={{ width: `${(siret.length / 14) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {siret.length > 0 && siret.length < 14 && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Encore {14 - siret.length} chiffres à saisir
                        </p>
                      )}
                      {isValid === false && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                          <FaTimesCircle className="h-4 w-4" />
                          <span>Ce numéro SIRET n'est pas valide</span>
                        </p>
                      )}
                      {isValid === true && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center space-x-2">
                          <FaCheckCircle className="h-4 w-4" />
                          <span>Numéro SIRET valide !</span>
                        </p>
                      )}
                
                {/* Message d'erreur API */}
                {apiError && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FaTimesCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                          Erreur lors de la création
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {apiError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                    </div>

              {isManager && (
                    <Button
                      type="submit"
                      className={`w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 ${
                    isValid && !apiError
                      ? 'bg-gradient-to-r from-maraudr-blue to-maraudr-orange hover:from-maraudr-orange hover:to-maraudr-blue text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                  disabled={!isValid || isLoading || !!apiError}
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Création en cours...' : 'Créer mon association'}
                    </Button>
              )}
              {!isManager && (
                <p className="mt-2 text-sm text-orange-700 dark:text-orange-300 text-center">
                  Seuls les managers peuvent créer une association.
                </p>
              )}
                  </form>

            {/* Avantages */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Que pouvez-vous faire avec votre association ?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaUsers className="w-5 h-5 text-maraudr-blue mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Gestion d'équipe</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Organisez vos bénévoles et membres</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <FaChartLine className="w-5 h-5 text-maraudr-orange mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Suivi d'actions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mesurez l'impact de vos activités</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FaShieldAlt className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Sécurité</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vos données sont protégées</p>
                  </div>
                </div>
              </div>
            </div>

                  {/* Note informative */}
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      <strong>Note :</strong> Le numéro SIRET permet de vérifier l'existence légale de votre association. 
                      Toutes vos données restent confidentielles et sécurisées.
                    </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAsso; 
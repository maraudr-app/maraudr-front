import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { FaCheckCircle, FaTimesCircle, FaBuilding, FaUsers, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { validateSiret } from '../../utils/siretValidation';
import { toast } from 'react-hot-toast';
import { assoService } from '../../services/assoService';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { XMarkIcon } from '@heroicons/react/24/outline';
import createAssoImage from '../../assets/pictures/createAsso.jpg';

const CreateAsso = () => {
  const [siret, setSiret] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Vérifier si l'utilisateur est manager, sinon rediriger
  useEffect(() => {
    if (isAuthenticated && user) {
      // Si l'utilisateur n'a pas userType, recharger les données
      if (!user.userType || !user.firstName || !user.lastName) {
        console.log('User data incomplete, reloading...');
        useAuthStore.getState().fetchUser().then(() => {
          const updatedUser = useAuthStore.getState().user;
          if (updatedUser && updatedUser.userType !== 'Manager') {
            console.log('User is not manager, redirecting to dashboard');
            toast.error('Vous n\'avez pas les permissions pour créer une association');
            navigate('/maraudApp/dashboard');
          }
        });
      } else if (user.userType !== 'Manager') {
        console.log('User is not manager, redirecting to dashboard');
        toast.error('Vous n\'avez pas les permissions pour créer une association');
        navigate('/maraudApp/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
      
      // Créer l'association avec uniquement le SIRET
      const response = await assoService.createAssociation(siret);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header avec navigation */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-orange-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FaBuilding className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                Maraudr
              </h1>
            </div>
            <button
              onClick={() => navigate('/maraudApp/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Créez votre association
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Donnez vie à votre projet associatif et commencez à faire la différence dans votre communauté
            </p>
          </div>

                     {/* Carte principale */}
           <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-orange-200/50 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row">
              {/* Section gauche - Image et avantages */}
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-blue-600/90 z-10"></div>
                <img 
                  src={createAssoImage} 
                  alt="Création d'association" 
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center text-white">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6">
                    Pourquoi créer votre association ?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaUsers className="h-5 w-5" />
                      </div>
                      <span className="text-lg">Gérez efficacement vos équipes</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaChartLine className="h-5 w-5" />
                      </div>
                      <span className="text-lg">Suivez vos actions et leur impact</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="h-5 w-5" />
                      </div>
                      <span className="text-lg">Sécurisez vos données</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section droite - Formulaire */}
              <div className="lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FaBuilding className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Informations légales
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Entrez le numéro SIRET pour valider votre association
                    </p>
                  </div>

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
                          className="text-lg py-4 pr-12 border-none outline-none bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300"
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
                            className="bg-gradient-to-r from-orange-500 to-blue-500 h-2 rounded transition-all duration-300"
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
                    </div>

                    <Button
                      type="submit"
                      className={`w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        isValid 
                          ? 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isValid || isLoading}
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Création en cours...' : 'Créer mon association'}
                    </Button>
                  </form>

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
        </div>
      </div>
    </div>
  );
};

export default CreateAsso; 
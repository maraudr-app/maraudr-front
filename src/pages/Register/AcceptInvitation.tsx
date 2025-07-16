import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Input } from "../../components/common/input/input";
import { FaCheckCircle, FaEye, FaEyeSlash, FaEnvelope, FaBuilding } from "react-icons/fa";
import PasswordStrengthToast from "../../components/common/toast/PasswordStrengthToast";
import { getPasswordStrength } from "../../utils/passwordStrength";
import Button from "../../components/common/button/button";
import { useTranslation } from "react-i18next";
import { userService } from "../../services/userService";
import { assoService } from "../../services/assoService";
import axios from "axios";
import { Language } from "../../types/enums/Language";
import { toast } from "react-hot-toast";
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { authService } from "../../services/authService";

// Interface pour le formulaire
interface InvitationFormData {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  password: string;
  confirmPassword: string;
  languages: string[];
}

const AcceptInvitation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // États pour le token et les données d'invitation
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [associationName, setAssociationName] = useState<string | null>(null);
  const [inviterFirstName, setInviterFirstName] = useState<string>('');
  const [inviterLastName, setInviterLastName] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // États pour le formulaire
  const [form, setForm] = useState<InvitationFormData>({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    password: "",
    confirmPassword: "",
                    languages: ['French'],
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Récupérer et valider le token d'invitation depuis l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      // @ts-ignore
      toast.error('Token d\'invitation manquant');
      // ❌ SUPPRIMÉ : navigate('/login'); 
      // ✅ On reste sur la page pour que l'utilisateur puisse voir l'erreur
      setAssociationName(null);
      setIsLoadingToken(false);
      return;
    }
    setInvitationToken(token);

    const fetchInvitationData = async () => {
      setIsLoadingToken(true);
      try {
        // 1. Valider le token et récupérer l'id de l'asso
        const data = await authService.decodeInvitationToken(token);
        const associationId = data.associationId;

        // 2. Stocker les informations de l'inviteur
        setInviterFirstName(data.managerFirstName);
        setInviterLastName(data.managerLastName);

        // 3. Récupérer les infos de l'asso avec la nouvelle fonction
        const asso = await assoService.getAssociationByIdForInvitation(associationId);
        setAssociationName(asso.name);

        // 4. Pré-remplir l'email si dispo
        if (data.invitedEmail) {
          setForm(prev => ({ ...prev, email: data.invitedEmail }));
        }
      } catch (error) {
        console.log('❌ Erreur lors du décodage du token d\'invitation:', error);
        // @ts-ignore
        toast.error('Invitation invalide ou expirée');
        setAssociationName(null);
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchInvitationData();
  }, [searchParams]);  // ❌ SUPPRIMÉ : navigate de la dépendance pour éviter les redirections

  const passwordStrength = getPasswordStrength(form.password);

  const isValid = {
    firstname: form.firstname.length > 2,
    lastname: form.lastname.length > 2,
    email: form.email.includes("@"),
    phoneNumber: form.phoneNumber.length >= 10,
    street: form.street.length > 0,
    city: form.city.length > 0,
    state: form.state.length > 0,
    postalCode: form.postalCode.length > 0,
    country: form.country.length > 0,
    password: passwordStrength.strength >= 3,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      const { strength } = getPasswordStrength(value);
      if (strength < 2) {
        setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre");
      } else {
        setPasswordError(undefined);
      }
    }

    if (name === "confirmPassword") {
      if (value !== form.password) {
        setConfirmPasswordError("Les mots de passe ne correspondent pas");
      } else {
        setConfirmPasswordError(undefined);
      }
    }
  };

  // Fonction pour nettoyer tous les messages d'erreur et de succès
  const clearMessages = () => {
    setFormError(null);
    setApiError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages(); // Nettoyer tous les messages précédents
    setIsLoading(true);

    console.log('🚀 Début de la soumission du formulaire d\'invitation');

    try {
      if (form.password !== form.confirmPassword) {
        console.log('❌ Erreur: Les mots de passe ne correspondent pas');
        // @ts-ignore
        setFormError(t('register.passwordMatchError'));
        return;
      }

      if (passwordError || confirmPasswordError) {
        console.log('❌ Erreur: Erreurs de validation du mot de passe');
        // @ts-ignore
        setFormError(t('register.formError'));
        return;
      }

      if (!invitationToken || !associationName) {
        console.log('❌ Erreur: Données d\'invitation manquantes', { invitationToken, associationName });
        setFormError('Données d\'invitation manquantes');
        return;
      }

      // Préparer les données pour l'API avec le managerToken
      const userData = {
        ...form,
        isManager: false, // Toujours false pour une invitation
        managerToken: invitationToken, // Utiliser le token d'invitation comme managerToken
        languages: form.languages,
      };

      console.log('📡 Données formatées pour l\'API d\'invitation:', userData);
      console.log('🔑 Token d\'invitation utilisé:', invitationToken);
      
      const response = await userService.createAccount(userData);
      
      console.log('✅ Réponse de l\'API - Succès:', response);
      
      if (response) {
        console.log('🎉 Compte créé avec succès, reste sur la page');
        setSuccessMessage('🎉 Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        
        // ✅ L'utilisateur reste sur la page pour voir le message de succès
        // Il peut ensuite cliquer manuellement sur "Aller à la connexion" s'il le souhaite
      }
    } catch (error: any) {
      console.log('❌ Erreur lors de la création du compte:', error);
      console.log('📋 Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // @ts-ignore
      let errorMessage: string = t('register.error.default' as string);
      
      if (error.response?.data) {
        errorMessage = String(error.response.data);
      } else if (error.message) {
        errorMessage = String(error.message);
      }
      
      console.log('💬 Message d\'erreur affiché à l\'utilisateur:', errorMessage);
      setApiError(`❌ Erreur lors de la création du compte: ${errorMessage}`);
    } finally {
      console.log('🏁 Fin de la soumission du formulaire');
      setIsLoading(false);
    }
  };

  if (isLoadingToken) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (!associationName) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Invitation invalide
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              Le lien d'invitation est invalide, expiré, ou a déjà été utilisé.
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Vérifiez que le lien est complet</p>
              <p>• Contactez la personne qui vous a invité</p>
              <p>• Demandez un nouveau lien d'invitation</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link 
              to="/login" 
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Aller à la connexion
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        
        {/* Bandeau d'invitation */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-blue-600 text-2xl" />
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300">
                Invitation reçue
              </h2>
            </div>
          </div>
          <div className="text-center">
            <p className="text-blue-800 dark:text-blue-200 mb-2">
              <span className="font-medium">{inviterFirstName} {inviterLastName}</span> vous invite à rejoindre
            </p>
            <div className="flex items-center justify-center space-x-2">
              <FaBuilding className="text-blue-600" />
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                {associationName}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Finaliser votre inscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complétez vos informations pour rejoindre l'association
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-1/4 mb-8 lg:mb-0 lg:mr-8">
            <div className="relative">
              <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <UserCircleIcon className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Première colonne */}
                <div className="space-y-4">
                  <Input
        // @ts-ignore
                    placeholder={t('register.firstName' as string)}
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.firstname && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.email' as string)}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                    rightIcon={isValid.email && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.street' as string)}
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.street && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.state' as string)}
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.state && <FaCheckCircle className="text-green-500 text-lg" />}
                  />
                </div>

                {/* Deuxième colonne */}
                <div className="space-y-4">
                  <Input
        // @ts-ignore
                    placeholder={t('register.lastName' as string)}
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.lastname && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.phone' as string)}
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.phoneNumber && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.city' as string)}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.city && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
        // @ts-ignore
                    placeholder={t('register.postalCode' as string)}
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.postalCode && <FaCheckCircle className="text-green-500 text-lg" />}
                  />
                </div>
              </div>

              {/* Pays sur toute la largeur */}
              <div className="w-full">
                <Input
        // @ts-ignore
                  placeholder={t('register.country' as string)}
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.country && <FaCheckCircle className="text-green-500 text-lg" />}
                />
              </div>

              {/* Mots de passe */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
        // @ts-ignore
                    placeholder={t('register.password' as string)}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                    error={passwordError}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    }
                  />
                  {isPasswordFocused && (
                    <PasswordStrengthToast 
                      strength={passwordStrength.strength * 25} // Convertir 0-4 en 0-100
                      label={passwordStrength.label}
                      message={passwordStrength.message}
                    />
                  )}
                </div>

                <div className="relative">
                  <Input
        // @ts-ignore
                    placeholder={t('register.confirmPassword' as string)}
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    required
                    error={confirmPasswordError}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {apiError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      {apiError}
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      {successMessage}
                      <div className="mt-2">
                        <Link to="/login" className="text-green-800 dark:text-green-200 underline hover:no-underline font-medium">
                          → Aller à la page de connexion
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      {formError}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                    {/* @ts-ignore */}
                    {t('register.terms' as string)}{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
                      {/* @ts-ignore */}
                      {t('register.termsLink' as string)}
                    </a>{" "}
                    {/* @ts-ignore */}
                    {t('register.and' as string)}{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
                      {/* @ts-ignore */}
                      {t('register.privacyLink' as string)}
                    </a>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end mt-8">
                <Button 
                  type="submit" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md" 
                  disabled={isLoading} 
                  isLoading={isLoading}
                >
                  Rejoindre l'association
                </Button>
              </div>

              {/* Already have account / Login link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AcceptInvitation; 
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
  languages: Language[];
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
    languages: [Language.French],
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer et valider le token d'invitation depuis l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Token d\'invitation manquant');
      navigate('/login');
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
        toast.error('Invitation invalide ou expirée');
        setAssociationName(null);
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchInvitationData();
  }, [searchParams, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        setFormError(t('register.passwordMatchError'));
        return;
      }

      if (passwordError || confirmPasswordError) {
        setFormError(t('register.formError'));
        return;
      }

      if (!invitationToken || !associationName) {
        setFormError('Données d\'invitation manquantes');
        return;
      }

      // Préparer les données pour l'API avec le managerToken
      const userData = {
        ...form,
        isManager: false, // Toujours false pour une invitation
        managerToken: invitationToken, // Utiliser le token d'invitation comme managerToken
        languages: [Language.French],
      };

      const response = await userService.createAccount(userData);
      
      if (response) {
        toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        
        // Naviguer vers login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      let errorMessage = t('register.error.default');
      
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    } finally {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Invitation invalide ou expirée</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            Retour à la connexion
          </Link>
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
                    placeholder={t('register.firstName')}
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.firstname && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t('register.email')}
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
                    placeholder={t('register.street')}
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.street && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t('register.state')}
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
                    placeholder={t('register.lastName')}
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.lastname && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t('register.phone')}
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.phoneNumber && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t('register.city')}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.city && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t('register.postalCode')}
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
                  placeholder={t('register.country')}
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
                    placeholder={t('register.password')}
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
                    placeholder={t('register.confirmPassword')}
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

              {/* Erreur globale */}
              {formError && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {formError}
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
                    {t('register.terms')}{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
                      {t('register.termsLink')}
                    </a>{" "}
                    {t('register.and')}{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
                      {t('register.privacyLink')}
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

              {/* Already have account */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
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
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/common/input/input";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import PasswordStrengthToast from "../../components/common/toast/PasswordStrengthToast";
import { getPasswordStrength } from "../../utils/passwordStrength";
import Button from "../../components/common/button/button";
import { useTranslation } from "react-i18next";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Language } from "../../types/enums/Language";
import { toast } from "react-hot-toast";
import { UserCircleIcon } from '@heroicons/react/24/outline';

// Interfaces pour la validation
interface BaseUserData {
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

interface ManagerUserData extends BaseUserData {
  isManager: true;
  managerToken?: undefined; // Les managers n'ont pas de managerToken
}

interface NonManagerUserData extends BaseUserData {
  isManager: false;
  managerToken: string; // Obligatoire pour les utilisateurs
}

type UserData = ManagerUserData | NonManagerUserData;

const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const t_register = (key: string): string => {
    return t(`register.${key}` as any);
  };

  const [form, setForm] = useState<BaseUserData & { isManager: boolean; managerToken?: string }>({
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
    isManager: true,
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
    // La validation de managerId est gérée séparément dans handleSubmit
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm(prev => {
        const newForm = { ...prev, [name]: checked };
        // Si on devient manager, on supprime managerId
        if (name === 'isManager' && checked) {
          delete newForm.managerToken;
        }
        return newForm;
      });
    } else {
    setForm(prev => ({ ...prev, [name]: value }));
    }

    if (name === "password") {
      const { strength } = getPasswordStrength(value);
      if (strength < 2) {
        setPasswordError("Password must be at least 8 characters, including uppercase, lowercase, and numbers");
      } else {
        setPasswordError(undefined);
      }
    }

    if (name === "confirmPassword") {
      if (value !== form.password) {
        setConfirmPasswordError("Passwords do not match");
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
        setFormError(t_register('passwordMatchError'));
        return;
      }

      if (passwordError || confirmPasswordError) {
        setFormError(t_register('formError'));
        return;
      }

      // Validation spécifique selon le type d'utilisateur
      if (!form.isManager && !form.managerToken?.trim()) {
        setFormError(t_register('managerTokenRequired'));
        return;
      }

      // Préparation des données selon le type d'utilisateur
      const userData: UserData = form.isManager 
        ? {
            ...form,
            isManager: true,
            languages: form.languages,
          } as ManagerUserData
        : {
        ...form,
            isManager: false,
            managerToken: form.managerToken!,
        languages: form.languages,
          } as NonManagerUserData;

      console.log('🚀 Tentative de création d\'utilisateur avec les données:', userData);
      
      // Préparer les données pour le backend selon le type d'utilisateur
      const backendData = {
        ...userData,
        // Pour les managers : pas de managerToken
        // Pour les utilisateurs : utiliser le managerToken fourni
        managerToken: !userData.isManager ? userData.managerToken : undefined
      };
      
      console.log('📡 Données formatées pour le backend:', backendData);
      
      
      const response = await userService.createAccount(backendData);
   
      
      console.log('✅ Réponse de création d\'utilisateur:', response);
      
  
    } catch (error: any) {
      let errorMessage = t_register('error.default');
      
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
  
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">

            {/* Header */}
            <div className="text-left mb-8">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t_register('createAccount')}</h1>
    
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Section - Profile Picture (smaller, inline) */}
              <div className="lg:w-1/4 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserCircleIcon className="w-20 h-20 text-gray-500 dark:text-gray-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-orange-600 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Right Section - Form */}
              <div className="lg:w-3/4">

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Grid Layout inspiré de l'image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Première colonne */}
              <div className="space-y-4">
                <Input
                  placeholder={t_register('firstName')}
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.firstname && <FaCheckCircle className="text-green-500 text-lg" />}
                />

                <Input
                  placeholder={t_register('email')}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.email && <FaCheckCircle className="text-green-500 text-lg" />}
                />

                <Input
                  placeholder={t_register('street')}
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.street && <FaCheckCircle className="text-green-500 text-lg" />}
                />

                <Input
                  placeholder={t_register('state')}
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
                  placeholder={t_register('lastName')}
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.lastname && <FaCheckCircle className="text-green-500 text-lg" />}
                />

                <Input
                  placeholder={t_register('phone')}
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.phoneNumber && <FaCheckCircle className="text-green-500 text-lg" />}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder={t_register('city')}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.city && <FaCheckCircle className="text-green-500 text-lg" />}
                  />

                  <Input
                    placeholder={t_register('postalCode')}
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    rightIcon={isValid.postalCode && <FaCheckCircle className="text-green-500 text-lg" />}
                  />
                </div>

                <Input
                  placeholder={t_register('country')}
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  rightIcon={isValid.country && <FaCheckCircle className="text-green-500 text-lg" />}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="relative">
                <Input
                  placeholder={t_register('password')}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  isFocused={isPasswordFocused}
                  setIsFocused={setIsPasswordFocused}
                  error={passwordError}
                  className={`${
                    form.password === form.confirmPassword && !passwordError && !confirmPasswordError
                      ? "border-green-500"
                      : ""
                  }`}
                  rightIcon={
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  }
                />
                {isPasswordFocused && form.password && (
                  <div className="absolute right-0 top-14 z-10">
                    <PasswordStrengthToast
                      strength={passwordStrength.strength}
                      label={passwordStrength.label}
                      message={passwordStrength.message}
                    />
                  </div>
                )}
              </div>

              <Input
                placeholder={t_register('confirmPassword')}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                isFocused={isConfirmPasswordFocused}
                setIsFocused={setIsConfirmPasswordFocused}
                error={confirmPasswordError}
                className={`${
                  form.password === form.confirmPassword && !passwordError && !confirmPasswordError
                    ? "border-green-500"
                    : ""
                }`}
                rightIcon={
                  <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                }
              />
            </div>

    

            {/* Erreur globale */}
            {formError && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{t_register('formError')}</div>}

          

            {/* Submit */}
            <div className="flex justify-end mt-8">
              <button 
                onClick={handleSubmit}
                type="submit" 
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md shadow-md" 
                disabled={isLoading} 
              
              >
                {t_register('createAccount')}
              </button>
            </div>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t_register('alreadyHaveAccount')}{" "}
                <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                  {t_register('signIn')}
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

export default CreateAccount;

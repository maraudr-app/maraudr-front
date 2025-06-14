import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/common/input/input";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import PasswordStrengthToast from "../../components/common/toast/PasswordStrengthToast";
import { getPasswordStrength } from "../../utils/passwordStrength";
import Button from "../../components/common/button/button";
import { useTranslation } from "react-i18next";
import { userService } from "../../services/userService";
import { Language } from "../../types/enums/Language";
import { toast } from "react-hot-toast";
import { HeartIcon } from '@heroicons/react/24/outline';
import associationImage from "../../assets/pictures/associationcreateaccount.png";

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
  languages: Language[];
}

interface ManagerUserData extends BaseUserData {
  isManager: true;
}

interface NonManagerUserData extends BaseUserData {
  isManager: false;
  managerId: string;
}

type UserData = ManagerUserData | NonManagerUserData;

const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const t_register = (key: string): string => {
    return t(`register.${key}` as any);
  };

  const [form, setForm] = useState<BaseUserData & { isManager: boolean; managerId?: string }>({
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
          delete newForm.managerId;
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
      if (!form.isManager && !form.managerId?.trim()) {
        setFormError(t_register('managerIdRequired'));
        return;
      }

      // Préparation des données selon le type d'utilisateur
      const userData: UserData = form.isManager 
        ? {
            ...form,
            isManager: true,
            languages: [Language.French],
          } as ManagerUserData
        : {
            ...form,
            isManager: false,
            managerId: form.managerId!,
            languages: [Language.French],
          } as NonManagerUserData;

      const response = await userService.createAccount(userData);
      
      if (response) {
        toast.success(t_register('success'), {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#4CAF50',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        navigate('/login');
      }
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg">
        <div className="w-full md:w-3/5 p-8 space-y-6" style={{ background: 'linear-gradient(to bottom right, #FFF8F0, #F0F8FF)' }}>
          <h1 className="text-3xl font-bold text-center mb-8">{t_register('title')}</h1>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder={t_register('firstName')}
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
                rightIcon={isValid.firstname && <FaCheckCircle className="text-green-500 text-lg" />}
              />

              <Input
                placeholder={t_register('lastName')}
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
                rightIcon={isValid.lastname && <FaCheckCircle className="text-green-500 text-lg" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder={t_register('phone')}
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                rightIcon={isValid.phoneNumber && <FaCheckCircle className="text-green-500 text-lg" />}
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Manager Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isManager"
                  name="isManager"
                  checked={form.isManager}
                  onChange={handleChange}
                  className="h-4 w-4 text-maraudr-blue dark:text-maraudr-orange rounded border-gray-300 focus:ring-maraudr-blue dark:focus:ring-maraudr-orange"
                />
                <label htmlFor="isManager" className="text-sm font-medium text-maraudr-darkText dark:text-maraudr-lightText">
                  {t_register('isManager')}
                </label>
              </div>

              {!form.isManager && (
                <Input
                  placeholder={t_register('managerId')}
                  name="managerId"
                  value={form.managerId || ''}
                  onChange={handleChange}
                  required
                  error={!form.isManager && !form.managerId?.trim() ? t_register('managerIdRequired') : undefined}
                  rightIcon={!form.isManager && form.managerId?.trim() ? <FaCheckCircle className="text-green-500 text-lg" /> : undefined}
                />
              )}
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder={t_register('street')}
                name="street"
                value={form.street}
                onChange={handleChange}
                required
                rightIcon={isValid.street && <FaCheckCircle className="text-green-500 text-lg" />}
              />

              <Input
                placeholder={t_register('city')}
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                rightIcon={isValid.city && <FaCheckCircle className="text-green-500 text-lg" />}
              />

              <Input
                placeholder={t_register('state')}
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                rightIcon={isValid.state && <FaCheckCircle className="text-green-500 text-lg" />}
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

            {/* Erreur globale */}
            {formError && <div className="text-red-500 text-sm text-center">{t_register('formError')}</div>}

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                {t_register('terms')}{" "}
                <a href="#" className="underline">{t_register('termsLink')}</a>{" "}
                {t_register('and')}{" "}
                <a href="#" className="underline">{t_register('privacyLink')}</a>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => navigate('/login')}
              >
                {t_register('cancel')}
              </Button>
              <Button
                type="submit"
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {t_register('submit')}
              </Button>
            </div>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t_register('alreadyHaveAccount')}{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t_register('signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 text-white text-center"
             style={{ background: 'linear-gradient(to bottom right, #FF8A00, #007BFF)', color: '#FFFFFF' }}>
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez notre mission <HeartIcon className="h-8 w-8 inline-block align-middle" />
          </h2>
          <p className="text-lg mb-8">
            Ensemble, construisons un avenir solidaire.
          </p>
          <div className="w-full max-w-xs mx-auto">
            <img
              src={associationImage}
              alt="Association illustration"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;

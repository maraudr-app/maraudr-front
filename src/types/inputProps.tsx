import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { getPasswordStrength } from '../utils/passwordStrength';
import { Input } from '../components/common/input/input';
import { Button } from '../components/common/button/button';
import PasswordStrengthToast from '../components/common/toast/PasswordStrengthToast';

const advantages = [
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" /></svg>
    ),
    text: 'Secure payments through reliable partners',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    text: 'Fast transfers',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a5 5 0 0010 0z" /></svg>
    ),
    text: 'Fair commissions',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
    ),
    text: 'Best available rates',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10V3L5 14h7v7l9-11h-7z" /></svg>
    ),
    text: 'Convenience',
  },
];

const passwordCriteria = [
  {
    label: 'At least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: 'At least one uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: 'At least one number',
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    label: 'At least one special character',
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
];

const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAcceptTerms(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const isValid = {
    firstname: formData.firstname.trim().length > 0,
    lastname: formData.lastname.trim().length > 0,
    password: passwordCriteria.every(c => c.test(formData.password)),
    confirmPassword: formData.confirmPassword === formData.password && formData.confirmPassword.length > 0,
  };

  const getValidationProps = (field: string) => {
    if (!touched[field]) {
      return {};
    }
    
    // Pour les champs password, on n'affiche pas l'icône de validation
    if (field === 'password' || field === 'confirmPassword') {
      return {};
    }
    
    const valid = isValid[field as keyof typeof isValid];
    return {
      borderColor: valid ? 'border-green-500' : 'border-red-500',
      rightIcon: valid ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-red-500" />
      )
    };
  };

  const getPasswordValidationProps = (field: string) => {
    const borderProps = touched[field] ? {
      borderColor: isValid[field as keyof typeof isValid] ? 'border-green-500' : 'border-red-500'
    } : {};

    return {
      ...borderProps,
      rightIcon: (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (field === 'password') {
              setShowPassword(!showPassword);
            } else {
              setShowConfirmPassword(!showConfirmPassword);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded focus:outline-none"
        >
          {(field === 'password' ? showPassword : showConfirmPassword) ? (
            <EyeSlashIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <EyeIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
      )
    };
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstname: true, lastname: true, password: true, confirmPassword: true });
    setIsLoading(true);
    setError(null);
    
    if (!acceptTerms) {
      setError('You must accept the terms of service and privacy policy.');
      setIsLoading(false);
      return;
    }
    
    if (!isValid.firstname || !isValid.lastname || !isValid.password || !isValid.confirmPassword) {
      setError('Please fill all fields correctly.');
      setIsLoading(false);
      return;
    }
    
    try {
      await userService.createUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 mx-auto">
        {/* Colonne de gauche : Titre + Avantages */}
        <div className="flex flex-col justify-center flex-[2]">
          <h1 className="text-4xl font-bold mb-8">Create an account</h1>
          <ul className="space-y-5">
            {advantages.map((item, idx) => (
              <li key={idx} className="flex items-center text-lg text-gray-700">
                <span className="mr-3">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne du milieu : Formulaire */}
        <div className="flex flex-col justify-center flex-[3] bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <Input
                placeholder="First Name"
                name="firstname"
                type="text"
                required
                value={formData.firstname}
                onChange={handleInputChange}
                onBlur={handleBlur}
                containerClassName="w-full"
                {...getValidationProps('firstname')}
              />
              <Input
                placeholder="Last Name"
                name="lastname"
                type="text"
                required
                value={formData.lastname}
                onChange={handleInputChange}
                onBlur={handleBlur}
                containerClassName="w-full"
                {...getValidationProps('lastname')}
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                containerClassName="w-full"
                {...getPasswordValidationProps('password')}
              />
              
              {/* Critères du mot de passe - affichés seulement si on tape dans le champ */}
              {formData.password && (
                <div className="mt-2">
                  <ul className="flex flex-col gap-1 text-xs">
                    {passwordCriteria.map((c, idx) => {
                      const ok = c.test(formData.password);
                      return (
                        <li key={idx} className="flex items-center">
                          {ok ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 text-red-400 mr-2" />
                          )}
                          <span className={ok ? 'text-green-600' : 'text-red-500'}>{c.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Input
              placeholder="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              containerClassName="w-full"
              {...getPasswordValidationProps('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full text-lg font-semibold"
              isLoading={isLoading}
            >
              Sign up
            </Button>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={acceptTerms}
                onChange={handleInputChange}
                className="mr-2 accent-indigo-600"
              />
              <label htmlFor="terms" className="text-gray-600 text-sm">
                I agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
              </label>
            </div>
          </form>
        </div>

        {/* Colonne de droite : Password Strength */}
        <div className="flex flex-col justify-center flex-[2]">
          {formData.password && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <PasswordStrengthToast
                strength={passwordStrength.strength}
                label={passwordStrength.label}
                message={passwordStrength.message}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
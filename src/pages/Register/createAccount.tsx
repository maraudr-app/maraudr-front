import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/userService';
import { UserToCreate } from '../../types/user/userToCreate';
import { Input } from '../../components/common/input/input';
import Button from '../../components/common/button/button';
import PasswordStrengthToast from '../../components/common/toast/PasswordStrengthToast';
import { getPasswordStrength } from '../../utils/passwordStrength';
import { Language } from '../../types/enums/Language';

const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserToCreate>({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    languages: [],
    managerId: null,
    isManager: false,
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLanguageChange = (language: Language) => {
    setFormData(prev => {
      const currentLanguages = prev.languages;
      const isSelected = currentLanguages.includes(language);
      
      if (isSelected) {
        return {
          ...prev,
          languages: currentLanguages.filter(lang => lang !== language)
        };
      } else {
        return {
          ...prev,
          languages: [...currentLanguages, language]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userData = {
        ...formData,
        languages: formData.languages || [],
        managerId: formData.isManager ? null : formData.managerId
      };
      
      await userService.createUser(userData);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('createAccount.errors.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Colonne gauche : titre + avantages */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              {t('createAccount.title')}
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg" key="secure">
                <span className="text-blue-600 dark:text-blue-400">\uD83D\uDEE1️</span>
                {t('createAccount.feature_secure')}
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg" key="fast">
                <span className="text-blue-600 dark:text-blue-400">\u26A1\uFE0F</span>
                {t('createAccount.feature_fast')}
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg" key="fair">
                <span className="text-blue-600 dark:text-blue-400">%</span>
                {t('createAccount.feature_fair')}
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg" key="rates">
                <span className="text-blue-600 dark:text-blue-400">\u2713</span>
                {t('createAccount.feature_rates')}
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg" key="convenience">
                <span className="text-blue-600 dark:text-blue-400">\uD83D\uDC4D</span>
                {t('createAccount.feature_convenience')}
              </li>
            </ul>
          </div>
        </div>
        {/* Colonne droite : formulaire */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                placeholder={t('createAccount.firstname')}
                name="firstname"
                type="text"
                required
                value={formData.firstname}
                onChange={handleInputChange}
              />
              <Input
                placeholder={t('createAccount.lastname')}
                name="lastname"
                type="text"
                required
                value={formData.lastname}
                onChange={handleInputChange}
              />
            </div>
            <Input
              placeholder={t('createAccount.email')}
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              placeholder={t('createAccount.phoneNumber')}
              name="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            <Input
              placeholder={t('createAccount.street')}
              name="street"
              type="text"
              required
              value={formData.street}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                placeholder={t('createAccount.city')}
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleInputChange}
              />
              <Input
                placeholder={t('createAccount.state')}
                name="state"
                type="text"
                required
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                placeholder={t('createAccount.postalCode')}
                name="postalCode"
                type="text"
                required
                value={formData.postalCode}
                onChange={handleInputChange}
              />
              <Input
                placeholder={t('createAccount.country')}
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
            {/* Sélection des langues */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createAccount.languages')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Language).map((language) => (
                  <div key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`lang-${language}`}
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`lang-${language}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      {language}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {/* Champ mot de passe + toaster à droite */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('createAccount.password')}
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              {/* Toaster force du mot de passe */}
              {formData.password && (
                <div className="mt-2 hidden md:block">
                  <PasswordStrengthToast
                    strength={passwordStrength.strength}
                    label={passwordStrength.label}
                    message={passwordStrength.message}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="isManager"
                name="isManager"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isManager}
                onChange={handleInputChange}
              />
              <label htmlFor="isManager" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                {t('createAccount.isManager')}
              </label>
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {t('createAccount.submit')}
            </Button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t('createAccount.or')}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="button"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                {t('createAccount.login')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;

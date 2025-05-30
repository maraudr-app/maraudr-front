import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/input/input';
import Button from '../../components/common/button/button';
import { userService } from '../../services/userService';
import { CreateUserDto, Language } from '../../types/user';

const CreateAccount = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserDto>({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    languages: [Language.FRENCH],
    isManager: true,
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await userService.createUser(formData);
      navigate('/maraudApp');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.error', 'Une erreur est survenue lors de la création du compte'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('register.title', 'Créer un compte')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={t('register.firstname', 'Prénom')}
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('register.lastname', 'Nom')}
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Input
              label={t('register.email', 'Email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label={t('register.phone', 'Téléphone')}
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />

            <Input
              label={t('register.street', 'Rue')}
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={t('register.city', 'Ville')}
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('register.state', 'État/Région')}
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={t('register.postalCode', 'Code postal')}
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('register.country', 'Pays')}
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Input
              label={t('register.password', 'Mot de passe')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t('register.submit', 'Créer le compte')}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('register.alreadyHaveAccount', 'Vous avez déjà un compte ?')}{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('register.login', 'Se connecter')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount; 
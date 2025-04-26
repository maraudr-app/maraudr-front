import { useState } from 'react';
import { GoogleButton } from '../../components/common/button/googleButton';
import { MicrosoftButton } from '../../components/common/button/microsoftButton';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { Link } from 'react-router-dom';
import loginImage from '../../assets/pictures/access-key.jpg';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Logique de connexion à implémenter
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center mt-10 pt-10 pb-10 transition-colors">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
          {/* Partie gauche - Formulaire */}
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 pb-10 border-r border-gray-200 dark:border-gray-700 transition-colors">
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <LockClosedIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                {t('auth.welcome')}
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">{t('auth.login')}</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder={t('auth.email')}
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    {t('auth.remember')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    {t('auth.forgot')}
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('auth.loginButton')}
                </Button>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('auth.noAccount')}{' '}
                  <Link to="/set-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    {t('auth.register')}
                  </Link>
                </span>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">{t('auth.or')}</span>
                </div>
              </div>

              <div className="mt-4 mb-6">
                <div className="mb-3">
                  <GoogleButton
                    onClick={() => console.log('Connexion avec Google')}
                    className="w-full"
                    text={t('auth.google')}
                  />
                </div>
                <div>
                  <MicrosoftButton
                    onClick={() => console.log('Connexion avec Microsoft')}
                    className="w-full"
                    text={t('auth.microsoft')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Partie droite - Image */}
          <div className="hidden md:block w-1/2 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <img 
              src={loginImage} 
              alt="Illustration" 
              className="w-full h-full object-cover opacity-100 dark:opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

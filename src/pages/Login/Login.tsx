import { useState } from 'react';
import { GoogleButton } from '../../components/common/button/googleButton';
import { MicrosoftButton } from '../../components/common/button/microsoftButton';
import { Input } from '../../components/common/input/input';
import { Button } from '../../components/common/button/button';
import { Link } from 'react-router-dom';
import loginImage from '../../assets/pictures/login-key.png';
import { LockClosedIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Logique de connexion à implémenter
  };

  return (
    <div className=" flex items-center justify-center mt-10 pt-10 pb-10">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row shadow-lg border-solid rounded-r overflow-hidden">
          {/* Partie gauche - Formulaire */}
          <div className="w-full md:w-1/2  p-8 pb-10 border-r border-gray-200 bg-blue-50">
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="h-6 w-6 text-gray-500"/>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-pink-500 rounded-full absolute -mt-1"></div>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Hey, bienvenue sur maraudr.
              </h2>
              <p className="text-sm text-gray-700">Connectez-vous à votre compte</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Mot de passe oublié?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Se connecter
                </Button>
              </div>

              <div className="text-center">
                <span className="text-sm">
                  Pas encore de compte?{' '}
                  <Link to="/set-password" className="font-medium text-blue-600 hover:text-blue-500">
                    S'inscrire
                  </Link>
                </span>
              </div>
            </form>

            <div className=" flex flex-col gap-4 mt-6 mb-6 pb-10">
              <div className="flex flex-col gap-2 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 my-6">
                <div className="mb-3">
                  <GoogleButton
                      onClick={() => console.log('Connexion avec Google')}
                      className="w-full"
                  />
                </div>
                <div>
                  <MicrosoftButton
                      onClick={() => console.log('Connexion avec Microsoft')}
                      className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Partie droite - Image */}
          <div className="hidden md:flex w-1/2 relative bg-blue-100 items-center justify-center">
            <img
                src={loginImage}
                alt="Illustration"
                className="w-2/4 h-2/4 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

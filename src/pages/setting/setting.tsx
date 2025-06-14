import React, { useState } from 'react';
import {
    BellIcon,
    CogIcon,
    GlobeAltIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon, SwatchIcon,
    UserIcon
} from "@heroicons/react/16/solid";
import {LightBulbIcon, LockClosedIcon, LockOpenIcon} from "@heroicons/react/24/solid";
import {MoonIcon} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';


const Setting: React.FC = () => {
    // États pour les différents paramètres
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<boolean>(true);
    const [privacyMode, setPrivacyMode] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>('Français');

    // Options de langue disponibles
    const availableLanguages = ['Français', 'English', 'Español', 'Deutsch'];

    const { logout } = useAuthStore();
    const navigate = useNavigate();

    // Fonction pour gérer la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* En-tête */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                        <CogIcon className="w-6 h-6 mr-2" />
                        Paramètres
                    </h1>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {darkMode ? <LightBulbIcon /> : <MoonIcon />}
                    </button>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="flex-grow max-w-5xl mx-auto w-full p-4">
                <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
                    {/* Barre latérale de navigation */}
                    <nav className="space-y-1">
                        <div className="pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Paramètres</h2>
                        </div>
                        {[
                            { icon: <UserIcon className="w-4 h-4" />, label: 'Profil' },
                            { icon: <BellIcon className="w-4 h-4" />, label: 'Notifications' },
                            { icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Confidentialité' },
                            { icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Langue' },
                            { icon: <QuestionMarkCircleIcon className="w-4 h-4" />, label: 'Aide & Support' }
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                className="flex items-center w-full px-3 py-2 text-sm rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <span className="mr-3 text-gray-500 dark:text-gray-400">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-3 py-2 text-sm rounded-md font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800"
                            >
                                <span className="mr-3"><LockOpenIcon className="w-4 h-4" /></span>
                                Déconnexion
                            </button>
                        </div>
                    </nav>

                    {/* Sections de paramètres */}
                    <div className="space-y-6">
                        {/* Section Profil */}
                        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profil</h2>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                    JD
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Jean Dupont</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">jean.dupont@exemple.com</p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    Modifier le profil
                                </button>
                                <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    Changer le mot de passe
                                </button>
                            </div>
                        </section>

                        {/* Section Notifications */}
                        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Notifications push</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir des notifications en temps réel</p>
                                    </div>
                                    <button onClick={() => setNotifications(!notifications)} className="text-blue-500">
                                        {notifications ?
                                            <SwatchIcon className="w-6 h-6 text-blue-500" /> :
                                            <SwatchIcon className="w-6 h-6 text-gray-400" />
                                        }
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Notifications par email</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir un résumé hebdomadaire par email</p>
                                    </div>
                                    <button className="text-gray-400 dark:text-gray-500">
                                        <SwatchIcon className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Section Confidentialité */}
                        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confidentialité</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Mode privé</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Masquer votre activité aux autres utilisateurs</p>
                                    </div>
                                    <button onClick={() => setPrivacyMode(!privacyMode)} className="text-blue-500">
                                        {privacyMode ?
                                            <SwatchIcon className="w-6 h-6 text-blue-500" /> :
                                            <SwatchIcon className="w-6 h-6 text-gray-400" />
                                        }
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Localisation</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Autoriser l'accès à votre position</p>
                                    </div>
                                    <button className="text-blue-500">
                                        <SwatchIcon className="w-6 h-6 text-blue-500" />
                                    </button>
                                </div>
                            </div>s
                        </section>

                        {/* Section Langue */}
                        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Langue</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Sélectionner la langue
                                    </label>
                                    <select
                                        id="language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        {availableLanguages.map((lang) => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section Aide & Support */}
                        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Aide & Support</h2>
                            <div className="space-y-4">
                                <button className="flex items-center text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                                    <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
                                    Centre d'aide
                                </button>
                                <button className="flex items-center text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                                    <LockClosedIcon className="w-4 h-4 mr-2" />
                                    Politique de confidentialité
                                </button>
                                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Version de l'application: 1.2.3
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Pied de page */}
            <footer className="bg-white dark:bg-gray-800 shadow-sm p-4 mt-auto">
                <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
                    © 2025 Marraudr. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
};

export default Setting;
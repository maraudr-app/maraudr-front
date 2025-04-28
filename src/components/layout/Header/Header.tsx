// src/components/layout/Header/Header.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../../common/button/ThemeToggle';
import { LanguageSwitcher } from '../../../i18n/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';

interface NavLink {
    name: string;
    path: string;
    translationKey: string;
}

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const isHomePage = location.pathname === '/';
    const isLoginPage = location.pathname === '/login';

    // Vérifier si le scroll a dépassé la section héro
    useEffect(() => {
        if (!isHomePage) {
            setShowCreateAccount(true);
            return;
        }

        const handleScroll = () => {
            // Hauteur approximative de la section héro (à ajuster)
            const heroSectionHeight = 600;
            setShowCreateAccount(window.scrollY > heroSectionHeight);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Vérifier à l'initialisation

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHomePage]);

    // Fermer le menu utilisateur quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks: NavLink[] = [];
    
    // Ajouter le lien Dashboard si l'utilisateur est authentifié
   
    
    // Ajouter le lien Contact
    navLinks.push({ name: t('header.contact'), path: '/contact', translationKey: 'header.contact' });

    // Ajouter le lien Login seulement si on est sur la page Login
    if (isLoginPage) {
        navLinks.push({ name: t('header.login'), path: '/login', translationKey: 'header.login' });
    }

    // Gérer la déconnexion
    const handleLogout = () => {
        logout();
        // Rediriger vers la page d'accueil
        window.location.href = '/';
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-50 dark:bg-gray-800 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={'/'} className="text-xl font-bold text-blue-600 dark:text-blue-400">maraudr</Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.translationKey}
                                to={link.path}
                                className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 ${
                                    location.pathname === link.path ? 'bg-blue-100 dark:bg-blue-900 rounded-md font-semibold' : ''
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <ThemeToggle />
                        <LanguageSwitcher />
                        
                        {isAuthenticated && user ? (
                            <div className="relative ml-3" id="user-menu">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-sm focus:outline-none"
                                >
                                    <div className="text-gray-700 dark:text-gray-200 font-medium">{user.name}</div>
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full border-2 border-blue-400"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-300" />
                                    )}
                                </button>
                                
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                                        <Link
                                            to="/maraudApp/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            {t('sidebar.profile', 'Profil')}
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            {t('sidebar.settings', 'Paramètres')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            {t('auth.logout', 'Déconnexion')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            (showCreateAccount || !isHomePage) && !isLoginPage && (
                                <Link
                                    to="/login"
                                    className="ml-3 px-4 py-2 bg-blue-500 text-white font-medium text-center rounded-md hover:bg-blue-600 transition duration-300 text-sm"
                                >
                                    {t('header.signup', 'Créer un compte')}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Burger Menu */}
                    <div className="md:hidden flex items-center">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        
                        {isAuthenticated && user && (
                            <div className="mx-2">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full border-2 border-blue-400"
                                />
                            </div>
                        )}
                        
                        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="ml-2">
                            {isOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 pb-4 shadow-md border-t dark:border-gray-700">
                    {navLinks.map((link) => (
                        <Link
                            key={link.translationKey}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`block py-2 px-4 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 ${
                                location.pathname === link.path ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    
                    {isAuthenticated && user ? (
                        <>
                            <div className="px-4 py-2 border-t dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full border-2 border-blue-400"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-300" />
                                    )}
                                    <div className="text-gray-700 dark:text-gray-200 font-medium">{user.name}</div>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                {t('sidebar.profile', 'Profil')}
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                {t('sidebar.settings', 'Paramètres')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left py-2 px-4 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                {t('auth.logout', 'Déconnexion')}
                            </button>
                        </>
                    ) : (
                        (showCreateAccount || !isHomePage) && !isLoginPage && (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block mx-4 py-2 px-4 my-2 bg-blue-500 text-white font-medium text-center rounded-md hover:bg-blue-600 transition duration-300"
                            >
                                {t('header.signup', 'Créer un compte')}
                            </Link>
                        )
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;

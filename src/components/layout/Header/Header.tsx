// src/components/layout/Header/Header.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../../common/button/ThemeToggle';
import { LanguageSwitcher } from '../../../i18n/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface NavLink {
    name: string;
    path: string;
    translationKey: string;
}

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isLoginPage = location.pathname === '/login';

    // Vérifier si l'utilisateur est authentifié
    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem('isAuthenticated');
            setIsAuthenticated(auth === 'true');
        };
        
        checkAuth();
        
        // Écouter les changements d'authentification
        window.addEventListener('storage', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

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

    const navLinks: NavLink[] = [];
    
    // Ajouter le lien Dashboard si l'utilisateur est authentifié
    if (isAuthenticated) {
        navLinks.push({ name: t('header.dashboard'), path: '/dashboard', translationKey: 'header.dashboard' });
    }
    
    // Ajouter le lien Contact
    navLinks.push({ name: t('header.contact'), path: '/contact', translationKey: 'header.contact' });

    // Ajouter le lien Login seulement si on est sur la page Login
    if (isLoginPage) {
        navLinks.push({ name: t('header.login'), path: '/login', translationKey: 'header.login' });
    }

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-50 dark:bg-gray-800 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">maraudr</div>

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
                        {(showCreateAccount || !isHomePage) && !isLoginPage && !isAuthenticated && (
                            <Link
                                to="/login"
                                className="ml-3 px-4 py-2 bg-blue-500 text-white font-medium text-center rounded-md hover:bg-blue-600 transition duration-300 text-sm"
                            >
                                {t('header.signup', 'Créer un compte')}
                            </Link>
                        )}
                    </nav>

                    {/* Burger Menu */}
                    <div className="md:hidden flex items-center">
                        <ThemeToggle />
                        <LanguageSwitcher />
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
                    {(showCreateAccount || !isHomePage) && !isLoginPage && !isAuthenticated && (
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="block mx-4 py-2 px-4 my-2 bg-blue-500 text-white font-medium text-center rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            {t('header.signup', 'Créer un compte')}
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;

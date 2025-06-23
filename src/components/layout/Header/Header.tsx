// src/components/layout/Header/Header.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../../common/button/ThemeToggle';
import { LanguageSwitcher } from '../../../i18n/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';
import { useAssoStore } from '../../../store/assoStore';
import { assoService } from '../../../services/assoService';
import Button from '../../common/button/button';
import NotificationIcon from '../../common/notification/NotificationIcon';
import { useNotifications } from '../../../hooks/useNotifications';

interface NavLink {
    name: string;
    path: string;
    translationKey: string;
}

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAssociationsMenu, setShowAssociationsMenu] = useState(false);
    const [associationDetails, setAssociationDetails] = useState<any>(null);
    const { t } = useTranslation(['common']);
    const location = useLocation();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const isHomePage = location.pathname === '/';
    const isLoginPage = location.pathname === '/login';
    const sidebarCollapsed = useAssoStore(state => state.sidebarCollapsed);
    const { notificationCount } = useNotifications();

    // Debug logs pour le rôle
    console.log('Header - User:', user);
    console.log('Header - User userType:', user?.userType);
    console.log('Header - Is manager?', user?.userType === 'Manager');
    console.log('Header - Is authenticated:', isAuthenticated);
    console.log('Header - Full user object:', JSON.stringify(user, null, 2));

    // Fonction pour vérifier si l'utilisateur est manager
    const isManager = () => {
        if (!user?.userType) return false;
        return user.userType === 'Manager';
    };

    // Utiliser le store d'associations
    const { associations, selectedAssociation, fetchUserAssociations, setSelectedAssociation } = useAssoStore();

    // Recharger les données utilisateur si elles sont incomplètes
    useEffect(() => {
        const loadData = async () => {
        if (isAuthenticated && user) {
                // Si l'utilisateur n'a pas userType, recharger les données
                if (!user.userType || !user.firstName || !user.lastName) {
                    console.log('User data incomplete, reloading...');
                    await useAuthStore.getState().fetchUser();
                }
                await fetchUserAssociations();
        }
        };
        loadData();
    }, [isAuthenticated, user]);

    // Effet pour charger les détails de l'association sélectionnée
    useEffect(() => {
        const fetchAssociationDetails = async () => {
            if (selectedAssociation?.id && isAuthenticated) {
                console.log('Effect: Selected Association changed to:', selectedAssociation);
                console.log('Effect: Selected Association ID:', selectedAssociation.id);
                try {
                    const details = await assoService.getAssociation(selectedAssociation.id);
                    setAssociationDetails(details);
                    console.log('Effect: Association details loaded:', details);
        } catch (error) {
                    console.error('Effect: Error fetching association details:', error);
        }
            }
        };

        fetchAssociationDetails();
    }, [selectedAssociation, isAuthenticated]);

    const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
        if (!firstName || !lastName) return '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getAssociationInitials = (name: string | undefined) => {
        if (!name) return '';
        const words = name.split(' ').filter(Boolean);
        if (words.length === 0) return '';
        
        let initials = '';
        for (let i = 0; i < Math.min(words.length, 3); i++) {
            initials += words[i].charAt(0);
        }
        return initials.toUpperCase();
    };

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
            const associationsMenu = document.getElementById('associations-menu');
            
            if (userMenu && !userMenu.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            
            if (associationsMenu && !associationsMenu.contains(event.target as Node)) {
                setShowAssociationsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks: NavLink[] = [];
    
    // Ajouter le lien Contact
    navLinks.push({ name: t('header.contact'), path: '/contact', translationKey: 'header.contact' });

    // Ajouter le lien Login seulement si on est sur la page Login
    if (isLoginPage) {
        navLinks.push({ name: t('header.login'), path: '/login', translationKey: 'header.login' });
    }

    // Gérer la déconnexion
    const handleLogout = () => {
        logout();
        localStorage.removeItem('asso-storage');
        localStorage.removeItem('auth-storage');
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowAssociationsMenu(!showAssociationsMenu)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                    id="associations-menu"
                                >
                                    {selectedAssociation && isAuthenticated ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="h-9 w-9 rounded-full border-2 border-maraudr-blue bg-maraudr-blue/20 dark:bg-maraudr-orange/20 flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-bold text-xs">
                                                {getAssociationInitials(selectedAssociation.name)}
                                            </div>
                                            <span className="text-lg font-bold text-maraudr-darkText dark:text-maraudr-lightText">
                                                {selectedAssociation.name.charAt(0).toUpperCase() + selectedAssociation.name.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold">maraudr</span>
                                    )}
                                    {associations.length > 1 && isAuthenticated && <ChevronDownIcon className="h-5 w-5 ml-2" />}
                                </button>
                                
                                {showAssociationsMenu && associations.length > 1 && isAuthenticated && (
                                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg py-1 z-[100] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                                        {associations.map((association) => (
                                            <button
                                                key={association.id}
                                                onClick={async () => {
                                                    console.log('🖱️ Header: Clic sur association:', association.name, '(ID:', association.id, ')');
                                                    console.log('📌 Header: Association actuelle:', selectedAssociation?.name);
                                                    console.log('🔄 Header: Changement vers:', association.name);
                                                    
                                                    setSelectedAssociation(association);
                                                    setShowAssociationsMenu(false);
                                                    
                                                    // Charger les détails de la nouvelle association
                                                    try {
                                                        const details = await assoService.getAssociation(association.id);
                                                        setAssociationDetails(details);
                                                        console.log('Association details loaded:', details);
                                                    } catch (error) {
                                                        console.error('Error fetching association details:', error);
                                                    }
                                                }}
                                                className={`flex items-center space-x-2 w-full text-left px-4 py-2 text-sm ${
                                                    selectedAssociation?.id === association.id
                                                        ? 'bg-maraudr-blue/20 text-maraudr-blue dark:bg-maraudr-orange/20 dark:text-maraudr-orange'
                                                        : 'text-maraudr-darkText dark:text-maraudr-lightText hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold'
                                                }`}
                                            >
                                                <div className="h-9 w-9 rounded-full border flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-bold text-xs">
                                                    {getAssociationInitials(association.name)}
                                                </div>
                                                <span>{association.name.toLowerCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to={'/'} className="text-xl font-bold text-maraudr-blue dark:text-maraudr-orange font-header">maraudr</Link>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        
                        {isAuthenticated && user ? (
                            <>
                                {/* Icône de notification pour les managers */}
                                {isManager() && (
                                    <NotificationIcon count={notificationCount} className="mr-4" />
                                )}
                                
                                {/* Bouton Créer une association - seulement pour les managers */}
                                {isManager() && (
                                    <Link
                                        to="/maraudApp/create-asso"
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white font-medium rounded-md hover:bg-green-700 transition duration-300 text-sm"
                                    >
                                        {t('header.createAssociation', 'Créer une association')}
                                    </Link>
                                )}
                                
                                <div className="relative" id="user-menu">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="h-8 w-8 rounded-full border-2 border-maraudr-blue"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full border-2 border-maraudr-blue bg-maraudr-blue/20 dark:bg-maraudr-orange/20 flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-medium">
                                            {getInitials(user.firstName, user.lastName)}
                                        </div>
                                    )}
                                </button>
                                
                                {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                                        <Link
                                            to="/maraudApp/profile"
                                                className="block px-4 py-2 text-sm text-maraudr-darkText dark:text-maraudr-lightText hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                                        >
                                            {t('sidebar.profile', 'Profil')}
                                        </Link>
                                        <Link
                                            to="/settings"
                                                className="block px-4 py-2 text-sm text-maraudr-darkText dark:text-maraudr-lightText hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                                        >
                                            {t('sidebar.settings', 'Paramètres')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-maraudr-red hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                                        >
                                            {t('auth.logout', 'Déconnexion')}
                                        </button>
                                    </div>
                                )}
                            </div>
                            </>
                        ) : (
                            (showCreateAccount || !isHomePage) && !isLoginPage && (
                                <Link
                                    to="/login"
                                    className="block w-full text-left px-4 py-2 text-sm bg-maraudr-blue text-white font-medium rounded-md hover:bg-maraudr-orange transition duration-300"
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
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="h-8 w-8 rounded-full border-2 border-maraudr-blue"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full border-2 border-maraudr-blue bg-maraudr-blue/20 dark:bg-maraudr-orange/20 flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-medium">
                                        {getInitials(user.firstName, user.lastName)}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="ml-2">
                            {isOpen ? (
                                <XMarkIcon className="h-6 w-6 text-maraudr-darkText dark:text-maraudr-lightText" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-maraudr-darkText dark:text-maraudr-lightText" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden pb-4 shadow-md border-t dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.translationKey}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`block py-2 px-4 text-maraudr-darkText dark:text-maraudr-lightText hover:text-maraudr-blue dark:hover:text-maraudr-orange hover:font-semibold ${ 
                                location.pathname === link.path ? 'bg-maraudr-blue/20 dark:bg-maraudr-orange/20 font-semibold' : ''
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    
                    {isAuthenticated && user ? (
                        <>
                            {/* Bouton Créer une association - seulement pour les managers */}
                            {isManager() && (
                                <Link
                                    to="/maraudApp/create-asso"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-blue-500 text-white font-medium rounded-md hover:bg-green-700 transition duration-300"
                                >
                                    {t('header.createAssociation', 'Créer une association')}
                                </Link>
                            )}
                            
                            <div className="px-4 py-2 border-t dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="h-8 w-8 rounded-full border-2 border-maraudr-blue"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full border-2 border-maraudr-blue bg-maraudr-blue/20 dark:bg-maraudr-orange/20 flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-medium">
                                            {getInitials(user.firstName, user.lastName)}
                                        </div>
                                    )}
                                    <div className="text-maraudr-darkText dark:text-maraudr-lightText font-medium">
                                        {getInitials(user.firstName, user.lastName)}
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/maraudApp/profile"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-maraudr-darkText dark:text-maraudr-lightText hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                            >
                                {t('sidebar.profile', 'Profil')}
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-maraudr-darkText dark:text-maraudr-lightText hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                            >
                                {t('sidebar.settings', 'Paramètres')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-maraudr-red hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 hover:font-semibold"
                            >
                                {t('auth.logout', 'Déconnexion')}
                            </button>
                        </>
                    ) : (
                        (showCreateAccount || !isHomePage) && !isLoginPage && (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-left px-4 py-2 text-sm bg-maraudr-blue text-white font-medium rounded-md hover:bg-maraudr-orange transition duration-300"
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
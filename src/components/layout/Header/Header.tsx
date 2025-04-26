// src/components/layout/Header/Header.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from '../../common/input/input';
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
    const { t } = useTranslation();

    const navLinks: NavLink[] = [
        { name: t('header.home'), path: '/', translationKey: 'header.home' },
        { name: t('header.dashboard'), path: '/dashboard', translationKey: 'header.dashboard' },
        { name: t('header.login'), path: '/login', translationKey: 'header.login' },
        { name: t('header.settings'), path: '/settings', translationKey: 'header.settings' },
        { name: t('header.contact'), path: '/contact', translationKey: 'header.contact' },
    ];

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-100 dark:bg-gray-800 shadow-md dark:shadow-gray-900 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">maraudr</div>

                    {/* Search Bar */}
                    <div className="w-1/2 hidden md:block">
                        <div className="relative">
                            <Input
                                type="search"
                                placeholder={t('header.search')}
                                className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                onChange={() => {
                                    // TODO: Implement search functionality 
                                }}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-4 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.translationKey}
                                to={link.path}
                                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </nav>

                    {/* Burger Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
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
                <div className="md:hidden bg-white dark:bg-gray-800 px-4 pb-4 shadow-md border-t dark:border-gray-700">
                    {navLinks.map((link) => (
                        <Link
                            key={link.translationKey}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;

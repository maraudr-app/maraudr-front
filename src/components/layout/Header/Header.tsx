// src/components/layout/Header/Header.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavLink {
    name: string;
    path: string;
}

const navLinks: NavLink[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'À propos', path: '/about' },
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="text-xl font-bold text-blue-600">maraudr</div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Burger Menu */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                            {isOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-white px-4 pb-4 shadow-md border-t">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block py-2 text-gray-700 hover:text-blue-600"
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

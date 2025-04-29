import React from 'react';
import {ChartBarIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
import {LightBulbIcon, MegaphoneIcon} from "@heroicons/react/24/solid";
import {UserGroupIcon} from "@heroicons/react/16/solid";



const About: React.FC = () => {
    // Mock team members data
    const teamMembers = [
        {
            name: "Émilie Laurent",
            role: "Fondatrice & CEO",
            image: "https://randomuser.me/api/portraits/women/2.jpg", // Image générée par randomuser
            bio: "Passionnée par la technologie et les voyages, Émilie a créé Marraudr pour révolutionner la façon dont nous explorons de nouveaux lieux."
        },
        {
            name: "Thomas Bernard",
            role: "CTO",
            image: "https://randomuser.me/api/portraits/men/3.jpg", // Image générée par randomuser
            bio: "Expert en développement mobile avec plus de 10 ans d'expérience dans la création d'applications innovantes."
        },
        {
            name: "Sophie Dubois",
            role: "Directrice Design",
            image: "https://randomuser.me/api/portraits/women/4.jpg", // Image générée par randomuser
            bio: "Designer UX/UI expérimentée qui croit fermement que la simplicité est la clé d'une expérience utilisateur exceptionnelle."
        }
    ];
    return (
        <div className="dark:bg-gray-900">
            {/* En-tête */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        <InformationCircleIcon className="w-6 h-6 mr-2" />
                        À Propos de Marraudr
                    </h1>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-5xl mx-auto p-4 py-8">
                <div className="space-y-12">
                    {/* Section Notre Histoire */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notre Histoire</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>
                                Fondée en 2023, Marraudr est née d'une idée simple mais puissante : rendre l'exploration urbaine plus
                                immersive et personnalisée. Notre nom, inspiré du terme "marauder" (rôdeur en anglais), évoque l'esprit
                                d'aventure et de découverte qui anime notre approche.
                            </p>
                            <p className="mt-4">
                                À l'origine, nous étions une petite équipe de passionnés de technologie et de voyageurs avides
                                travaillant depuis un petit bureau à Paris. Aujourd'hui, nous sommes fiers d'accompagner des millions
                                d'utilisateurs à travers le monde dans leurs aventures quotidiennes.
                            </p>
                            <p className="mt-4">
                                Notre mission reste inchangée : transformer chaque promenade en une aventure unique et mémorable,
                                en vous aidant à découvrir les trésors cachés autour de vous.
                            </p>
                        </div>
                    </section>

                    {/* Section Notre Mission */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notre Mission</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center">
                                        <LightBulbIcon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inspirer l'exploration</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        Nous croyons que les meilleures expériences sont souvent cachées hors des sentiers battus.
                                        Notre application vous encourage à sortir de votre zone de confort et à explorer votre environnement
                                        avec un regard neuf.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-md bg-green-500 flex items-center justify-center">
                                        <UserGroupIcon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connecter les communautés</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        Nous créons des ponts entre les voyageurs, les locaux et les lieux qu'ils aiment.
                                        En partageant des expériences authentiques, nous tissons un réseau mondial d'explorateurs urbains.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-md bg-purple-500 flex items-center justify-center">
                                        <   ChartBarIcon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Promouvoir la découverte locale</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        Nous mettons en lumière les petites entreprises, les sites historiques méconnus et les
                                        initiatives culturelles locales qui méritent d'être découverts.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-md bg-red-500 flex items-center justify-center">
                                        <MegaphoneIcon />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voyager responsable</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        Nous encourageons un tourisme respectueux des lieux et des cultures, en sensibilisant
                                        nos utilisateurs à l'impact de leurs visites et en promouvant des pratiques durables.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section Notre Équipe */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notre Équipe</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="mx-auto h-32 w-32 rounded-full overflow-hidden mb-4">
                                        <img
                                            src={member.image}
                                            alt={`Photo de ${member.name}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">{member.role}</p>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section Chiffres Clés */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Marraudr en Chiffres</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                                <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400">2M+</span>
                                <span className="text-gray-600 dark:text-gray-300">Utilisateurs actifs</span>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
                                <span className="block text-3xl font-bold text-green-600 dark:text-green-400">150+</span>
                                <span className="text-gray-600 dark:text-gray-300">Villes couvertes</span>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                                <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400">500K+</span>
                                <span className="text-gray-600 dark:text-gray-300">Lieux répertoriés</span>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-gray-700 rounded-lg">
                                <span className="block text-3xl font-bold text-red-600 dark:text-red-400">4.8/5</span>
                                <span className="text-gray-600 dark:text-gray-300">Note moyenne</span>
                            </div>
                        </div>
                    </section>

                    {/* Section Contact */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Nous Contacter</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>
                                Vous avez des questions, des suggestions ou vous souhaitez simplement nous dire bonjour ?
                                N'hésitez pas à nous contacter :
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                                    <span>contact@marraudr.com</span>
                                </li>
                                <li>Suivez-nous sur les réseaux sociaux : @marraudr</li>
                                <li>Adresse : 123 Avenue de l'Innovation, 75001 Paris, France</li>
                            </ul>
                        </div>
                    </section>
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

export default About;
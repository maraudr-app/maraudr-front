import React from 'react';
import {
    UserGroupIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    GlobeAltIcon, MapIcon
} from '@heroicons/react/24/outline';

const Team: React.FC = () => {
    // Données de l'équipe
    const teamMembers = [
        {
            id: 1,
            name: "Émilie Laurent",
            role: "Fondatrice & CEO",
            image: "https://randomuser.me/api/portraits/women/1.jpg",
            location: "Paris, France",
            bio: "Passionnée par la technologie et les voyages, Émilie a créé Marraudr pour révolutionner la façon dont nous explorons de nouveaux lieux. Ancienne consultante en stratégie, elle a quitté le monde de l'entreprise pour poursuivre sa vision d'une application qui transforme l'exploration urbaine.",
            education: "HEC Paris, MBA",
            experience: "8 ans dans la tech",
            languages: ["Français", "Anglais", "Espagnol"],
            socialLinks: {
                linkedin: "#",
                twitter: "#",
                github: "#"
            }
        },
        {
            id: 2,
            name: "Thomas Bernard",
            role: "CTO",
            image: "https://randomuser.me/api/portraits/men/2.jpg",
            location: "Lyon, France",
            bio: "Expert en développement mobile avec plus de 10 ans d'expérience dans la création d'applications innovantes. Thomas a travaillé pour plusieurs startups avant de rejoindre Marraudr, où il dirige le développement technique de notre plateforme.",
            education: "EPITA, Ingénieur en informatique",
            experience: "12 ans dans le développement",
            languages: ["Français", "Anglais", "Allemand"],
            socialLinks: {
                linkedin: "#",
                twitter: "#",
                github: "#"
            }
        },
        {
            id: 3,
            name: "Sophie Dubois",
            role: "Directrice Design",
            image: "https://randomuser.me/api/portraits/women/3.jpg",
            location: "Bordeaux, France",
            bio: "Designer UX/UI expérimentée qui croit fermement que la simplicité est la clé d'une expérience utilisateur exceptionnelle. Avec un œil pour les détails et une passion pour l'accessibilité, Sophie veille à ce que Marraudr soit intuitive et agréable à utiliser pour tous.",
            education: "ENSAD, Design d'interaction",
            experience: "9 ans en UX/UI",
            languages: ["Français", "Anglais", "Italien"],
            socialLinks: {
                linkedin: "#",
                twitter: "#",
                behance: "#"
            }
        },
        {
            id: 4,
            name: "Alexandre Martin",
            role: "Responsable Marketing",
            image: "https://randomuser.me/api/portraits/men/4.jpg",
            location: "Marseille, France",
            bio: "Stratège marketing avec une profonde compréhension du comportement des utilisateurs mobiles. Alexandre supervise toutes les initiatives marketing de Marraudr, de l'acquisition à la fidélisation, en passant par les partenariats stratégiques.",
            education: "ESCP Business School",
            experience: "7 ans en marketing digital",
            languages: ["Français", "Anglais", "Portugais"],
            socialLinks: {
                linkedin: "#",
                twitter: "#",
                instagram: "#"
            }
        },
        {
            id: 5,
            name: "Clara Petit",
            role: "Data Scientist",
            image: "https://randomuser.me/api/portraits/women/5.jpg",
            location: "Lille, France",
            bio: "Spécialiste en intelligence artificielle et apprentissage automatique, Clara travaille sur les algorithmes de recommandation qui alimentent les suggestions personnalisées de Marraudr, rendant chaque expérience unique.",
            education: "École Polytechnique, Mathématiques appliquées",
            experience: "5 ans en data science",
            languages: ["Français", "Anglais", "Russe"],
            socialLinks: {
                linkedin: "#",
                github: "#",
                scholar: "#"
            }
        },
        {
            id: 6,
            name: "Lucas Renaud",
            role: "Développeur Frontend",
            image: "https://randomuser.me/api/portraits/men/6.jpg",
            location: "Nantes, France",
            bio: "Passionné par le développement d'interfaces modernes et réactives, Lucas est responsable de l'expérience web et mobile de Marraudr. Il est toujours à l'affût des dernières technologies pour améliorer notre application.",
            education: "Epitech, Informatique",
            experience: "6 ans en développement frontend",
            languages: ["Français", "Anglais"],
            socialLinks: {
                linkedin: "#",
                github: "#",
                codepen: "#"
            }
        }
    ];

    const [selectedMember, setSelectedMember] = React.useState<number | null>(null);

    const handleSelectMember = (id: number) => {
        setSelectedMember(id === selectedMember ? null : id);
    };

    // Trouver le membre sélectionné
    const activeMember = teamMembers.find(member => member.id === selectedMember) || null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* En-tête */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        <UserGroupIcon className="w-6 h-6 mr-2" />
                        Notre Équipe
                    </h1>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto p-4 py-8">
                <div className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">L'Équipe Derrière Marraudr</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>
                                Chez Marraudr, notre force réside dans notre équipe diverse et passionnée. Nous partageons tous un
                                amour commun pour l'exploration urbaine et une vision commune : créer la meilleure application pour
                                découvrir le monde qui nous entoure.
                            </p>
                            <p className="mt-4">
                                De nos développeurs talentueux à nos designers créatifs, chaque membre de l'équipe apporte une
                                perspective unique qui enrichit notre produit et notre culture d'entreprise. Nous sommes fiers de
                                favoriser un environnement de travail collaboratif où l'innovation et la créativité sont encouragées.
                            </p>
                            <p className="mt-4">
                                Découvrez les personnes qui travaillent avec passion pour vous offrir la meilleure expérience possible
                                avec Marraudr.
                            </p>
                        </div>
                    </section>

                    {/* Grille des membres de l'équipe */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Les Visages de Marraudr</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    onClick={() => handleSelectMember(member.id)}
                                    className={`rounded-lg overflow-hidden shadow-md transform transition duration-300 hover:scale-105 cursor-pointer ${
                                        selectedMember === member.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={member.image}
                                            alt={`Photo de ${member.name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-700">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">{member.role}</p>
                                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            <MapIcon className="h-4 w-4 mr-1" />
                                            {member.location}
                                        </div>
                                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Profil détaillé du membre */}
                    {activeMember && (
                        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profil de {activeMember.name}</h2>
                            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                                <div>
                                    <div className="rounded-lg overflow-hidden shadow-md mb-4">
                                        <img
                                            src={activeMember.image}
                                            alt={`Photo de ${activeMember.name}`}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</h3>
                                            <p className="text-base text-gray-900 dark:text-white">{activeMember.role}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Localisation</h3>
                                            <p className="text-base text-gray-900 dark:text-white">{activeMember.location}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Formation</h3>
                                            <div className="flex items-center text-base text-gray-900 dark:text-white">
                                                <AcademicCapIcon className="h-4 w-4 mr-1 text-blue-500" />
                                                {activeMember.education}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expérience</h3>
                                            <div className="flex items-center text-base text-gray-900 dark:text-white">
                                                <BriefcaseIcon className="h-4 w-4 mr-1 text-blue-500" />
                                                {activeMember.experience}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Langues</h3>
                                            <div className="flex items-center text-base text-gray-900 dark:text-white">
                                                <GlobeAltIcon className="h-4 w-4 mr-1 text-blue-500" />
                                                {activeMember.languages.join(', ')}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Réseaux sociaux</h3>
                                            <div className="flex space-x-2 mt-1">
                                                {Object.keys(activeMember.socialLinks).map((platform) => (
                                                    <a
                                                        key={platform}
                                                        href={activeMember.socialLinks[platform as keyof typeof activeMember.socialLinks]}
                                                        className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-500"
                                                    >
                                                        {platform[0].toUpperCase()}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Biographie</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{activeMember.bio}</p>

                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">Rôle chez Marraudr</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        En tant que {activeMember.role}, {activeMember.name} joue un rôle crucial dans
                                        {activeMember.role.includes('CTO') ? ' la direction technique et le développement de notre plateforme. ' :
                                            activeMember.role.includes('Design') ? ' la conception de l\'expérience utilisateur et de l\'interface de notre application. ' :
                                                activeMember.role.includes('Marketing') ? ' nos stratégies de croissance et de communication. ' :
                                                    activeMember.role.includes('Data') ? ' l\'analyse des données et l\'amélioration de nos algorithmes. ' :
                                                        activeMember.role.includes('Développeur') ? ' la création et l\'amélioration de nos interfaces utilisateur. ' :
                                                            ' la vision et la stratégie globale de Marraudr. '}
                                        Sa passion pour {
                                        activeMember.role.includes('CTO') ? 'la technologie' :
                                            activeMember.role.includes('Design') ? 'le design centré sur l\'utilisateur' :
                                                activeMember.role.includes('Marketing') ? 'la communication et l\'engagement des utilisateurs' :
                                                    activeMember.role.includes('Data') ? 'l\'analyse de données et l\'intelligence artificielle' :
                                                        activeMember.role.includes('Développeur') ? 'les interfaces modernes et performantes' :
                                                            'l\'innovation et l\'exploration'
                                    } est une source d'inspiration pour toute l'équipe.
                                    </p>

                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">Projets notables</h3>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                        {activeMember.role.includes('CTO') ? (
                                            <>
                                                <li>Refonte complète de l'architecture backend pour améliorer les performances</li>
                                                <li>Mise en place du système de recommandation en temps réel</li>
                                                <li>Optimisation de l'application pour une consommation d'énergie réduite</li>
                                            </>
                                        ) : activeMember.role.includes('Design') ? (
                                            <>
                                                <li>Refonte complète de l'interface utilisateur de l'application mobile</li>
                                                <li>Création du système de design et de la bibliothèque de composants</li>
                                                <li>Amélioration de l'accessibilité pour tous les utilisateurs</li>
                                            </>
                                        ) : activeMember.role.includes('Marketing') ? (
                                            <>
                                                <li>Campagne de lancement dans 5 nouvelles villes européennes</li>
                                                <li>Développement du programme d'ambassadeurs Marraudr</li>
                                                <li>Partenariats stratégiques avec des acteurs du tourisme local</li>
                                            </>
                                        ) : activeMember.role.includes('Data') ? (
                                            <>
                                                <li>Mise en place du système d'analyse prédictive des tendances</li>
                                                <li>Optimisation des algorithmes de recommandation personnalisée</li>
                                                <li>Développement d'outils d'analyse pour l'équipe produit</li>
                                            </>
                                        ) : activeMember.role.includes('Développeur') ? (
                                            <>
                                                <li>Développement de la nouvelle interface de cartographie interactive</li>
                                                <li>Optimisation des performances sur les appareils mobiles</li>
                                                <li>Implémentation du mode hors ligne avancé</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Levée de fonds réussie de série A (12M€)</li>
                                                <li>Expansion internationale dans 15 pays</li>
                                                <li>Vision stratégique et planification à long terme de Marraudr</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Valeurs d'équipe */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Nos Valeurs</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Innovation</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Nous repoussons constamment les limites de ce qui est possible pour créer des expériences extraordinaires.
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">Collaboration</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Les meilleures idées naissent du travail d'équipe et du partage ouvert d'idées et de feedback.
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Authenticité</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Nous valorisons les expériences authentiques et encourageons chacun à être fidèle à soi-même.
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Impact</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Nous cherchons à avoir un impact positif sur la façon dont les gens explorent et comprennent le monde.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Rejoindre l'équipe */}
                    <section className="bg-blue-500 dark:bg-blue-600 rounded-lg shadow p-6 text-white">
                        <h2 className="text-xl font-semibold mb-4">Rejoignez l'Aventure Marraudr</h2>
                        <p className="mb-6">
                            Nous sommes toujours à la recherche de personnes talentueuses et passionnées pour rejoindre notre équipe.
                            Si vous êtes enthousiasmé par notre mission et souhaitez contribuer à façonner l'avenir de l'exploration urbaine,
                            consultez nos offres d'emploi actuelles ou envoyez-nous votre candidature spontanée.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-6 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors">
                                Voir les offres d'emploi
                            </button>
                            <button className="px-6 py-2 border border-white text-white font-medium rounded-md hover:bg-blue-600 transition-colors">
                                Candidature spontanée
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Pied de page */}
            <footer className="bg-white dark:bg-gray-800 shadow-sm p-4 mt-8">
                <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
                    © 2025 Marraudr. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
};

export default Team;
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { ChartBarIcon, UsersIcon, ArrowUpIcon, CubeIcon } from '@heroicons/react/24/outline';

const DashBoard = () => {
    const { t } = useTranslation();

    // Données fictives pour le tableau de bord
    const stats = [
        { label: 'Nombre de membres', value: '128', icon: <UsersIcon className="h-6 w-6 text-blue-500" />, change: '+12%' },
        { label: 'Stock disponible', value: '523', icon: <CubeIcon className="h-6 w-6 text-green-500" />, change: '+8%' },
        { label: 'Activités ce mois', value: '24', icon: <ChartBarIcon className="h-6 w-6 text-purple-500" />, change: '+15%' }
    ];

    return (
        <div className="flex">
            <Sidebar />
            <div className="p-8 ml-16 lg:ml-60 mt-16 w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                    {t('sidebar.dashboard', 'Dashboard')}
                </h1>
                
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <p className="text-3xl font-semibold mt-1 text-gray-800 dark:text-white">{stat.value}</p>
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="flex items-center mt-4 text-green-500">
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                                <span>{stat.change}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">vs mois dernier</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Graphique fictif */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                        {t('dashboard.activities', 'Activités récentes')}
                    </h2>
                    <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            {t('dashboard.graphPlaceholder', 'Graphique d\'activités (données simulées)')}
                        </p>
                    </div>
                </div>
                
                {/* Tableau fictif */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                        {t('dashboard.recentMembers', 'Membres récemment ajoutés')}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date d'ajout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">Marie Dupont</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">marie@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">12/04/2023</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">Jean Martin</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">jean@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">10/04/2023</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">Sophie Petit</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">sophie@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">08/04/2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
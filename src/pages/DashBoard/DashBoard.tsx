import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">{t('welcome')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-4xl">
                <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 transition-colors">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('summary')}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Contenu du résumé...</p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 transition-colors">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('statistics')}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Statistiques...</p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 transition-colors">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('activity')}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Activité récente...</p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 transition-colors">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('settings')}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Paramètres...</p>
                </div>
            </div>
        </div>
    );
}
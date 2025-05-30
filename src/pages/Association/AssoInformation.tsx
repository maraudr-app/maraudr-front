import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface AssociationInfo {
  id: string;
  siret: string;
  name: string;
  address: string;
  // Ajouter d'autres champs selon les besoins
}

const AssoInformation = () => {
  const { t } = useTranslation();
  const [association, setAssociation] = useState<AssociationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Appeler l'API pour récupérer les infos de l'association
    // Pour l'instant, on simule des données
    setAssociation({
      id: '1',
      siret: '00000000000000',
      name: 'Mon Association',
      address: '123 rue de Paris, 75000 Paris'
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <BuildingOfficeIcon className="h-12 w-12 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('association.title', 'Informations de l\'association')}
            </h1>
          </div>

          {association && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('association.name', 'Nom')}
                  </h2>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {association.name}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('association.siret', 'Numéro SIRET')}
                  </h2>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {association.siret}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('association.address', 'Adresse')}
                  </h2>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {association.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssoInformation; 
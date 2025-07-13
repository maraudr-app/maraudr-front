import React, { useState } from 'react';
import { MediaNavbar, PhotoManager, DocumentManager } from '../../components/media';
import { useAssoStore } from '../../store/assoStore';
import { useTranslation } from 'react-i18next';

const Media: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'photos' | 'documents'>('photos');
  const { selectedAssociation } = useAssoStore();

  // Fonction pour les traductions des médias
  const t_media = (key: string): string => {
    return t(`media.${key}` as any);
  };

  if (!selectedAssociation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">{t_media('noAssociation')}</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t_media('noAssociationMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MediaNavbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="pt-16 px-6">
        {activeTab === 'photos' ? (
          <PhotoManager />
        ) : (
          <DocumentManager />
        )}
      </main>
    </div>
  );
};

export default Media; 
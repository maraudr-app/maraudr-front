import React from 'react';
import { XMarkIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TeamMember } from '../../services/teamService';
import { User } from '../../types/user/user';
import { useTranslation } from 'react-i18next';

interface UserDetailsModalProps {
  member: TeamMember | User | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDisponibilities?: (memberId: string) => void;
  onRemoveMember?: (member: TeamMember | User) => void;
  loading?: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  member,
  isOpen,
  onClose,
  onViewDisponibilities,
  onRemoveMember,
  loading = false
}) => {
  const { t } = useTranslation();
  
  // Fonction pour les traductions de l'équipe (même pattern que les autres composants)
  const t_team = (key: string): string => {
    return t(`team.${key}` as any);
  };

  if (!isOpen) return null;
  if (loading || !member) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maraudr-orange mx-auto mb-4"></div>
          <span className="text-gray-700 dark:text-gray-200 ml-4">{t_team('modal.userDetails.loading')}</span>
        </div>
      </div>
    );
  }

  // Mapping pour les langues (exemple simplifié)
  const getLanguageLabel = (lang: any) => {
    if (typeof lang === 'number') {
      const languagesByIndex: Record<number, string> = {
        0: t_team('modal.userDetails.languages.english'),
        1: t_team('modal.userDetails.languages.french'),
        2: t_team('modal.userDetails.languages.spanish'),
        3: t_team('modal.userDetails.languages.german'),
        4: t_team('modal.userDetails.languages.italian')
      };
      return languagesByIndex[lang] || `${t_team('modal.userDetails.languages.language')} ${lang}`;
    }
    const languageMap: Record<string, string> = {
      'French': t_team('modal.userDetails.languages.french'),
      'English': t_team('modal.userDetails.languages.english'),
      'Spanish': t_team('modal.userDetails.languages.spanish'),
      'German': t_team('modal.userDetails.languages.german'),
      'Italian': t_team('modal.userDetails.languages.italian')
    };
    return languageMap[lang as string] || (lang as string);
  };

  // Helpers pour fallback sur les différentes sources de données
  const getEmail = () => member.email || (member as any).contactInfo?.email || '-';
  const getPhone = () => member.phoneNumber || (member as any).contactInfo?.phoneNumber || '-';
  const getAddress = () => {
    const street = member.street || (member as any).address?.street || '';
    const city = member.city || (member as any).address?.city || '';
    const postalCode = member.postalCode || (member as any).address?.postalCode || '';
    const country = member.country || (member as any).address?.country || '';
    const parts = [street, city, postalCode, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {member.firstname} {member.lastname}
            </h2>
            <div className="flex items-center mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${member.isManager ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                {member.isManager ? t_team('member.role.manager') : t_team('member.role.member')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Infos personnelles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{t_team('modal.userDetails.personalInfo')}</span>
              </h3>
              <div className="mb-2">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">{t_team('member.contact.email')}</span>
                <span className="block text-gray-900 dark:text-white">{getEmail()}</span>
              </div>
              <div className="mb-2">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">{t_team('member.contact.phone')}</span>
                <span className="block text-gray-900 dark:text-white">{getPhone()}</span>
              </div>
              <div className="mb-2">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">{t_team('member.contact.address')}</span>
                <span className="block text-gray-900 dark:text-white">{getAddress()}</span>
              </div>
            </div>
            {/* Infos additionnelles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{t_team('modal.userDetails.additionalInfo')}</span>
              </h3>
              <div className="mb-2">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">{t_team('member.languages')}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(member.languages || []).map((lang, i) => (
                    <span key={i} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs">
                      {getLanguageLabel(lang)}
                    </span>
                  ))}
                </div>
              </div>
              {/* Ajoute ici d'autres infos si besoin */}
            </div>
          </div>
          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 flex gap-3">
            {onViewDisponibilities && (
              <button
                onClick={() => onViewDisponibilities(member.id)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {t_team('actions.viewDisponibilities')}
              </button>
            )}
            {onRemoveMember && !member.isManager && (
              <button
                onClick={() => onRemoveMember(member)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {t_team('actions.removeMember')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal; 
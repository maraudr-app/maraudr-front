import React, { useCallback, useState } from 'react';
import { PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';
import { Event } from '../../types/planning/event';
import { useEventBusinessRules } from '../../hooks/useEventBusinessRules';
import { useTranslation } from 'react-i18next';

interface EventActionsProps {
  event: Event;
  onActionSuccess: () => void;
  className?: string;
}

export const EventActions: React.FC<EventActionsProps> = ({
  event,
  onActionSuccess,
  className = ''
}) => {
  const { t } = useTranslation();
  const {
    calculateEventPermissions,
    startEvent,
    finishEvent,
    cancelEvent,
    loading
  } = useEventBusinessRules();

  const t_planning = useCallback((key: string): string => {
    return t(`planning.${key}` as any);
  }, [t]);

  const permissions = calculateEventPermissions(event);
  const isLoading = loading !== null;

  // Ajout d'un état pour la modale de confirmation
  const [pendingAction, setPendingAction] = useState<null | 'start' | 'finish' | 'cancel'>(null);

  const handleStart = useCallback(() => {
    setPendingAction('start');
  }, []);

  const handleFinish = useCallback(() => {
    setPendingAction('finish');
  }, []);

  const handleCancel = useCallback(() => {
    setPendingAction('cancel');
  }, []);

  const handleConfirm = async () => {
    if (pendingAction === 'start') {
      await startEvent(event.id, onActionSuccess);
    } else if (pendingAction === 'finish') {
      await finishEvent(event.id, onActionSuccess);
    } else if (pendingAction === 'cancel') {
      await cancelEvent(event.id, onActionSuccess);
    }
    setPendingAction(null);
  };

  const handleCloseModal = () => {
    setPendingAction(null);
  };

  // Si aucune action n'est disponible, ne rien afficher
  if (!permissions.canStart && !permissions.canFinish && !permissions.canCancel) {
    return null;
  }

  // Texte, icône et couleur de confirmation selon l'action
  let confirmTitle = '';
  let confirmMessage = '';
  let icon: React.ReactNode = null;
  let color = '';
  let bgIcon = '';
  if (pendingAction === 'start') {
    confirmTitle = t_planning('events.actions.start');
    confirmMessage = t_planning('events.actions.startConfirm');
    icon = <PlayIcon className="h-6 w-6 text-green-600 dark:text-green-400" />;
    color = 'bg-green-600 hover:bg-green-700';
    bgIcon = 'bg-green-100 dark:bg-green-900/20';
  } else if (pendingAction === 'finish') {
    confirmTitle = t_planning('events.actions.finish');
    confirmMessage = t_planning('events.actions.finishConfirm');
    icon = <StopIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    color = 'bg-blue-600 hover:bg-blue-700';
    bgIcon = 'bg-blue-100 dark:bg-blue-900/20';
  } else if (pendingAction === 'cancel') {
    confirmTitle = t_planning('events.actions.cancel');
    confirmMessage = t_planning('events.actions.cancelConfirm');
    icon = <XMarkIcon className="h-6 w-6 text-red-600 dark:text-red-400" />;
    color = 'bg-red-600 hover:bg-red-700';
    bgIcon = 'bg-red-100 dark:bg-red-900/20';
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {permissions.canStart && (
          <Button
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => { e?.stopPropagation(); handleStart(); }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            {t_planning('events.actions.start')}
          </Button>
        )}

        {permissions.canFinish && (
          <Button
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => { e?.stopPropagation(); handleFinish(); }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <StopIcon className="w-4 h-4" />
            {t_planning('events.actions.finish')}
          </Button>
        )}

        {permissions.canCancel && (
          <Button
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => { e?.stopPropagation(); handleCancel(); }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            {t_planning('events.actions.cancel')}
          </Button>
        )}
      </div>

      {/* Modale de confirmation custom */}
      {pendingAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[500]">
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 border w-11/12 md:w-96 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${bgIcon}`}>
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {confirmTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {confirmMessage}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={e => { e.stopPropagation(); handleCloseModal(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t_planning('availability.cancel')}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleConfirm(); }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${color}`}
                >
                  {t_planning('events.actions.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 
import React, { useMemo, useCallback } from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Event, EventStatus } from '../../types/planning/event';
import { useEventBusinessRules } from '../../hooks/useEventBusinessRules';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '../../utils/dateUtils';

interface EventSummaryProps {
  events: Event[];
  className?: string;
}

export const EventSummary: React.FC<EventSummaryProps> = ({
  events,
  className = ''
}) => {
  const { t } = useTranslation();
  const { calculateEventTiming } = useEventBusinessRules();

  const t_planning = useCallback((key: string): string => {
    return t(`planning.${key}` as any);
  }, [t]);

  // Calculer les statistiques des événements avec useMemo
  const stats = useMemo(() => {
    return events.reduce((acc, event) => {
      const timing = calculateEventTiming(event);
      const eventStatus = event.status || EventStatus.CREATED;
      
      if (eventStatus === EventStatus.CANCELED) {
        acc.canceled++;
      } else if (eventStatus === EventStatus.FINISHED || timing.isFinished) {
        acc.finished++;
      } else if (eventStatus === EventStatus.ONGOING || timing.isOngoing) {
        acc.ongoing++;
      } else if (timing.timeUntilStart <= 15 && timing.timeUntilStart > 0) {
        acc.startingSoon++;
      } else if (timing.timeUntilStart <= 0) {
        acc.startingNow++;
      } else {
        acc.upcoming++;
      }
      
      return acc;
    }, {
      upcoming: 0,
      startingSoon: 0,
      startingNow: 0,
      ongoing: 0,
      finished: 0,
      canceled: 0
    });
  }, [events, calculateEventTiming]);

  const totalEvents = events.length;
  const activeEvents = stats.ongoing + stats.startingNow + stats.startingSoon;

  if (totalEvents === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 ${className}`}>
        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">{t_planning('summary_noEvents')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 ${className}`}>
      <div className="flex flex-row items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t_planning('summary_title')}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalEvents} {t_planning('summary_total')}
        </div>
      </div>

      <div className="flex flex-row justify-between">
        {/* Événements à venir */}
        {stats.upcoming > 0 && (
          <div className="flex items-center space-x-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.upcoming}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('status_created')}</div>
            </div>
          </div>
        )}

        {/* Événements qui démarrent bientôt */}
        {stats.startingSoon > 0 && (
          <div className="flex items-center space-x-1.5">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.startingSoon}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('summary_startingSoon')}</div>
            </div>
          </div>
        )}

        {/* Événements qui démarrent maintenant */}
        {stats.startingNow > 0 && (
          <div className="flex items-center space-x-1.5">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.startingNow}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('timing_startsNow')}</div>
            </div>
          </div>
        )}

        {/* Événements en cours */}
        {stats.ongoing > 0 && (
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.ongoing}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('status_ongoing')}</div>
            </div>
          </div>
        )}

        {/* Événements terminés */}
        {stats.finished > 0 && (
          <div className="flex items-center space-x-1.5">
            <CheckCircleIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.finished}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('status_finished')}</div>
            </div>
          </div>
        )}

        {/* Événements annulés */}
        {stats.canceled > 0 && (
          <div className="flex items-center space-x-1.5">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.canceled}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t_planning('status_canceled')}</div>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
}; 
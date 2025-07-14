import React, { useEffect, useState, useCallback } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Event, EventStatus } from '../../types/planning/event';
import { useEventBusinessRules } from '../../hooks/useEventBusinessRules';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '../../utils/dateUtils';

interface EventNotificationsProps {
  events: Event[];
  className?: string;
}

interface Notification {
  id: string;
  event: Event;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

export const EventNotifications: React.FC<EventNotificationsProps> = ({
  events,
  className = ''
}) => {
  const { t } = useTranslation();
  const { calculateEventTiming } = useEventBusinessRules();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const t_planning = useCallback((key: string): string => {
    return t(`planning.${key}` as any);
  }, [t]);

  // Générer les notifications basées sur les événements
  useEffect(() => {
    const now = new Date();
    const newNotifications: Notification[] = [];

    events.forEach(event => {
      const timing = calculateEventTiming(event);
      const eventStatus = event.status || EventStatus.CREATED;
      
      // Événement qui démarre dans 15 minutes
      if (timing.timeUntilStart <= 15 && timing.timeUntilStart > 0) {
        newNotifications.push({
          id: `start-${event.id}`,
          event,
          message: t_planning('events_timing_startsIn').replace('{time}', timing.startsIn),
          type: 'warning',
          timestamp: now
        });
      }
      
      // Événement qui démarre maintenant
      if (timing.timeUntilStart <= 0 && timing.timeUntilStart > -5) {
        newNotifications.push({
          id: `start-now-${event.id}`,
          event,
          message: t_planning('events_timing_startsNow'),
          type: 'info',
          timestamp: now
        });
      }
      
      // Événement en cours
      if (timing.isOngoing && timing.timeUntilEnd <= 30) {
        newNotifications.push({
          id: `ongoing-${event.id}`,
          event,
          message: t_planning('status_ongoing'),
          type: 'success',
          timestamp: now
        });
      }
    });

    setNotifications(newNotifications);
  }, [events, calculateEventTiming, t_planning]);

  // Supprimer une notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Auto-suppression des notifications après 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev => 
        prev.filter(n => now.getTime() - n.timestamp.getTime() < 30000)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300';
      case 'info':
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-center justify-between p-3 rounded-lg border shadow-lg max-w-sm ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-center space-x-2">
            <BellIcon className="w-5 h-5" />
            <div>
              <div className="font-medium text-sm">{notification.event.title}</div>
              <div className="text-xs opacity-90">{notification.message}</div>
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-current hover:opacity-70 transition-opacity"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}; 
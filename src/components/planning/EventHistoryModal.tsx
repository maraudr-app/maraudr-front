import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Event, EventStatus } from '../../types/planning/event';
import { useEventBusinessRules } from '../../hooks/useEventBusinessRules';
import { useTranslation } from 'react-i18next';
import { parseLocalDate, formatDisplayTimeRange } from '../../utils/dateUtils';
import { Input } from '../common/input/input';

interface EventHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: Event[];
    teamUsers: any[];
}

type EventFilter = 'all' | 'past' | 'upcoming' | 'current-month';

export const EventHistoryModal: React.FC<EventHistoryModalProps> = ({
    isOpen,
    onClose,
    events,
    teamUsers
}) => {
    const { t } = useTranslation();
    const { calculateEventTiming, getEventDisplayStatus, getEventStatusColor } = useEventBusinessRules();
    
    const t_planning = (key: string): string => {
        return t(`planning.${key}` as any);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<EventFilter>('all');

    // Filtrer les événements selon les critères
    const filteredEvents = useMemo(() => {
        let filtered = events;

        // Filtre par statut
        switch (selectedFilter) {
            case 'past':
                filtered = filtered.filter(event => {
                    const timing = calculateEventTiming(event);
                    return timing.isPast;
                });
                break;
            case 'upcoming':
                filtered = filtered.filter(event => {
                    const timing = calculateEventTiming(event);
                    return !timing.isPast;
                });
                break;
            case 'current-month':
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                filtered = filtered.filter(event => {
                    const eventDate = parseLocalDate(event.beginningDate);
                    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
                });
                break;
            default:
                // 'all' - pas de filtre
                break;
        }

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Trier par date (plus récent en premier)
        return filtered.sort((a, b) => {
            const dateA = parseLocalDate(a.beginningDate);
            const dateB = parseLocalDate(b.beginningDate);
            return dateB.getTime() - dateA.getTime();
        });
    }, [events, selectedFilter, searchTerm, calculateEventTiming]);

    // Obtenir le temps relatif (dans 1 mois, dans 1 jour, etc.)
    const getRelativeTime = (event: Event): string => {
        const timing = calculateEventTiming(event);
        const now = new Date();
        const eventDate = parseLocalDate(event.beginningDate);
        
        if (timing.isPast) {
            const diffTime = now.getTime() - eventDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return t_planning('history_yesterday');
            if (diffDays <= 7) return t_planning('history_daysAgo').replace('{days}', diffDays.toString());
            if (diffDays <= 30) return t_planning('history_weeksAgo').replace('{weeks}', Math.ceil(diffDays / 7).toString());
            return t_planning('history_monthsAgo').replace('{months}', Math.ceil(diffDays / 30).toString());
        } else {
            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return t_planning('history_tomorrow');
            if (diffDays <= 7) return t_planning('history_inDays').replace('{days}', diffDays.toString());
            if (diffDays <= 30) return t_planning('history_inWeeks').replace('{weeks}', Math.ceil(diffDays / 7).toString());
            return t_planning('history_inMonths').replace('{months}', Math.ceil(diffDays / 30).toString());
        }
    };

    // Obtenir le statut de l'événement
    const getEventStatus = (event: Event): { text: string; color: string } => {
        const timing = calculateEventTiming(event);
        const eventStatus = event.status || EventStatus.CREATED;
        
        if (eventStatus === EventStatus.CANCELED) {
            return { text: t_planning('status_canceled'), color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
        }
        
        if (eventStatus === EventStatus.FINISHED || timing.isFinished) {
            return { text: t_planning('status_finished'), color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20' };
        }
        
        if (eventStatus === EventStatus.ONGOING || timing.isOngoing) {
            return { text: t_planning('status_ongoing'), color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
        }
        
        if (timing.isPast) {
            return { text: t_planning('history_pastEvent'), color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20' };
        }
        
        return { text: t_planning('history_upcomingEvent'), color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <CalendarIcon className="w-6 h-6 text-blue-500 mr-3" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {t_planning('history_title')} ({filteredEvents.length})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Filtres et recherche */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Barre de recherche */}
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder={t_planning('history_searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        
                        {/* Filtres */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedFilter('all')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    selectedFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {t_planning('history_filterAll')}
                            </button>
                            <button
                                onClick={() => setSelectedFilter('past')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    selectedFilter === 'past'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {t_planning('history_filterPast')}
                            </button>
                            <button
                                onClick={() => setSelectedFilter('upcoming')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    selectedFilter === 'upcoming'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {t_planning('history_filterUpcoming')}
                            </button>
                            <button
                                onClick={() => setSelectedFilter('current-month')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    selectedFilter === 'current-month'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {t_planning('history_filterCurrentMonth')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table des événements */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableTitle')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableLocation')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableParticipants')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableStatus')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t_planning('history_tableRelativeTime')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t_planning('history_noEvents')}
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => {
                                    const status = getEventStatus(event);
                                    const participants = event.participantsIds?.map(id => {
                                        const user = teamUsers.find(u => u.id === id);
                                        return user ? `${user.firstname} ${user.lastname}` : '';
                                    }).filter(Boolean).join(', ') || t_planning('history_noParticipants');
                                    
                                    return (
                                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.title}
                                                    </div>
                                                    {event.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                            {event.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatDisplayTimeRange(
                                                    parseLocalDate(event.beginningDate),
                                                    parseLocalDate(event.endDate)
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {event.location || t_planning('history_noLocation')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                    {participants}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {getRelativeTime(event)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}; 
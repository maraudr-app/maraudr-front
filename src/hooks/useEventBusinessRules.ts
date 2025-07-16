import { useState, useEffect, useCallback } from 'react';
import { Event, EventStatus } from '../types/planning/event';
import { planningService } from '../services/planningService';
import { useAuthStore } from '../store/authStore';
import { useAssoStore } from '../store/assoStore';
import { geoService } from '../services/geoService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '../utils/dateUtils';

export interface EventTiming {
  isPast: boolean;
  isStarted: boolean;
  isOngoing: boolean;
  isFinished: boolean;
  startsIn: string;
  endsIn: string;
  timeUntilStart: number; // en minutes
  timeUntilEnd: number; // en minutes
}

export interface EventPermissions {
  canStart: boolean;
  canFinish: boolean;
  canCancel: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const useEventBusinessRules = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { selectedAssociation } = useAssoStore();
  const [loading, setLoading] = useState<string | null>(null);

  const t_planning = useCallback((key: string): string => {
    return t(`planning.${key}` as any);
  }, [t]);

  // Calculer le timing d'un événement
  const calculateEventTiming = useCallback((event: Event): EventTiming => {
    const now = new Date();
    const startDate = parseLocalDate(event.beginningDate);
    const endDate = parseLocalDate(event.endDate);

    const timeUntilStart = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60));
    const timeUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60));

    const isPast = endDate < now;
    const isStarted = startDate <= now;
    const isOngoing = isStarted && endDate > now;
    const isFinished = endDate <= now;

    const formatTime = (minutes: number): string => {
      if (minutes < 0) return '';
      if (minutes < 60) return `${minutes}${t_planning('timing.minutes')}`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}${t_planning('timing.hours')}`;
      return `${Math.floor(minutes / 1440)}${t_planning('timing.days')}`;
    };

    return {
      isPast,
      isStarted,
      isOngoing,
      isFinished,
      startsIn: formatTime(timeUntilStart),
      endsIn: formatTime(timeUntilEnd),
      timeUntilStart,
      timeUntilEnd
    };
  }, [t_planning]);

  // Calculer les permissions d'un utilisateur sur un événement
  const calculateEventPermissions = useCallback((event: Event): EventPermissions => {
    if (!user) {
      return {
        canStart: false,
        canFinish: false,
        canCancel: false,
        canEdit: false,
        canDelete: false
      };
    }

    const isManager = user.userType === 'Manager';
    const isOrganizer = event.organizerdId === user.sub;
    const isParticipant = event.participantsIds.includes(user.sub);
    const timing = calculateEventTiming(event);
    
    // Valeur par défaut pour le statut si non défini
    const eventStatus = event.status || EventStatus.CREATED;

    // Règles métier selon le backend
    const canStart = false; // Désactivé - on ne garde que le bouton Annuler

    const canFinish = (isManager || isOrganizer || isParticipant) && 
                     eventStatus === EventStatus.ONGOING;

    const canCancel = (isManager || isOrganizer) && 
                     eventStatus !== EventStatus.FINISHED && 
                     eventStatus !== EventStatus.CANCELED &&
                     !timing.isPast; // Ne peut pas annuler un événement passé

    const canEdit = (isManager || isOrganizer) && 
                   !timing.isPast && 
                   eventStatus !== EventStatus.FINISHED && 
                   eventStatus !== EventStatus.CANCELED;

    const canDelete = (isManager || isOrganizer) && 
                     !timing.isPast; // Ne peut pas supprimer un événement passé

    return {
      canStart,
      canFinish,
      canCancel,
      canEdit,
      canDelete
    };
  }, [user, calculateEventTiming]);

  // Démarrer un événement
  const startEvent = useCallback(async (eventId: string, onSuccess?: () => void) => {
    try {
      setLoading(`start-${eventId}`);
      await planningService.startEvent(eventId);
      toast.success(t_planning('events.actions.startSuccess'));
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur lors du démarrage:', error);
      toast.error(error.message || t_planning('events.actions.startError'));
    } finally {
      setLoading(null);
    }
  }, [t_planning]);

  // Terminer un événement
  const finishEvent = useCallback(async (eventId: string, onSuccess?: () => void) => {
    try {
      setLoading(`finish-${eventId}`);
      await planningService.finishEvent(eventId);
      toast.success(t_planning('events.actions.finishSuccess'));
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur lors de la finalisation:', error);
      toast.error(error.message || t_planning('events.actions.finishError'));
    } finally {
      setLoading(null);
    }
  }, [t_planning]);

  // Annuler un événement
  const cancelEvent = useCallback(async (eventId: string, onSuccess?: () => void) => {
    try {
      setLoading(`cancel-${eventId}`);
      
      // Annuler l'événement
      await planningService.cancelEvent(eventId);
      
      // Gérer les itinéraires liés à cet événement
      if (selectedAssociation?.id) {
        try {
          // Récupérer tous les itinéraires de l'association
          const itineraries = await geoService.getItineraries(selectedAssociation.id);
          
          // Filtrer les itinéraires liés à cet événement
          const relatedItineraries = itineraries.filter((itinerary: any) => 
            itinerary.eventId === eventId && itinerary.isActive
          );
          
          // Mettre à jour les itinéraires liés en désactivant leur statut
          const updatePromises = relatedItineraries.map((itinerary: any) =>
            geoService.updateItinerary(itinerary.id, { isActive: false })
          );
          
          await Promise.all(updatePromises);
          
          if (relatedItineraries.length > 0) {
            console.log(`✅ ${relatedItineraries.length} itinéraire(s) désactivé(s) pour l'événement ${eventId}`);
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de la mise à jour des itinéraires liés:', error);
          // On continue même si la mise à jour des itinéraires échoue
        }
      }
      
      // Émettre un événement personnalisé pour notifier les autres pages
      window.dispatchEvent(new CustomEvent('eventCanceled', { 
        detail: { eventId, associationId: selectedAssociation?.id } 
      }));
      
      toast.success(t_planning('events.actions.cancelSuccess'));
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.message || t_planning('events.actions.cancelError'));
    } finally {
      setLoading(null);
    }
  }, [t_planning, selectedAssociation?.id]);

  // Obtenir le statut d'affichage d'un événement
  const getEventDisplayStatus = useCallback((event: Event): string => {
    const timing = calculateEventTiming(event);
    const eventStatus = event.status || EventStatus.CREATED;
    
    if (eventStatus === EventStatus.CANCELED) {
      return t_planning('status_canceled');
    }
    
    if (eventStatus === EventStatus.FINISHED || timing.isFinished) {
      return t_planning('status_finished');
    }
    
    if (eventStatus === EventStatus.ONGOING || timing.isOngoing) {
      return t_planning('status_ongoing');
    }
    
    if (timing.timeUntilStart <= 15 && timing.timeUntilStart > 0) {
      return t_planning('events_timing_startsIn').replace('{time}', timing.startsIn);
    }
    
    if (timing.timeUntilStart <= 0) {
      return t_planning('events_timing_startsNow');
    }
    
    return t_planning('status_created');
  }, [calculateEventTiming, t_planning]);

  // Obtenir la couleur du statut
  const getEventStatusColor = useCallback((event: Event): string => {
    const timing = calculateEventTiming(event);
    const eventStatus = event.status || EventStatus.CREATED;
    
    if (eventStatus === EventStatus.CANCELED) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    }
    
    if (eventStatus === EventStatus.FINISHED || timing.isFinished) {
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
    
    if (eventStatus === EventStatus.ONGOING || timing.isOngoing) {
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
    
    if (timing.timeUntilStart <= 15 && timing.timeUntilStart > 0) {
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    }
    
    if (timing.timeUntilStart <= 0) {
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
    
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }, [calculateEventTiming]);

  // Déterminer si les champs de formulaire doivent être désactivés
  const shouldDisableFormFields = useCallback((event: Event): boolean => {
    const timing = calculateEventTiming(event);
    const eventStatus = event.status || EventStatus.CREATED;
    
    return timing.isPast || 
           eventStatus === EventStatus.FINISHED || 
           eventStatus === EventStatus.CANCELED;
  }, [calculateEventTiming]);

  return {
    calculateEventTiming,
    calculateEventPermissions,
    startEvent,
    finishEvent,
    cancelEvent,
    getEventDisplayStatus,
    getEventStatusColor,
    shouldDisableFormFields,
    loading
  };
}; 
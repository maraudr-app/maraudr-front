export interface Event {
  id: string;
  planningId: string;
  organizerdId: string;
  participantsIds: string[];
  beginningDate: string; // ISO string format
  endDate: string; // ISO string format
  title: string;
  description: string;
  location: string;
  status?: EventStatus; // Optionnel pour la compatibilité avec les événements existants
}

export enum EventStatus {
  CREATED = 'CREATED',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED'
}

export interface CreateEventRequest {
  planningId: string;
  organizerdId: string;
  participantsIds: string[];
  title: string;
  description: string;
  beginningDate: string;
  endDate: string;
  location: string;
}

// Type pour l'API directe (sans planningId)
export interface CreateEventDto {
  associationId: string;
  participantsIds: string[];
  beginningDate: string;
  endDate: string;
  title: string;
  description: string;
  location: string;
}

export interface UpdateEventRequest {
  participantsIds?: string[];
  beginningDate?: string;
  endDate?: string;
  title?: string;
  description?: string;
  location?: string;
}

export interface AddParticipantRequest {
  eventId: string;
  participantId: string;
}

export interface RemoveParticipantRequest {
  eventId: string;
  participantId: string;
} 
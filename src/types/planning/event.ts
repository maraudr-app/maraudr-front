export interface Event {
  id: string;
  planningId: string;
  organizerId: string;
  participantsIds: string[];
  beginningDate: string; // ISO string format
  endDate: string; // ISO string format
  title: string;
  description: string;
  location: string;
}

export interface CreateEventRequest {
  planningId: string;
  organizerId: string;
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
  id: string;
  planningId?: string;
  organizerId?: string;
  participantsIds?: string[];
  title?: string;
  description?: string;
  beginningDate?: string;
  endDate?: string;
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
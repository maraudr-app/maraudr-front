import { Event } from './event';

export interface Planning {
  id: string;
  associationId: string;
  events: Event[];
}

export interface CreatePlanningRequest {
  associationId: string;
}

export interface UpdatePlanningRequest {
  id: string;
  associationId: string;
  events: Event[];
} 
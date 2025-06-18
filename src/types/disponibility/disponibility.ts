export interface Disponibility {
  id: string;
  userId: string;
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  associationId: string;
}

export interface DisponibilityToCreate {
  userId: string;
  start: string;
  end: string;
  associationId: string;
} 
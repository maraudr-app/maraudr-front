import { api } from './api';

interface AssoResponse {
  id: string;
  siret: string;
  // ... autres champs
}

export const assoService = {
  createAssociation: async (siret: string): Promise<AssoResponse> => {
    const response = await api.post<AssoResponse>(`/association?siret=${encodeURIComponent(siret)}`);
    return response.data;
  }
}; 
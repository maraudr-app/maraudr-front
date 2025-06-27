// Configuration des variables d'environnement
export const config = {
  // URLs des services backend
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8082',
  assoApiUrl: import.meta.env.VITE_ASSO_API_URL || 'http://localhost:8080',
  stockApiUrl: import.meta.env.VITE_STOCK_API_URL || 'http://localhost:8081',
  geoApiUrl: import.meta.env.VITE_GEO_API_URL || 'http://localhost:8084',
  
  // URL du frontend pour les liens d'invitation
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
};

// Fonction utilitaire pour générer les liens d'invitation
export const generateInvitationUrl = (token: string): string => {
  return `${config.frontendUrl}/accept-invitation?token=${encodeURIComponent(token)}`;
}; 
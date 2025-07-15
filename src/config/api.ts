// Configuration API selon l'environnement
// Détection automatique de l'environnement
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

// Logs de debug pour vérifier la détection
console.log('🔍 Debug Environment Detection:');
console.log('import.meta.env.PROD:', import.meta.env.PROD);
console.log('import.meta.env.MODE:', import.meta.env.MODE);
console.log('window.location.hostname:', window.location.hostname);
console.log('isProduction:', isProduction);

// En production, utiliser l'URL de votre serveur de production
// En développement, utiliser localhost
const API_DOMAIN = isProduction 
  ? (import.meta.env.VITE_API_DOMAIN_PROD || 'https://api.maraudr.eu') // URL de votre serveur de production
  : (import.meta.env.VITE_API_DOMAIN_LOCAL || 'http://localhost:8082');

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';

const PORTS: Record<string, string> = {
  association: import.meta.env.VITE_MODULE_ASSOCIATION_PORT || '8080',
  stock: import.meta.env.VITE_MODULE_STOCK_PORT || '8081',
  user: import.meta.env.VITE_MODULE_USER_PORT || '8082',
  email: import.meta.env.VITE_MODULE_EMAIL_PORT || '8083',
  geo: import.meta.env.VITE_MODULE_GEO_PORT || '8084',
  planning: import.meta.env.VITE_MODULE_PLANNING_PORT || '8085',
  mcp: import.meta.env.VITE_MODULE_MCP_PORT || '8086',
  document: import.meta.env.VITE_MODULE_DOCUMENT_PORT || '8087',
};

/**
 * Génère l'URL d'API pour un module donné
 * En production: https://api.maraudr.com/api/...
 * En développement: http://localhost:8082/api/...
 */
export const getModuleApiUrl = (module: keyof typeof PORTS): string => {
  if (isProduction) {
    // En production, tous les modules utilisent le même domaine
    return `${API_DOMAIN}${API_PREFIX}`;
  } else {
    // En développement, chaque module a son propre port
    if (module === 'user') {
      // Module user en développement: http://localhost:8082/api/...
      return `${API_DOMAIN}:${PORTS[module]}${API_PREFIX}`;
    } else if (module === 'planning') {
      // Module planning en développement: http://localhost:8085/api/...
      return `${API_DOMAIN}:${PORTS[module]}${API_PREFIX}`;
    } else {
      // Autres modules en développement: http://localhost:8081/...
      return `${API_DOMAIN}:${PORTS[module]}`;
    }
  }
};

/**
 * Génère l'URL de base d'un module (sans /api)
 * En production: https://api.maraudr.com
 * En développement: http://localhost:8082
 */
export const getModuleBaseUrl = (module: keyof typeof PORTS): string => {
  if (isProduction) {
    return API_DOMAIN;
  } else {
    return `${API_DOMAIN}:${PORTS[module]}`;
  }
};

// Fonction de debug pour vérifier les URLs générées
export const debugApiUrls = () => {
  console.log('🔧 Configuration API Debug:');
  console.log('Mode:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('API_DOMAIN:', API_DOMAIN);
  console.log('API_PREFIX:', API_PREFIX);

  const modules: (keyof typeof PORTS)[] = ['user', 'stock', 'association', 'geo', 'planning', 'mcp', 'document'];

  modules.forEach(module => {
    console.log(`${module}:`);
    console.log(`  API URL: ${getModuleApiUrl(module)}`);
    console.log(`  Base URL: ${getModuleBaseUrl(module)}`);
  });
};

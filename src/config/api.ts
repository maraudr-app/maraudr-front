const isProd = import.meta.env.VITE_NODE_ENV === 'production';

const API_DOMAIN = isProd
  ? import.meta.env.VITE_API_DOMAIN_PROD
  : import.meta.env.VITE_API_DOMAIN_LOCAL;

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
 * 
 * En développement:
 * - user: http://localhost:8082/api/... (seul user a /api/)
 * - stock: http://localhost:8081/... (pas de /api/)
 * - association: http://localhost:8080/... (pas de /api/)
 * 
 * En production:
 * - user: https://api.maraudr.eu/user/api/... (seul user a /api/)
 * - stock: https://api.maraudr.eu/stock/... (pas de /api/)
 * - association: https://api.maraudr.eu/association/... (pas de /api/)
 */
export const getModuleApiUrl = (module: keyof typeof PORTS): string => {
  if (isProd) {
    if (module === 'user') {
      // Module user en production: https://api.maraudr.eu/user/api/...
      return `${API_DOMAIN}/${module}${API_PREFIX}`;
    } else {
      // Autres modules en production: https://api.maraudr.eu/stock/... (pas de /api/)
      return `${API_DOMAIN}/${module}`;
    }
  } else {
    if (module === 'user') {
      // Module user en développement: http://localhost:8082/api/...
      return `${API_DOMAIN}:${PORTS[module]}${API_PREFIX}`;
    } else {
      // Autres modules en développement: http://localhost:8081/... (pas de /api/)
      return `${API_DOMAIN}:${PORTS[module]}`;
    }
  }
};

/**
 * Génère l'URL de base d'un module (sans /api)
 * 
 * En développement:
 * - user: http://localhost:8082 (pour les routes comme /managers/team/)
 * - stock: http://localhost:8081
 * 
 * En production:
 * - user: https://api.maraudr.eu/user (pour les routes comme /managers/team/)
 * - stock: https://api.maraudr.eu/stock
 */
export const getModuleBaseUrl = (module: keyof typeof PORTS): string => {
  if (isProd) {
    // Tous les modules en production ont leur préfixe: /user, /stock, etc.
    return `${API_DOMAIN}/${module}`;
  } else {
    // Tous les modules en développement utilisent les ports: localhost:8082, etc.
    return `${API_DOMAIN}:${PORTS[module]}`;
  }
};

// Fonction de debug pour vérifier les URLs générées
export const debugApiUrls = () => {
  console.log('🔧 Configuration API Debug:');
  console.log('Mode:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('API_DOMAIN:', API_DOMAIN);
  console.log('API_PREFIX:', API_PREFIX);
  
  const modules: (keyof typeof PORTS)[] = ['user', 'stock', 'association', 'geo', 'planning', 'mcp', 'document'];
  
  modules.forEach(module => {
    console.log(`${module}:`);
    console.log(`  API URL: ${getModuleApiUrl(module)}`);
    console.log(`  Base URL: ${getModuleBaseUrl(module)}`);
  });
};

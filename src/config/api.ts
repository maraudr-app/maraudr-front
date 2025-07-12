// Forcer le mode local uniquement
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN_LOCAL;
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
 * Génère l'URL d'API pour un module donné (local uniquement)
 * - user: http://localhost:8082/api/...
 * - stock: http://localhost:8081/...
 * - association: http://localhost:8080/...
 */
export const getModuleApiUrl = (module: keyof typeof PORTS): string => {
  if (module === 'user') {
    // Module user en développement: http://localhost:8082/api/...
    return `${API_DOMAIN}:${PORTS[module]}${API_PREFIX}`;
  } else {
    // Autres modules en développement: http://localhost:8081/...
    return `${API_DOMAIN}:${PORTS[module]}`;
  }
};

/**
 * Génère l'URL de base d'un module (sans /api, local uniquement)
 * - user: http://localhost:8082
 * - stock: http://localhost:8081
 */
export const getModuleBaseUrl = (module: keyof typeof PORTS): string => {
  return `${API_DOMAIN}:${PORTS[module]}`;
};

// Fonction de debug pour vérifier les URLs générées
export const debugApiUrls = () => {
  console.log('🔧 Configuration API Debug:');
  console.log('Mode: LOCAL UNIQUEMENT');
  console.log('API_DOMAIN:', API_DOMAIN);
  console.log('API_PREFIX:', API_PREFIX);

  const modules: (keyof typeof PORTS)[] = ['user', 'stock', 'association', 'geo', 'planning', 'mcp', 'document'];

  modules.forEach(module => {
    console.log(`${module}:`);
    console.log(`  API URL: ${getModuleApiUrl(module)}`);
    console.log(`  Base URL: ${getModuleBaseUrl(module)}`);
  });
};

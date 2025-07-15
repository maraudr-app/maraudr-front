// Configuration API selon l'environnement
// Détection automatique de l'environnement
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

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

// Modules qui utilisent /api dans leurs routes (Controllers)
const MODULES_WITH_API_PREFIX = ['planning', 'user', 'mcp'];

// Mapping des noms de modules pour les URLs
const MODULE_URL_NAMES: Record<string, string> = {
  association: 'association',
  stock: 'stock', 
  user: 'user',
  email: 'email',
  geo: 'geo',
  planning: 'planning',
  mcp: 'mcp',
  document: 'document'
};

/**
 * Génère l'URL d'API pour un module donné
 * En production: https://api.maraudr.eu/api/... (pour user, planning, mcp avec Controllers)
 * En production: https://api.maraudr.eu/geo/... (pour geo, stock, association, etc.)
 * En développement: http://localhost:8082/api/... ou http://localhost:8084/...
 */
export const getModuleApiUrl = (module: keyof typeof PORTS): string => {
  const moduleName = MODULE_URL_NAMES[module];
  
  if (isProduction) {
    // En production, tous les modules utilisent le même domaine
    if (MODULES_WITH_API_PREFIX.includes(module)) {
      // Modules qui ont /api dans leurs routes (Controllers)
      // En production, les Controllers sont montés directement sur le domaine principal
      return API_DOMAIN;
    } else {
      // Modules sans /api dans leurs routes (Program.cs)
      return `${API_DOMAIN}/${moduleName}`;
    }
  } else {
    // En développement, chaque module a son propre port
    const baseUrl = `${API_DOMAIN}:${PORTS[module]}`;
    if (MODULES_WITH_API_PREFIX.includes(module)) {
      // Modules qui ont /api dans leurs routes (Controllers)
      // En dev, on ajoute /api car le Controller l'attend
      return `${baseUrl}${API_PREFIX}`;
    } else {
      // Modules sans /api dans leurs routes (Program.cs)
      return baseUrl;
    }
  }
};

/**
 * Génère l'URL de base d'un module (sans /api)
 * En production: https://api.maraudr.eu/user
 * En développement: http://localhost:8082
 */
export const getModuleBaseUrl = (module: keyof typeof PORTS): string => {
  const moduleName = MODULE_URL_NAMES[module];
  
  if (isProduction) {
    if (MODULES_WITH_API_PREFIX.includes(module)) {
      return `${API_DOMAIN}/${moduleName}`;
    } else {
      return `${API_DOMAIN}/${moduleName}`;
    }
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
    console.log(`  Uses API prefix: ${MODULES_WITH_API_PREFIX.includes(module)}`);
    console.log(`  Module URL name: ${MODULE_URL_NAMES[module]}`);
  });
};

// Configuration API selon l'environnement
// Détection automatique de l'environnement
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

// En production, utiliser l'URL de votre serveur de production
// En développement, utiliser localhost
const API_DOMAIN = isProduction 
  ? (import.meta.env.VITE_API_DOMAIN_PROD || 'https://api.maraudr.eu') // URL de votre serveur de production
  : (import.meta.env.VITE_API_DOMAIN_LOCAL || 'http://localhost');

// Ports en développement (selon compose.yaml)
const PORTS: Record<string, string> = {
  association: '8080',
  stock: '8081',
  user: '8082',
  email: '8083',
  geo: '8084',
  planning: '8085',
  mcp: '8086',
  document: '8087',
};

// Noms de modules pour la production (au singulier, sans 's')
const MODULE_NAMES: Record<string, string> = {
  association: 'association',
  stock: 'stock', 
  user: 'user',
  email: 'email',
  geo: 'geo',
  planning: 'planning',
  mcp: 'mcp',
  document: 'document'
};

// Modules qui utilisent /api dans leurs routes (Controllers)
const MODULES_WITH_API_PREFIX = ['user', 'planning', 'mcp'];

/**
 * Génère l'URL d'API pour un module donné
 * En développement: http://localhost:PORT
 * En production: https://api.maraudr.eu/MODULE
 * 
 * Pour les modules avec Controllers (/api): https://api.maraudr.eu/MODULE/api
 * Pour les modules sans Controllers: https://api.maraudr.eu/MODULE
 */
export const getModuleApiUrl = (module: keyof typeof PORTS): string => {
  const moduleName = MODULE_NAMES[module];
  
  if (isProduction) {
    // En production
    if (MODULES_WITH_API_PREFIX.includes(module)) {
      // Modules avec Controllers: https://api.maraudr.eu/MODULE/api
      return `${API_DOMAIN}/${moduleName}/api`;
    } else {
      // Modules sans Controllers: https://api.maraudr.eu/MODULE
      return `${API_DOMAIN}/${moduleName}`;
    }
  } else {
    // En développement: http://localhost:PORT
    return `${API_DOMAIN}:${PORTS[module]}`;
  }
};

/**
 * Génère l'URL de base d'un module (sans /api)
 * En développement: http://localhost:PORT
 * En production: https://api.maraudr.eu/MODULE
 */
export const getModuleBaseUrl = (module: keyof typeof PORTS): string => {
  const moduleName = MODULE_NAMES[module];
  
  if (isProduction) {
    // En production: toujours sans /api
    return `${API_DOMAIN}/${moduleName}`;
  } else {
    // En développement: http://localhost:PORT
    return `${API_DOMAIN}:${PORTS[module]}`;
  }
};

/**
 * Génère l'URL pour les endpoints team du module User
 * Ces endpoints sont définis dans Program.cs sans /api
 * En développement: http://localhost:8082
 * En production: https://api.maraudr.eu/user
 */
export const getUserTeamUrl = (): string => {
  return getModuleBaseUrl('user');
};

// Fonction de debug pour vérifier les URLs générées
export const debugApiUrls = () => {
  console.log('🔧 Configuration API Debug:');
  console.log('Mode:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('API_DOMAIN:', API_DOMAIN);

  const modules: (keyof typeof PORTS)[] = ['user', 'stock', 'association', 'geo', 'planning', 'mcp', 'document', 'email'];

  modules.forEach(module => {
    console.log(`${module}:`);
    console.log(`  API URL: ${getModuleApiUrl(module)}`);
    console.log(`  Base URL: ${getModuleBaseUrl(module)}`);
    console.log(`  Module name: ${MODULE_NAMES[module]}`);
    console.log(`  Uses API prefix: ${MODULES_WITH_API_PREFIX.includes(module)}`);
    if (!isProduction) {
      console.log(`  Port: ${PORTS[module]}`);
    }
  });
  
  console.log('User Team URL:', getUserTeamUrl());
};

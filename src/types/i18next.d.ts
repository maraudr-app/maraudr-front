import 'i18next';

// Déclarer un module pour augmenter les types d'i18next
declare module 'i18next' {
  // Étendre l'interface des ressources
  interface CustomTypeOptions {
    // Liste des namespaces supportés
    defaultNS: 'common';
    resources: {
      common: typeof import('../../public/locales/fr/common.json');
      dashboard: typeof import('../../public/locales/fr/dashboard.json');
      home: typeof import('../../public/locales/fr/home.json');
      asso: typeof import('../../public/locales/fr/asso.json');
    };
  }
} 
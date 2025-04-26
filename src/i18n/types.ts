import 'i18next';
import common from '../../public/locales/fr/common.json';
import dashboard from '../../public/locales/fr/dashboard.json';

// Déclaration des ressources de traduction
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
    };
  }
} 
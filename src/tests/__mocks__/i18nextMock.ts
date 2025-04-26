import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traductions nécessaires pour les tests
const resources = {
  fr: {
    common: {
      themes: {
        switchToLight: 'Passer au mode clair',
        switchToDark: 'Passer au mode sombre'
      }
    }
  },
  en: {
    common: {
      themes: {
        switchToLight: 'Switch to light mode',
        switchToDark: 'Switch to dark mode'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Langue par défaut pour les tests
    fallbackLng: 'fr',
    ns: ['common'],
    defaultNS: 'common',
    keySeparator: '.',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 
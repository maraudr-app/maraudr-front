import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import frCommon from '../locales/fr/common.json';
import frHome from '../locales/fr/home.json';
import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';

// Ressources préchargées
const resources = {
  fr: {
    common: frCommon,
    home: frHome
  },
  en: {
    common: enCommon,
    home: enHome
  }
};

i18n
  // Détecter la langue de l'utilisateur
  .use(LanguageDetector)
  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialiser i18next
  .init({
    // Ressources préchargées
    resources,
    // Langues supportées
    supportedLngs: ['fr', 'en'],
    // Langue par défaut
    fallbackLng: 'fr',
    // Mode debug désactivé
    debug: false,
    // Espace de noms par défaut
    defaultNS: 'common',
    // Liste des espaces de noms à charger
    ns: ['common', 'home'],
    // Options pour la détection de la langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // Interpolation
    interpolation: {
      // Ne pas échapper les valeurs HTML, React s'en charge
      escapeValue: false,
    },
  });

export default i18n; 
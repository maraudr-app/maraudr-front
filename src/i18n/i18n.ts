import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import des traductions
import frCommon from '../locales/fr/common.json';
import frHome from '../locales/fr/home.json';
import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';

// Activer le mode debug pour voir les messages dans la console
const isDebug = process.env.NODE_ENV === 'development';

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
    // Mode debug en développement
    debug: isDebug,
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
  }, (err) => {
    if (err && isDebug) console.error('i18n initialization error:', err);
  });

// Log des informations i18n si en mode développement
if (isDebug) {
  console.log('i18n initialized with:', {
    currentLang: i18n.language,
    supportedLangs: i18n.languages,
    namespaces: i18n.options.ns,
    defaultNS: i18n.options.defaultNS,
    resources: Object.keys(resources)
  });
}

export default i18n; 
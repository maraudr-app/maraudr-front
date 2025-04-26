import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Charger les traductions depuis le serveur ou les fichiers locaux
  .use(Backend)
  // Détecter la langue de l'utilisateur
  .use(LanguageDetector)
  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialiser i18next
  .init({
    // Langues supportées
    supportedLngs: ['fr', 'en'],
    // Langue par défaut
    fallbackLng: 'fr',
    // Mode debug en développement
    debug: process.env.NODE_ENV === 'development',
    // Espace de noms par défaut
    defaultNS: 'common',
    // Options pour la détection de la langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // Options pour le chargement des traductions
    backend: {
      // Chemin vers les fichiers de traduction
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Interpolation
    interpolation: {
      // Ne pas échapper les valeurs HTML, React s'en charge
      escapeValue: false,
    },
  });

export default i18n; 
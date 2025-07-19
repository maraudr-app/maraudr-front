/** @type {import('tailwindcss').Config} */

// Ce fichier configure Tailwind CSS pour notre application
export default {
  // Spécifie les fichiers à analyser pour générer les classes CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Configuration du mode sombre
  // 'class' signifie que le mode sombre sera activé en ajoutant
  // la classe 'dark' sur l'élément <html>
  // Exemple d'utilisation:
  // - className="bg-white dark:bg-gray-800" -> fond blanc en mode clair, gris foncé en mode sombre
  // - className="text-gray-900 dark:text-white" -> texte noir en mode clair, blanc en mode sombre
  darkMode: 'class',

  theme: {
    extend: {
      // Extension des couleurs par défaut avec notre palette personnalisée
      colors: {
        olive: {
          200: '#E1E3C1', // Utilisable avec: bg-olive-200, text-olive-200, etc.
          500: '#9A9D4D',
          600: '#7D8040',
        },
        // Couleurs Maraudr
        maraudr: {
          blue: '#3B82F6', // rgb(59, 130, 246)
          orange: '#F97316', // rgb(249, 115, 22)
          darkText: '#1F2937', // gray-800
          lightText: '#F9FAFB', // gray-50
          darkBg: '#111827', // gray-900
          lightBg: '#FFFFFF', // white
          red: '#EF4444', // red-500
        }
      },
    },
  },
  plugins: [], // Aucun plugin supplémentaire n'est utilisé
}
# React + TypeScript + Vite
# Architecture du projet maraudr

```
mauraudr-front/
├── public/                      # Fichiers statiques publics
│   ├── index.html               # Page HTML principale
│   ├── favicon.ico              # Favicon du site
│   └── assets/                  # Autres assets statiques (images, fonts)
│
├── src/                         # Code source de l'application
│   ├── assets/                  # Assets utilisés dans le code (images, SVG, etc.)
│   │
│   ├── components/              # Composants réutilisables
│   │   ├── common/              # Composants UI génériques (Button, Input, etc.)
│   │   ├── layout/              # Composants de mise en page (Header, Footer, etc.)
│   │   └── features/            # Composants spécifiques à des fonctionnalités
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Hook pour l'authentification
│   │   ├── useFetch.js          # Hook pour les requêtes API
│   │   └── ...
│   │
│   ├── pages/                   # Composants de pages
│   │   ├── Home/                # Page d'accueil
│   │   │   ├── Home.jsx         # Composant principal
│   │   │   ├── Home.module.css  # Styles (si vous utilisez CSS modules)
│   │   │   └── index.js         # Point d'entrée pour l'export
│   │   ├── Dashboard/           # Page de tableau de bord
│   │   └── ...
│   │
│   ├── services/                # Services et logique métier
│   │   ├── api.js               # Configuration et méthodes de l'API
│   │   ├── auth.js              # Service d'authentification
│   │   └── ...
│   │
│   ├── store/                   # État global (Redux, Context API, etc.)
│   │   ├── slices/              # Slices Redux (si utilisation de Redux Toolkit)
│   │   ├── context/             # Contextes React
│   │   └── ...
│   │
│   ├── utils/                   # Fonctions utilitaires
│   │   ├── formatters.js        # Fonctions de formatage
│   │   ├── validators.js        # Fonctions de validation
│   │   └── ...
│   │
│   ├── styles/                  # Styles globaux
│   │   ├── global.css           # Styles globaux
│   │   ├── variables.css        # Variables CSS
│   │   └── themes/              # Thèmes de l'application
│   │
│   ├── types/                   # Définitions de types (pour TypeScript)
│   │   ├── models.ts            # Types pour les modèles de données
│   │   └── ...
│   │
│   ├── routes/                  # Configuration des routes
│   │   ├── PrivateRoute.jsx     # Composant pour routes protégées
│   │   ├── routes.js            # Configuration des routes
│   │   └── ...
│   │
│   ├── constants/               # Constantes de l'application
│   │   ├── api.js               # Constantes pour l'API
│   │   ├── routes.js            # Constantes pour les routes
│   │   └── ...
│   │
│   ├── App.jsx                  # Composant racine de l'application
│   ├── index.jsx                # Point d'entrée de l'application
│   └── vite-env.d.ts            # Déclarations de types pour Vite (si applicable)
│
├── tests/                       # Tests
│   ├── unit/                    # Tests unitaires
│   ├── integration/             # Tests d'intégration
│   └── e2e/                     # Tests end-to-end
│
├── .env                         # Variables d'environnement
├── .env.development             # Variables d'environnement pour le développement
├── .env.production              # Variables d'environnement pour la production
│
├── .eslintrc.js                 # Configuration ESLint
├── .prettierrc                  # Configuration Prettier
├── tsconfig.json                # Configuration TypeScript (si applicable)
├── vite.config.js               # Configuration Vite
├── postcss.config.cjs           # Configuration PostCSS
├── tailwind.config.cjs          # Configuration Tailwind CSS (si applicable)
│
├── package.json                 # Dépendances et scripts
├── README.md                    # Documentation du projet
└── .gitignore                   # Fichiers ignorés par Git
```

## Explications des dossiers clés

### `/public`
Contient tous les fichiers statiques qui seront servis tels quels sans être traités par Webpack/Vite.

### `/src`
Contient tout le code source de l'application.

### `/src/components`
Composants React réutilisables, organisés par catégories.

### `/src/hooks`
Custom React hooks qui encapsulent la logique réutilisable.

### `/src/pages`
Composants de pages entières, généralement associés à des routes.

### `/src/services`
Services pour la logique métier et les interactions avec les API externes.

### `/src/store`
Gestion de l'état global (Redux, Context API, etc.).

### `/src/utils`
Fonctions utilitaires pures et réutilisables.

### `/src/styles`
Styles globaux, thèmes et variables CSS.

### `/src/routes`
Configuration des routes de l'application.

### `/src/constants`
Constantes et valeurs de configuration.

### `/tests`
Tests organisés par catégories.

## Astuces pour bien organiser un projet React

1. **Privilégier les imports relatifs** : Utiliser des chemins relatifs pour les imports entre fichiers proches, et des alias pour les imports distants.

2. **Barrel files** : Utiliser des fichiers index.js pour exporter plusieurs éléments d'un dossier.

3. **Lazy loading** : Implémenter le chargement paresseux pour les composants lourds ou peu utilisés.

4. **Nommage cohérent** : Adopter une convention de nommage uniforme (PascalCase pour les composants, camelCase pour les fonctions, etc.).

5. **Tests à proximité** : Placer les tests à côté des fichiers qu'ils testent ou dans une structure miroir.
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

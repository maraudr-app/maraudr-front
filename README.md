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

##  Bibliothèque de composants

- [Chakra UI](https://chakra-ui.com/) : Une bibliothèque de composants React qui facilite la création d'interfaces utilisateur accessibles et réactives.
- [React Router](https://reactrouter.com/) : Une bibliothèque pour la gestion des routes dans les applications React.
- [React Query](https://react-query.tanstack.com/) : Une bibliothèque pour la gestion des requêtes et de la mise en cache des données dans les applications React.
- [Formik](https://formik.org/) : Une bibliothèque pour la gestion des formulaires dans les applications React.
- [React Hook Form](https://react-hook-form.com/) : Une autre bibliothèque pour la gestion des formulaires, plus légère que Formik.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) : Une bibliothèque pour tester les composants React de manière simple et efficace.
- [Axios](https://axios-http.com/) : Une bibliothèque pour effectuer des requêtes HTTP.
- [React Icons](https://react-icons.github.io/react-icons/) : Une bibliothèque d'icônes pour React, qui regroupe plusieurs bibliothèques d'icônes populaires.
- [Heroicons](https://heroicons.com/) : Une bibliothèque d'icônes SVG gratuites et personnalisables.


## 🛠️ Stratégie Git & Workflow de Développement

Afin de garantir un code maintenable, une bonne collaboration en équipe et une future intégration continue (CI/CD) fluide, nous adoptons une architecture Git structurée et professionnelle.

### 🌿 Branches principales

- **`main`** : Contient la version stable et prête à être déployée. Aucune modification directe n’est autorisée.
- **`develop`** : Branche d’intégration où toutes les fonctionnalités terminées sont mergées avant validation.

### 🌱 Branches secondaires

| Préfixe        | Utilisation                         | Exemple                    |
|----------------|-------------------------------------|----------------------------|
| `feature/*`    | Développement de nouvelles features | `feature/login-page`      |
| `fix/*`        | Corrections de bugs                 | `fix/input-validation`    |
| `chore/*`      | Refactoring, linting, docs, etc.    | `chore/update-readme`     |
| `hotfix/*`     | Correctif urgent en production      | `hotfix/fix-broken-build` |

---

### 🚀 Workflow 

1. Se baser sur la dernière version de `develop` :
   ```bash
   git checkout develop
   git pull origin develop

2. Créer une branche de fonctionnalité :
   ```bash
   git checkout -b feature/ma-fonctionnalite


3. Committer avec des messages clairs (voir conventions ci-dessous) :
   ```bash
   git commit -m "feat: ajoute le composant de connexion"

5. Pousser la branche sur le dépôt distant :
   ```bash
   git push origin feature/ma-fonctionnalite


## ✍️ Conventions de commit (Conventional Commits)

Utilisez les préfixes suivants pour vos messages de commit :

| Type       | Signification                                        |
|------------|------------------------------------------------------|
| `feat:`    | Nouvelle fonctionnalité                              |
| `fix:`     | Correction de bug                                    |
| `chore:`   | Maintenance, configuration, nettoyage                |
| `refactor:`| Refactor sans ajout ni correction de bug             |
| `docs:`    | Mise à jour de la documentation                      |
| `test:`    | Ajout ou mise à jour des tests                       |
| `style:`   | Changement de format (indentation, lint…)           |


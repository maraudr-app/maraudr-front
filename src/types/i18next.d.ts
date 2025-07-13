import 'i18next';

// Déclarer un module pour augmenter les types d'i18next
declare module 'i18next' {
  // Étendre l'interface des ressources
  interface CustomTypeOptions {
    // Liste des namespaces supportés
    defaultNS: 'common';
    resources: {
      common: {
        register: {
          title: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          password: string;
          confirmPassword: string;
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
          terms: string;
          termsLink: string;
          privacyLink: string;
          submit: string;
          cancel: string;
          alreadyHaveAccount: string;
          signIn: string;
          passwordError: string;
          passwordMatchError: string;
          formError: string;
          success: string;
          error: {
            '400': string;
            '401': string;
            '403': string;
            '409': string;
            '500': string;
            default: string;
          };
        };
        header: {
          dashboard: string;
          search: string;
          home: string;
          login: string;
          settings: string;
          contact: string;
          signup: string;
          createAssociation: string;
        };
        auth: {
          login: string;
          welcome: string;
          email: string;
          password: string;
          remember: string;
          forgot: string;
          loginButton: string;
          noAccount: string;
          register: string;
          or: string;
          google: string;
          microsoft: string;
          logout: string;
          invalidCredentials: string;
          authenticationError: string;
          networkError: string;
          accountBlocked: string;
          serverError: string;
          loginError: string;
        };
        theme: {
          light: string;
          dark: string;
          system: string;
        };
        language: {
          fr: string;
          en: string;
        };
      };
      dashboard: typeof import('../locales/fr/dashboard.json');
      home: typeof import('../locales/fr/home.json');
    };
  }
} 
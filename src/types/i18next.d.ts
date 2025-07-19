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
        team: {
          title: string;
          loading: string;
          error: {
            loading: string;
            retry: string;
            reconnect: string;
          };
          noAssociation: string;
          noAssociationMessage: string;
          stats: {
            totalMembers: string;
            managers: string;
            activeMembers: string;
          };
          actions: {
            addMember: string;
            refresh: string;
            viewDisponibilities: string;
            removeMember: string;
            editMember: string;
            viewDetails: string;
          };
          modal: {
            addMember: {
              title: string;
              subtitle: string;
              emailLabel: string;
              emailPlaceholder: string;
              sendInvitation: string;
              sending: string;
              success: string;
              error: string;
            };
            removeMember: {
              title: string;
              message: string;
              confirm: string;
              cancel: string;
              removing: string;
              success: string;
              error: string;
              description: string;
            };
            disponibilities: {
              title: string;
              noDisponibilities: string;
              noDisponibilitiesMessage: string;
              close: string;
              start: string;
              end: string;
              duration: string;
              days: string;
            };
            userDetails: {
              loading: string;
              personalInfo: string;
              additionalInfo: string;
              languages: {
                english: string;
                french: string;
                spanish: string;
                german: string;
                italian: string;
                language: string;
              };
            };
          };
          member: {
            role: {
              manager: string;
              member: string;
            };
            contact: {
              email: string;
              phone: string;
              address: string;
            };
            languages: string;
            joinedOn: string;
            lastActive: string;
            status: {
              active: string;
            };
            joinedSince: string;
            you: string;
            notSpecified: string;
          };
          orgChart: {
            title: string;
            noMembers: string;
            noMembersMessage: string;
          };
          search: {
            label: string;
            placeholder: string;
          };
          toast: {
            memberAdded: string;
            memberRemoved: string;
            error: string;
          };
          addMemberModal: {
            title: string;
            invite: {
              tabTitle: string;
              emailPlaceholder: string;
              emailDescription: string;
              messagePlaceholder: string;
              messageDescription: string;
              sendInvitationButton: string;
              defaultMessage: string;
              emailError: string;
              emailFormatError: string;
              associationError: string;
              invalidDataError: string;
              unauthorizedError: string;
              forbiddenError: string;
              userExistsError: string;
              serverError: string;
              connectionError: string;
              error: string;
            };
            create: {
              tabTitle: string;
              managerOnlyDescription: string;
              firstnamePlaceholder: string;
              lastnamePlaceholder: string;
              emailPlaceholder: string;
              phoneNumberPlaceholder: string;
              streetPlaceholder: string;
              cityPlaceholder: string;
              statePlaceholder: string;
              postalCodePlaceholder: string;
              countryPlaceholder: string;
              createUserButton: string;
              requiredFieldsError: string;
              emailFormatError: string;
              firstnameLengthError: string;
              lastnameLengthError: string;
              managerOnlyError: string;
              invalidDataError: string;
              unauthorizedError: string;
              forbiddenError: string;
              userExistsError: string;
              invalidDataFormatError: string;
              serverError: string;
              connectionError: string;
              error: string;
              success: string;
            };
          };
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
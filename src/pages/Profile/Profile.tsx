import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { Input } from "../../components/common/input/input";
import { MultiSelectDropdown } from "../../components/common/multiSelectDropdown/multiSelectDropdown";
import { Button } from "../../components/common/button/button";
import { useTranslation } from "react-i18next";
import { getPasswordStrength } from "../../utils/passwordStrength";
import { useAssoStore } from '../../store/assoStore';
import { assoService } from '../../services/assoService';
import { UserCircleIcon } from '@heroicons/react/24/solid';



const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    languages: [] as string[],
    biography: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'association'>('user');
  const { sidebarCollapsed, selectedAssociation } = useAssoStore();
  const [associationDetails, setAssociationDetails] = useState<any>(null);
  const [loadingAssociation, setLoadingAssociation] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [manager, setManager] = useState<any>(null);
  const [loadingManager, setLoadingManager] = useState(false);
  const sidebarWidth = sidebarCollapsed ? '56px' : '192px';
  const { t } = useTranslation();
  const t_profile = (key: string): string => {
    return t(`profile.${key}` as any);
  };

  // Mapping pour les langues avec traductions - correspondance avec l'enum backend
  const getLanguageEnum = () => [
    { value: "0", label: t('languages.en' as any) || "English", apiName: "English" },
    { value: "1", label: t('languages.fr' as any) || "Français", apiName: "French" },
    { value: "2", label: t('languages.es' as any) || "Espagnol", apiName: "Spanish" },
    { value: "3", label: t('languages.de' as any) || "Allemand", apiName: "German" },
    { value: "4", label: t('languages.it' as any) || "Italien", apiName: "Italian" },
  ];

  // Charger les détails complets de l'utilisateur
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.sub) return;
      
      try {
        setLoadingDetails(true);
        const details = await authService.getUserById(user.sub);
        setUserDetails(details);
        
        // Pré-remplir le formulaire avec les données utilisateur
        // Les champs password restent TOUJOURS vides
        setForm({
          firstname: details.firstname || "",
          lastname: details.lastname || "",
          email: details.contactInfo?.email || user.email || "",
          phoneNumber: details.contactInfo?.phoneNumber || "",
          street: details.address?.street || "",
          city: details.address?.city || "",
          state: details.address?.state || "",
          postalCode: details.address?.postalCode || "",
          country: details.address?.country || "",
          languages: (details.languages || []).map(lang => String(lang)), // Convertir en strings
          biography: details.biography || "",
        });
      } catch (err) {
        console.error('Erreur lors du chargement des détails utilisateur:', err);
        setError(t_profile('loadingError'));
      } finally {
        setLoadingDetails(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserDetails();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const fetchAssociationDetails = async () => {
      if (activeTab === 'association' && selectedAssociation?.id) {
        setLoadingAssociation(true);
        try {
          const details = await assoService.getAssociation(selectedAssociation.id);
          setAssociationDetails(details);
          // Récupérer les membres
          if (details.members && Array.isArray(details.members)) {
            setLoadingMembers(true);
            try {
              const memberDetails = await Promise.all(
                details.members.map(async (memberId: string) => {
                  try {
                    const user = await userService.getUser(memberId);
                    return user;
                  } catch {
                    return null;
                  }
                })
              );
              setMembers(memberDetails.filter(Boolean));
            } finally {
              setLoadingMembers(false);
            }
          } else {
            setMembers([]);
          }
          // Récupérer le manager
          if (details.managerId) {
            setLoadingManager(true);
            try {
              const managerUser = await userService.getUser(details.managerId);
              setManager(managerUser);
            } catch {
              setManager(null);
            } finally {
              setLoadingManager(false);
            }
          } else {
            setManager(null);
          }
        } catch (e) {
          setAssociationDetails(null);
          setMembers([]);
          setManager(null);
        } finally {
          setLoadingAssociation(false);
        }
      }
    };
    fetchAssociationDetails();
  }, [activeTab, selectedAssociation]);

  // Pour le MultiSelectDropdown, on utilise directement les strings
  const selectedLangs = form.languages;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Réinitialiser les messages
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleLanguagesChange = (langs: string[]) => {
    setForm({ ...form, languages: langs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Validation des champs requis
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
      setError(t_profile('requiredFields'));
      return;
    }



    setLoading(true);
    try {
      // Convertir les IDs de langues en noms de langues
      const languageNames = form.languages.map(langId => {
        const lang = getLanguageEnum().find(l => l.value === String(langId));
        return lang ? lang.apiName : 'French'; // Fallback vers French
      });

      console.log('🔍 Debug langues:', {
        formLanguages: form.languages,
        languageNames: languageNames,
        languageEnum: getLanguageEnum()
      });

      // Format des données selon l'API spécifiée - seulement les champs nécessaires
      const updateData: any = {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || '',
        street: form.street.trim() || '',
        city: form.city.trim() || '',
        state: form.state.trim() || '',
        postalCode: form.postalCode.trim() || '',
        country: form.country.trim() || '',
        languages: languageNames, // Utiliser les noms de langues
        biography: form.biography.trim() || '', // Ajouter la biographie
      };

      // Utiliser le sub de l'utilisateur pour la mise à jour
      if (!user?.sub) {
        throw new Error(t_profile('missingUserId'));
      }

      console.log('📡 [PROFILE] Données complètes envoyées au serveur:', {
        userId: user.sub,
        updateData: updateData,
        formData: {
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          phoneNumber: form.phoneNumber,
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          languages: form.languages,
          biography: form.biography
        },
        languagesCount: languageNames.length,
        selectedLanguages: form.languages,
        convertedLanguages: languageNames
      });

      await userService.updateUser(user.sub, updateData);
      setSuccess(t_profile('profileUpdated'));
      
      // Faire disparaître le message de succès après 5 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      

      
      // Recharger les données utilisateur
      await useAuthStore.getState().fetchUser();
    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour:', err);
      setError(err.message || t_profile('updateError'));
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t_profile('mustBeConnected')}</p>
        </div>
      </div>
    );
  }

  // Affichage du loading pendant le chargement des détails
  if (loadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar sticky/fixed style MediaNavbar */}
      <nav
        className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300"
        style={{ left: sidebarWidth }}
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 pl-7">
            <UserCircleIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange" />
            <span className="text-gray-900 dark:text-white text-lg font-bold">{t_profile('title')}</span>
          </div>
          <div className="flex items-center space-x-0 px-4">
            <button
              className={`px-6 py-3 text-base font-medium focus:outline-none transition-all border-b-2 -mb-px
                ${activeTab === 'user'
                  ? 'border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-maraudr-blue dark:hover:text-maraudr-orange hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
              onClick={() => setActiveTab('user')}
            >
              {t_profile('user')}
            </button>
            <button
              className={`px-6 py-3 text-base font-medium focus:outline-none transition-all border-b-2 -mb-px
                ${activeTab === 'association'
                  ? 'border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-maraudr-blue dark:hover:text-maraudr-orange hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
              onClick={() => setActiveTab('association')}
            >
              {t_profile('association')}
            </button>
          </div>
        </div>
      </nav>
      <div className="pt-16" />
      {/* Contenu selon l'onglet actif */}
      {activeTab === 'user' ? (
      <div className="max-w-5xl mx-auto px-6">
        {/* En-tête profil simple et élégant */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {form.firstname.charAt(0)}{form.lastname.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {form.firstname} {form.lastname}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            {user.userType === 'Manager' ? t_profile('manager') : t_profile('member')} • {t_profile('association')}
          </p>
          
          {/* Boutons d'action rapide */}
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-full hover:from-orange-600 hover:to-blue-600 transition-all duration-300 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t_profile('contact')}
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-full hover:from-orange-600 hover:to-blue-600 transition-all duration-300 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Planning
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* À propos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t_profile('about')}</h2>
                <button className="text-blue-500 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {form.biography || t_profile('noBiography')}
              </div>
            </div>

            {/* Formulaire de modification */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t_profile('editInformation')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label={t_profile('firstName')} 
                    name="firstname" 
                    value={form.firstname} 
                    onChange={handleChange} 
                    required 
                    placeholder={t_profile('firstName')}
                  />
                  <Input 
                    label={t_profile('lastName')} 
                    name="lastname" 
                    value={form.lastname} 
                    onChange={handleChange} 
                    required 
                    placeholder={t_profile('lastName')}
                  />
                </div>

                <Input 
                  label="Email" 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="email@exemple.com"
                />

                <Input 
                  label={t_profile('phoneNumber')} 
                  name="phoneNumber" 
                  type="tel"
                  value={form.phoneNumber} 
                  onChange={handleChange} 
                  placeholder={t_profile('phoneNumber')}
                />

                {/* Adresse */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t_profile('address')}</h3>
                  <Input 
                    label={t_profile('street')} 
                    name="street" 
                    value={form.street} 
                    onChange={handleChange} 
                    placeholder={t_profile('street')}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input 
                      label={t_profile('city')} 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange} 
                      placeholder={t_profile('city')}
                    />
                    <Input 
                      label={t_profile('postalCode')} 
                      name="postalCode" 
                      value={form.postalCode} 
                      onChange={handleChange} 
                      placeholder={t_profile('postalCode')}
                    />
                    <Input 
                      label={t_profile('country')} 
                      name="country" 
                      value={form.country} 
                      onChange={handleChange} 
                      placeholder={t_profile('country')}
                    />
                  </div>
                </div>

                {/* Langues */}
                <MultiSelectDropdown
                  label={t_profile('spokenLanguages')}
                  options={getLanguageEnum().map(l => ({ value: l.value, label: l.label }))}
                  selectedValues={form.languages.map(lang => String(lang))} // Convertir en string
                  onChange={handleLanguagesChange}
                  placeholder={t_profile('selectLanguages')}
                />

                {/* Biographie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t_profile('biography')}
                  </label>
                  <textarea
                    name="biography"
                    value={form.biography}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t_profile('biographyPlaceholder')}
                  />
                </div>



                {/* Messages */}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => {
                      if (userDetails) {
                        setForm({
                          firstname: userDetails.firstname || "",
                          lastname: userDetails.lastname || "",
                          email: userDetails.contactInfo?.email || user.email || "",
                          phoneNumber: userDetails.contactInfo?.phoneNumber || "",
                          street: userDetails.address?.street || "",
                          city: userDetails.address?.city || "",
                          state: userDetails.address?.state || "",
                          postalCode: userDetails.address?.postalCode || "",
                          country: userDetails.address?.country || "",
                          languages: userDetails.languages || [],
                          biography: userDetails.biography || "",
                        });
                      }
                      setSuccess(null);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    {t_profile('cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {loading ? t_profile('saving') : t_profile('save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Colonne droite - Informations complémentaires */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_profile('contact')}</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{form.email || t_profile('noPhone')}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{form.phoneNumber || t_profile('noPhone')}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">
                    {form.city && form.country ? `${form.city}, ${form.country}` : t_profile('noLocation')}
                  </span>
                </div>
              </div>
            </div>

            {/* Langues */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_profile('languages')}</h2>
              <div className="flex flex-wrap gap-2">
                {form.languages.length > 0 ? (
                  form.languages.map((langId) => {
                    // Convertir en string si c'est un nombre
                    const langIdStr = String(langId);
                    const lang = getLanguageEnum().find(l => l.value === langIdStr);
                    console.log('🔍 Debug langue:', { langId, langIdStr, lang, allLangs: getLanguageEnum() }); // Debug
                    return lang ? (
                      <span key={langId} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {lang.label}
                      </span>
                    ) : (
                      <span key={langId} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                        {langIdStr}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t_profile('noLanguages')}</span>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_profile('activity')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{t_profile('memberSince')}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{t_profile('status')}</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs">
                    {t_profile('active')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t_profile('associationProfile')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            {loadingAssociation ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t_profile('loading')}</div>
            ) : associationDetails ? (
              <>
                {/* Résumé association */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow">
                    {associationDetails?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-maraudr-blue dark:text-maraudr-orange mb-1">{associationDetails?.name || t_profile('noLocation')}</h3>
                    <div className="text-gray-500 dark:text-gray-400 text-base mb-2">{t_profile('siret')}: <span className="font-semibold text-gray-900 dark:text-white">{associationDetails?.siret?.value || t_profile('noLocation')}</span></div>
                    <div className="text-gray-700 dark:text-gray-200 text-base">{t_profile('manager')}: <span className="font-semibold text-gray-900 dark:text-white">{loadingManager ? t_profile('loading') : manager ? `${manager.firstname} ${manager.lastname}` : t_profile('noLocation')}</span></div>
                  </div>
                </div>
                <hr className="my-6 border-orange-200 dark:border-orange-700/40" />
                {/* Détails association */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  {manager && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('manager')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{manager.firstname} {manager.lastname}</div>
                    </div>
                  )}
                  {associationDetails?.description && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('description')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.description}</div>
                    </div>
                  )}
                  {associationDetails?.email && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('email')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.email}</div>
                    </div>
                  )}
                  {associationDetails?.phoneNumber && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('phone')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.phoneNumber}</div>
                    </div>
                  )}
                  {associationDetails?.members && associationDetails.members.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('memberCount')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {associationDetails.members.filter((memberId: string) => memberId !== associationDetails.managerId).length} {t_profile('members')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Adresse complète - seulement si on a au moins une info d'adresse */}
                {(associationDetails?.address?.street || associationDetails?.address?.city || associationDetails?.address?.postalCode || associationDetails?.address?.country || associationDetails?.city || associationDetails?.country) && (
                  <div className="mb-8">
                    <div className="font-bold text-maraudr-blue dark:text-maraudr-orange mb-3 text-lg">{t_profile('completeAddress')}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {associationDetails?.address?.street && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('street')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.address.street}</div>
                        </div>
                      )}
                      {(associationDetails?.address?.city || associationDetails?.city) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('city')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.address?.city || associationDetails.city}</div>
                        </div>
                      )}
                      {associationDetails?.address?.postalCode && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('postalCode')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.address.postalCode}</div>
                        </div>
                      )}
                      {(associationDetails?.address?.country || associationDetails?.country) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('country')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{associationDetails.address?.country || associationDetails.country}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations système - seulement si on a des dates ou logo */}
                {(associationDetails?.createdAt || associationDetails?.updatedAt || associationDetails?.logo) && (
                  <div className="mb-8">
                    <div className="font-bold text-maraudr-blue dark:text-maraudr-orange mb-3 text-lg">{t_profile('systemInfo')}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {associationDetails?.createdAt && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('creationDate')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {new Date(associationDetails.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                      {associationDetails?.updatedAt && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('lastModified')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {new Date(associationDetails.updatedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                      {associationDetails?.logo && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('logo')}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{t_profile('available')}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t_profile('status')}</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">{t_profile('active')}</div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Liste des membres */}
                <div>
                  <div className="font-bold text-maraudr-blue dark:text-maraudr-orange mb-3 mt-6 text-lg">{t_profile('associationMembers')}</div>
                  {loadingMembers ? (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">{t_profile('loadingMembers')}</div>
                  ) : members.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-orange-50/40 dark:bg-gray-800/40 rounded-xl p-4">
                      {members.map((m, idx) => (
                        <div key={m.id || idx} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maraudr-blue to-maraudr-orange flex items-center justify-center text-white text-lg font-bold">
                            {m.firstname?.charAt(0) || ''}{m.lastname?.charAt(0) || ''}
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">{m.firstname} {m.lastname}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">{t_profile('noMembers')}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-red-500 dark:text-red-400">{t_profile('associationError')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

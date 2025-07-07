import {Link, useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  CubeIcon, 
  MapPinIcon, 
  HeartIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import landingImage from '../../assets/pictures/assoc-landing-page.jpg';
import membersImage from '../../assets/pictures/gestion-des-membres.jpg';
import analysisImage from '../../assets/pictures/statistic.jpg';
import stockImage from '../../assets/pictures/stock.jpg';
import terrainImage from '../../assets/pictures/terrain.jpg';
import impactSocialImage from '../../assets/pictures/impact-social.jpg';
import {useAuthStore} from "../../store/authStore.ts";
import {useAssoStore} from "../../store/assoStore.ts";

const Home = () => {
  const { t } = useTranslation();
  const [showFeatureButton, setShowFeatureButton] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const associations = useAssoStore((state) => state.associations);
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);

  const t_home = (key: string, fallback: string) => t(`home:${key}`, fallback);
  
  // Charger les associations si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingAssociations(true);
      const loadAssociations = async () => {
        try {
          await useAssoStore.getState().fetchUserAssociations();
        } catch (error) {
          console.error('Erreur lors du chargement des associations:', error);
        } finally {
          setIsLoadingAssociations(false);
        }
      };
      loadAssociations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Si l'utilisateur est authentifié ET a des associations ET le chargement est terminé, rediriger vers le dashboard
    if (isAuthenticated && associations.length > 0 && !isLoadingAssociations) {
      navigate('/maraudApp/dashboard');
    }
  }, [isAuthenticated, associations, isLoadingAssociations, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        const rect = featuresSection.getBoundingClientRect();
        setShowFeatureButton(rect.top > window.innerHeight || rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonctionnalités avec icônes Heroicons
  const features = [
    {
      icon: <UsersIcon className="w-12 h-12" />,
      title: t_home('features.memberManagement.title', 'Gestion des membres'),
      description: t_home('features.memberManagement.description', 'Gérez efficacement vos adhérents, leurs rôles et leurs contributions. Suivez les cotisations et gardez un historique complet des activités.'),
      color: 'text-maraudr-blue dark:text-maraudr-orange'
    },
    {
      icon: <ChartBarIcon className="w-12 h-12" />,
      title: t_home('features.dataAnalysis.title', 'Analyse des données'),
      description: t_home('features.dataAnalysis.description', 'Visualisez et analysez vos données pour prendre des décisions éclairées. Créez des rapports détaillés sur vos activités et leur impact.'),
      color: 'text-maraudr-orange dark:text-maraudr-blue'
    },
    {
      icon: <CubeIcon className="w-12 h-12" />,
      title: t_home('features.stockManagement.title', 'Gestion des stocks'),
      description: t_home('features.stockManagement.description', 'Suivez en temps réel vos inventaires, recevez des alertes de seuil et optimisez la distribution des ressources entre vos différents sites.'),
      color: 'text-maraudr-blue dark:text-maraudr-orange'
    },
    {
      icon: <MapPinIcon className="w-12 h-12" />,
      title: t_home('features.fieldTracking.title', 'Suivi terrain'),
      description: t_home('features.fieldTracking.description', 'Localisez vos équipes, coordonnez les actions et améliorez la sécurité de vos bénévoles avec notre système de suivi en temps réel.'),
      color: 'text-maraudr-orange dark:text-maraudr-blue'
    },
    {
      icon: <HeartIcon className="w-12 h-12" />,
      title: t_home('features.socialImpact.title', 'Impact social'),
      description: t_home('features.socialImpact.description', 'Mesurez et démontrez l\'impact de vos actions sur la communauté. Générez des rapports d\'impact pour vos partenaires et donateurs.'),
      color: 'text-maraudr-blue dark:text-maraudr-orange'
    }
  ];

  // Témoignages
  const testimonials = [
    {
      name: t_home('testimonials.users.0.name', 'Jean Dupont'),
      org: t_home('testimonials.users.0.org', 'Association Entraide'),
      quote: t_home('testimonials.users.0.quote', 'Grâce au suivi des stocks en temps réel, nous avons réduit nos pertes de 30% et optimisé nos distributions sur le terrain.'),
      rating: 5
    },
    {
      name: t_home('testimonials.users.1.name', 'Marie Lambert'),
      org: t_home('testimonials.users.1.org', 'Club Sportif Local'),
      quote: t_home('testimonials.users.1.quote', 'La fonctionnalité de géolocalisation nous a permis de coordonner efficacement nos bénévoles lors des grands événements.'),
      rating: 5
    },
    {
      name: t_home('testimonials.users.2.name', 'Paul Lefèvre'),
      org: t_home('testimonials.users.2.org', 'Association Culturelle'),
      quote: t_home('testimonials.users.2.quote', 'Le module de gestion des événements nous a fait gagner un temps précieux et amélioré la communication avec nos participants.'),
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-maraudr-blue to-maraudr-orange bg-clip-text text-transparent">
            {t_home('hero.title', 'Simplifiez la gestion de votre association')}
          </h1>
            <p className="text-xl md:text-2xl text-maraudr-darkText dark:text-maraudr-lightText mb-8 max-w-3xl mx-auto leading-relaxed">
            {t_home('hero.description', 'Une plateforme intuitive pour gérer vos membres, organiser vos missions, suivre les stocks et analyser vos actions. Conçue pour les associations engagées comme la vôtre.')}
          </p>
            
            {/* Loader pendant le chargement des associations */}
            {isAuthenticated && isLoadingAssociations && (
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maraudr-blue"></div>
                  <p className="text-blue-700 dark:text-blue-300">
                    Vérification de vos associations...
                  </p>
                </div>
              </div>
            )}

            {/* Message spécial pour les utilisateurs connectés sans association */}
            {isAuthenticated && !isLoadingAssociations && associations.length === 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-700 rounded-xl">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    {user?.userType === 'Manager' 
                      ? 'Bienvenue ! Créez votre première association'
                      : 'Bienvenue ! Votre inscription est en cours de validation'
                    }
                  </h3>
                </div>
                <p className="text-orange-700 dark:text-orange-300 text-center mb-4">
                  {user?.userType === 'Manager' 
                    ? 'Vous êtes connecté mais vous n\'avez pas encore d\'association. Créez votre première association pour commencer à organiser vos actions sociales.'
                    : 'Vous êtes connecté mais votre inscription est en attente de validation par votre manager. Vous recevrez une notification dès que votre adhésion sera approuvée.'
                  }
                </p>
                {user?.userType === 'Manager' && (
                  <div className="flex justify-center">
                    <Link 
                      to="/maraudApp/create-asso"
                      className="px-8 py-3 bg-gradient-to-r from-maraudr-blue to-maraudr-orange hover:from-maraudr-orange hover:to-maraudr-blue text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      Créer mon association
                      <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Boutons normaux pour les utilisateurs non connectés */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
                  to="/createAccount"
                  className="px-10 py-5 bg-maraudr-blue hover:bg-maraudr-orange text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center"
            >
              {t_home('hero.createAccount', 'Créer un compte')}
                  <ArrowRightIcon className="w-6 h-6" />
            </Link>
                <Link 
                  to="/login"
                  className="px-10 py-5 border-3 border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange hover:bg-maraudr-blue hover:text-white dark:hover:bg-maraudr-orange dark:hover:text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] justify-center"
            >
                  {t_home('hero.login', 'Se connecter')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div id="features" className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maraudr-darkText dark:text-maraudr-lightText mb-4">
          {t_home('features.title', 'Nos fonctionnalités')}
        </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre association
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600">
                <div className={`${feature.color} mb-6`}>
                  {feature.icon}
            </div>
                <h3 className="text-xl font-bold mb-4 text-maraudr-darkText dark:text-maraudr-lightText">
                  {feature.title}
            </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
            </p>
              </div>
            ))}
          </div>
        </div>
          </div>

      {/* Statistiques */}
      <div className="py-20 bg-gradient-to-r from-maraudr-blue/10 to-maraudr-orange/10 dark:from-maraudr-blue/20 dark:to-maraudr-orange/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-maraudr-blue dark:text-maraudr-orange mb-2">500+</div>
              <div className="text-maraudr-darkText dark:text-maraudr-lightText">Associations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-maraudr-orange dark:text-maraudr-blue mb-2">10K+</div>
              <div className="text-maraudr-darkText dark:text-maraudr-lightText">Membres</div>
          </div>
            <div>
              <div className="text-4xl font-bold text-maraudr-blue dark:text-maraudr-orange mb-2">50K+</div>
              <div className="text-maraudr-darkText dark:text-maraudr-lightText">Actions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-maraudr-orange dark:text-maraudr-blue mb-2">99%</div>
              <div className="text-maraudr-darkText dark:text-maraudr-lightText">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-maraudr-darkText dark:text-maraudr-lightText mb-4">
          {t_home('testimonials.title', 'Témoignages de nos utilisateurs')}
        </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Découvrez ce que disent les associations qui utilisent maraudr
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-maraudr-blue/5 to-maraudr-orange/5 dark:from-maraudr-blue/10 dark:to-maraudr-orange/10 p-8 rounded-xl border border-maraudr-blue/20 dark:border-maraudr-orange/20">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-maraudr-blue/20 dark:bg-maraudr-orange/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-maraudr-blue dark:text-maraudr-orange font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                </div>
                <div>
                    <div className="font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.org}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>

      {/* Call To Action */}
      <div className="py-20 bg-gradient-to-r from-maraudr-blue to-maraudr-orange">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
          {t_home('cta.title', 'Prêt à transformer votre association ?')}
        </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t_home('cta.description', 'Rejoignez des centaines d\'associations qui utilisent déjà notre outil pour structurer leurs actions et décupler leur impact.')}
        </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Link 
              to="/createAccount" 
              className="px-10 py-5 bg-white text-maraudr-blue hover:bg-gray-100 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 min-w-[200px]"
        >
          {t_home('cta.button', 'Créer mon espace')}
              <ArrowRightIcon className="w-6 h-6" />
            </Link>
            <Link 
              to="/login" 
              className="px-10 py-5 border-3 border-white text-white hover:bg-white hover:text-maraudr-blue font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] justify-center"
            >
              {t_home('cta.login', 'Se connecter')}
        </Link>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <footer className="bg-maraudr-darkText dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold text-maraudr-blue dark:text-maraudr-orange mb-4">
            maraudr
          </div>
          <p className="text-gray-400 mb-6">
            Simplifiez la gestion de votre association
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <Link to="/about" className="hover:text-maraudr-orange transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="hover:text-maraudr-orange transition-colors">
              Contact
            </Link>
            <Link to="/login" className="hover:text-maraudr-orange transition-colors">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import landingImage from '../../assets/pictures/assoc-landing-page.jpg';
import membersImage from '../../assets/pictures/gestion-des-membres.jpg';
import analysisImage from '../../assets/pictures/statistic.jpg';
import stockImage from '../../assets/pictures/stock.jpg';
import terrainImage from '../../assets/pictures/terrain.jpg';
import impactSocialImage from '../../assets/pictures/impact-social.jpg';

const Home = () => {
  const { t } = useTranslation();
  const [showFeatureButton, setShowFeatureButton] = useState(false);
  
  const t_home = (key: string, fallback: string) => t(`home:${key}`, fallback);

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

  // Hard-coded testimonials with translation keys
  const testimonials = [
    {
      name: t_home('testimonials.users.0.name', 'Jean Dupont'),
      org: t_home('testimonials.users.0.org', 'Association Entraide'),
      initials: 'JD',
      quote: t_home('testimonials.users.0.quote', 'Grâce au suivi des stocks en temps réel, nous avons réduit nos pertes de 30% et optimisé nos distributions sur le terrain.')
    },
    {
      name: t_home('testimonials.users.1.name', 'Marie Lambert'),
      org: t_home('testimonials.users.1.org', 'Club Sportif Local'),
      initials: 'ML',
      quote: t_home('testimonials.users.1.quote', 'La fonctionnalité de géolocalisation nous a permis de coordonner efficacement nos bénévoles lors des grands événements.')
    },
    {
      name: t_home('testimonials.users.2.name', 'Paul Lefèvre'),
      org: t_home('testimonials.users.2.org', 'Association Culturelle'),
      initials: 'PL',
      quote: t_home('testimonials.users.2.quote', 'Le module de gestion des événements nous a fait gagner un temps précieux et amélioré la communication avec nos participants.')
    }
  ];

  return (
    <div className="container mx-auto py-16 px-4">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-8">
          <img
            src={landingImage}
            alt="Association illustration"
            className="w-full h-auto max-w-xl mx-auto"
          />
        </div>
        
        <div className="w-full md:w-1/2 pl-0 md:pl-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400 mb-6 tracking-wide">
            {t_home('hero.title', 'Simplifiez la gestion de votre association')}
          </h1>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            {t_home('hero.description', 'Une plateforme intuitive pour gérer vos membres, organiser vos missions, suivre les stocks et analyser vos actions. Conçue pour les associations engagées comme la vôtre.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/login"
              className="px-8 py-3 bg-blue-500 text-gray-800 font-medium text-center rounded-md hover:bg-blue-600 transition duration-300 text-sm uppercase tracking-wider"
            >
              {t_home('hero.createAccount', 'Créer un compte')}
            </Link>
            <a 
              href="#features"
              className={`px-8 py-3 border border-gray-300 text-gray-700 font-medium text-center rounded-md hover:bg-gray-50 transition duration-300 text-sm uppercase tracking-wider ${showFeatureButton ? 'fixed top-4 right-4 z-50 bg-white' : ''}`}
            >
              {t_home('hero.discoverFeatures', 'Découvrir les fonctionnalités')}
            </a>
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div id="features" className="mt-24 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          {t_home('features.title', 'Nos fonctionnalités')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Gestion des membres */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-52 rounded-full border-2 border-gray-300 overflow-hidden shadow-lg mb-4">
              <img 
                src={membersImage}
                alt={t_home('features.memberManagement.title', 'Gestion des membres')}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t_home('features.memberManagement.title', 'Gestion des membres')}
            </h3>
            <p className="text-gray-600 text-center">
              {t_home('features.memberManagement.description', 'Gérez efficacement vos adhérents, leurs rôles et leurs contributions. Suivez les cotisations et gardez un historique complet des activités.')}
            </p>
          </div>

          {/* Analyse des données */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-52 rounded-full border-2 border-gray-300 overflow-hidden shadow-lg mb-4">
              <img 
                src={analysisImage}
                alt={t_home('features.dataAnalysis.title', 'Analyse des données')}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t_home('features.dataAnalysis.title', 'Analyse des données')}
            </h3>
            <p className="text-gray-600 text-center">
              {t_home('features.dataAnalysis.description', 'Visualisez et analysez vos données pour prendre des décisions éclairées. Créez des rapports détaillés sur vos activités et leur impact.')}
            </p>
          </div>

          {/* Gestion des stocks */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-52 rounded-full border-2 border-gray-300 overflow-hidden shadow-lg mb-4">
              <img 
                src={stockImage}
                alt={t_home('features.stockManagement.title', 'Gestion des stocks')}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t_home('features.stockManagement.title', 'Gestion des stocks')}
            </h3>
            <p className="text-gray-600 text-center">
              {t_home('features.stockManagement.description', 'Suivez en temps réel vos inventaires, recevez des alertes de seuil et optimisez la distribution des ressources entre vos différents sites.')}
            </p>
          </div>

          {/* Suivi terrain */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-52 rounded-full border-2 border-gray-300 overflow-hidden shadow-lg mb-4">
              <img 
                src={terrainImage}
                alt={t_home('features.fieldTracking.title', 'Suivi terrain')}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t_home('features.fieldTracking.title', 'Suivi terrain')}
            </h3>
            <p className="text-gray-600 text-center">
              {t_home('features.fieldTracking.description', 'Localisez vos équipes, coordonnez les actions et améliorez la sécurité de vos bénévoles avec notre système de suivi en temps réel.')}
            </p>
          </div>

          {/* Impact social */}
          <div className="flex flex-col items-center">
            <div className="w-52 h-52 rounded-full border-2 border-gray-300 overflow-hidden shadow-lg mb-4">
              <img 
                src={impactSocialImage}
                alt={t_home('features.socialImpact.title', 'Impact social')}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t_home('features.socialImpact.title', 'Impact social')}
            </h3>
            <p className="text-gray-600 text-center">
              {t_home('features.socialImpact.description', 'Mesurez et démontrez l\'impact de vos actions sur la communauté. Générez des rapports d\'impact pour vos partenaires et donateurs.')}
            </p>
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="mt-24 bg-gray-50 py-12 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          {t_home('testimonials.title', 'Témoignages de nos utilisateurs')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(({ name, org, initials, quote }) => (
            <div key={name} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-yellow-500 font-bold">{initials}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{name}</h4>
                  <p className="text-sm text-gray-500">{org}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call To Action */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {t_home('cta.title', 'Prêt à transformer votre association ?')}
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t_home('cta.description', 'Rejoignez des centaines d\'associations qui utilisent déjà notre outil pour structurer leurs actions et décupler leur impact.')}
        </p>
        <Link 
          to="/signup" 
          className="px-8 py-4 bg-yellow-400 text-gray-800 font-semibold rounded-md hover:bg-yellow-500 transition duration-300 inline-block"
        >
          {t_home('cta.button', 'Créer mon espace')}
        </Link>
      </div>
    </div>
  );
};

export default Home;
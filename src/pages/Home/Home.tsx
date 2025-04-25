import { Link } from 'react-router-dom';
import landingImage from '../../assets/pictures/assoc-landing-page.jpg';

const Home = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-6 tracking-wide">
            Simplifiez la gestion de votre association
          </h1>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            Une plateforme intuitive pour gérer vos membres, organiser vos missions, suivre les stocks
            et analyser vos actions. Conçue pour les associations engagées comme la vôtre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/signup"
              className="px-8 py-3 bg-yellow-400 text-gray-800 font-medium text-center rounded-md hover:bg-yellow-500 transition duration-300 text-sm uppercase tracking-wider"
            >
              Créer un compte
            </Link>
            <a 
              href="#features"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-medium text-center rounded-md hover:bg-gray-50 transition duration-300 text-sm uppercase tracking-wider"  
            >
              Découvrir les fonctionnalités
            </a>
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div id="features" className="mt-24 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nos fonctionnalités</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Gestion des membres */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center shadow-lg mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Gestion des membres</h3>
            <p className="text-gray-600 text-center">
              Gérez efficacement vos adhérents, leurs rôles et leurs contributions. Suivez les cotisations et gardez un historique complet des activités.
            </p>
          </div>

          {/* Analyse des données */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center shadow-lg mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Analyse des données</h3>
            <p className="text-gray-600 text-center">
              Visualisez et analysez vos données pour prendre des décisions éclairées. Créez des rapports détaillés sur vos activités et leur impact.
            </p>
          </div>

          {/* Gestion des stocks */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-500 flex items-center justify-center shadow-lg mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Gestion des stocks</h3>
            <p className="text-gray-600 text-center">
              Suivez en temps réel vos inventaires, recevez des alertes de seuil et optimisez la distribution des ressources entre vos différents sites.
            </p>
          </div>

          {/* Suivi terrain */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Suivi terrain</h3>
            <p className="text-gray-600 text-center">
              Localisez vos équipes, coordonnez les actions et améliorez la sécurité de vos bénévoles avec notre système de suivi en temps réel.
            </p>
          </div>

          {/* Impact social */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Impact social</h3>
            <p className="text-gray-600 text-center">
              Mesurez et démontrez l'impact de vos actions sur la communauté. Générez des rapports d'impact pour vos partenaires et donateurs.
            </p>
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="mt-24 bg-gray-50 py-12 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Témoignages de nos utilisateurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Jean Dupont',
              org: 'Association Entraide',
              initials: 'JD',
              quote: 'Grâce au suivi des stocks en temps réel, nous avons réduit nos pertes de 30% et optimisé nos distributions sur le terrain.'
            },
            {
              name: 'Marie Lambert',
              org: 'Club Sportif Local',
              initials: 'ML',
              quote: 'La fonctionnalité de géolocalisation nous a permis de coordonner efficacement nos bénévoles lors des grands événements.'
            },
            {
              name: 'Paul Lefèvre',
              org: 'Association Culturelle',
              initials: 'PL',
              quote: 'Le module de gestion des événements nous a fait gagner un temps précieux et amélioré la communication avec nos participants.'
            }
          ].map(({ name, org, initials, quote }) => (
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Prêt à transformer votre association ?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des centaines d'associations qui utilisent déjà notre outil pour structurer leurs actions et décupler leur impact.
        </p>
        <Link 
          to="/signup" 
          className="px-8 py-4 bg-yellow-400 text-gray-800 font-semibold rounded-md hover:bg-yellow-500 transition duration-300 inline-block"
        >
          Créer mon espace
        </Link>
      </div>
    </div>
  );
};

export default Home;

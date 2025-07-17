import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../useTheme';
import { Button } from '../../components/common/button/button';
import { Input } from '../../components/common/input/input';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FaLinkedin } from 'react-icons/fa';

const Settings = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi de formulaire
    setTimeout(() => {
      toast.success(t_contact('form_sent_success', 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'));
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const handleLinkedInClick = (url: string) => {
    window.open(url, '_blank');
  };

  // Fonction helper pour les traductions avec fallback
  const t_contact = (key: string, fallback: string): string => {
    try {
      return t(`contact.${key}` as any) || fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Informations de contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t_contact('contact_info', 'Informations de contact')}
            </h2>
            
            <div className="space-y-8">
              {/* Hubert Zodjihoue */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-maraudr-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Hubert Zodjihoue
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('hubert_title', 'Ingénieur logiciels en alternance chez Air France')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('hubert_location', 'Roissy-en-France, Île-de-France')}
                    </p>
                    <div className="flex items-center space-x-4">
                      <a 
                        href="mailto:zodjihoue@outlook.fr"
                        className="text-maraudr-blue hover:text-maraudr-orange transition-colors"
                      >
                        zodjihoue@outlook.fr
                      </a>
                      <button
                        onClick={() => handleLinkedInClick('https://www.linkedin.com/in/hubert-zodjihoue-747557128/')}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FaLinkedin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hugo Cachon */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-maraudr-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Hugo Cachon
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('hugo_title', 'Développeur Logiciel C#/.NET | AFP (Agence France-Presse)')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('hugo_location', 'Paris')}
                    </p>
                    <div className="flex items-center space-x-4">
                      <a 
                        href="mailto:hugo.cachon@hotmail.fr"
                        className="text-maraudr-blue hover:text-maraudr-orange transition-colors"
                      >
                        hugo.cachon@hotmail.fr
                      </a>
                      <button
                        onClick={() => handleLinkedInClick('https://www.linkedin.com/in/hugocachon/')}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FaLinkedin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khalil Makhloufi */}
              <div className="pb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-maraudr-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Khalil Makhloufi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('khalil_title', 'Software Engineer @ Bouygues Telecom')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t_contact('khalil_location', 'Paris')}
                    </p>
                    <div className="flex items-center space-x-4">
                      <a 
                        href="mailto:khalilmakloufi@gmail.com"
                        className="text-maraudr-blue hover:text-maraudr-orange transition-colors"
                      >
                        khalilmakloufi@gmail.com
                      </a>
                      <button
                        onClick={() => handleLinkedInClick('https://www.linkedin.com/in/khalil-m-648234211/')}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FaLinkedin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
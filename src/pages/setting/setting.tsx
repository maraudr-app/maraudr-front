import React, { useState, useEffect } from 'react';
import {
    BellIcon,
    CogIcon,
    GlobeAltIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon,
    UserIcon,
    CreditCardIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    UsersIcon,
    CheckIcon,
    XMarkIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { subscriptionService, Plan, Subscription, PaymentMethod } from '../../services/subscriptionService';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/toast/Toast';
import { Input } from '../../components/common/input/input';

const Setting: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { selectedAssociation } = useAssoStore();
    const { toasts, removeToast, toast } = useToast();
    
    // États pour les sections
    const [activeSection, setActiveSection] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    
    // États pour les paramètres
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        sms: false,
        marketing: false
    });
    const [language, setLanguage] = useState('fr');
    
    // États pour l'abonnement
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Données mockées pour les activités de l'association
    const [associationActivities] = useState([
        {
            id: 1,
            type: 'member_joined',
            title: 'Nouveau membre',
            description: 'Marie Dubois a rejoint l\'association',
            date: '2024-01-15T10:30:00Z',
            icon: '👤',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        },
        {
            id: 2,
            type: 'stock_update',
            title: 'Mise à jour stock',
            description: 'Ajout de 50 conserves au stock principal',
            date: '2024-01-14T14:20:00Z',
            icon: '📦',
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        },
        {
            id: 3,
            type: 'mission_completed',
            title: 'Mission terminée',
            description: 'Maraude du quartier Nord - 12 personnes aidées',
            date: '2024-01-13T18:45:00Z',
            icon: '✅',
            color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        },
        {
            id: 4,
            type: 'donation_received',
            title: 'Don reçu',
            description: 'Don de 500€ de la part de l\'entreprise TechCorp',
            date: '2024-01-12T09:15:00Z',
            icon: '💰',
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        },
        {
            id: 5,
            type: 'event_scheduled',
            title: 'Événement planifié',
            description: 'Distribution alimentaire prévue le 20 janvier',
            date: '2024-01-11T16:00:00Z',
            icon: '📅',
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        },
        {
            id: 6,
            type: 'member_promoted',
            title: 'Promotion membre',
            description: 'Jean Martin promu au rang de bénévole senior',
            date: '2024-01-10T11:30:00Z',
            icon: '⭐',
            color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
        }
    ]);

    // États pour les paramètres d'association
    const [associationSettings, setAssociationSettings] = useState({
        name: selectedAssociation?.name || 'Association Entraide',
        description: 'Association d\'aide aux personnes en difficulté',
        address: '123 Rue de la Solidarité',
        city: 'Paris',
        postalCode: '75001',
        phone: '01 23 45 67 89',
        email: 'contact@association-entraide.fr',
        website: 'www.association-entraide.fr',
        siret: selectedAssociation?.siret || '12345678901234',
        president: 'Jean Dupont',
        treasurer: 'Marie Martin'
    });

    // États pour le formulaire de paiement
    const [paymentForm, setPaymentForm] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        billingAddress: '',
        billingCity: '',
        billingPostalCode: ''
    });

    const isManager = user?.userType === 'Manager';

    // Mettre à jour le nom et SIRET quand l'association change
    useEffect(() => {
        if (selectedAssociation) {
            setAssociationSettings(prev => ({
                ...prev,
                name: selectedAssociation.name,
                siret: selectedAssociation.siret
            }));
        }
    }, [selectedAssociation]);

    // Charger les données d'abonnement
    useEffect(() => {
        const loadSubscriptionData = async () => {
            if (!user?.sub) return;
            
            try {
                const [subscription, plans, payments] = await Promise.all([
                    subscriptionService.getCurrentSubscription(user.sub),
                    subscriptionService.getAvailablePlans(),
                    subscriptionService.getPaymentMethods(user.sub)
                ]);
                
                setCurrentSubscription(subscription);
                setAvailablePlans(plans);
                setPaymentMethods(payments);
            } catch (error) {
                console.error('Erreur lors du chargement des données d\'abonnement:', error);
            }
        };

        loadSubscriptionData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpgradePlan = (plan: Plan) => {
        setSelectedPlan(plan);
        if (plan.price > 0) {
            setShowPaymentModal(true);
        } else {
            processUpgrade(plan);
        }
    };

    const processUpgrade = async (plan: Plan) => {
        if (!user?.sub) return;
        
        setIsLoading(true);
        try {
            await subscriptionService.upgradePlan(user.sub, plan.id);
            
            // Recharger l'abonnement
            const updatedSubscription = await subscriptionService.getCurrentSubscription(user.sub);
            setCurrentSubscription(updatedSubscription);
            
            toast.success(`Félicitations ! Vous êtes maintenant abonné au plan ${plan.name}`);
            setShowUpgradeModal(false);
            setShowPaymentModal(false);
        } catch (error) {
            toast.error('Erreur lors de la mise à niveau');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;

        setIsLoading(true);
        try {
            // Simuler l'ajout de la méthode de paiement
            const paymentMethod = await subscriptionService.addPaymentMethod(user?.sub || '', {
                type: 'card',
                last4: paymentForm.cardNumber.slice(-4),
                brand: 'Visa',
                expiryMonth: parseInt(paymentForm.expiryMonth),
                expiryYear: parseInt(paymentForm.expiryYear),
                isDefault: true
            });

            // Traiter le paiement
            const paymentResult = await subscriptionService.processPayment(
                selectedPlan.price,
                'EUR',
                paymentMethod.id
            );

            if (paymentResult.success) {
                await processUpgrade(selectedPlan);
                toast.success('Paiement effectué avec succès !');
            } else {
                toast.error(paymentResult.error || 'Erreur de paiement');
            }
        } catch (error) {
            toast.error('Erreur lors du traitement du paiement');
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentPlan = () => {
        if (!currentSubscription) return null;
        return availablePlans.find(plan => plan.id === currentSubscription.planId);
    };

    const handleAssociationChange = (field: string, value: string) => {
        setAssociationSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentFormChange = (field: string, value: string) => {
        setPaymentForm(prev => ({ ...prev, [field]: value }));
    };

    // Navigation sections différenciées selon le type d'utilisateur
    const getNavigationSections = () => {
        const baseSections = [
            { id: 'association', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Association' },
            { id: 'activities', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Activités' },
            { id: 'profile', icon: <UserIcon className="w-4 h-4" />, label: 'Profil' },
            { id: 'notifications', icon: <BellIcon className="w-4 h-4" />, label: 'Notifications' },
            { id: 'privacy', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Confidentialité' },
            { id: 'language', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Langue' }
        ];

        const managerSections = [
            { id: 'subscription', icon: <CreditCardIcon className="w-4 h-4" />, label: 'Abonnement' },
            { id: 'billing', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Facturation' },
            { id: 'team', icon: <UsersIcon className="w-4 h-4" />, label: 'Gestion équipe' }
        ];

        const supportSection = [
            { id: 'support', icon: <QuestionMarkCircleIcon className="w-4 h-4" />, label: 'Aide & Support' }
        ];

        return [
            ...baseSections,
            ...(isManager ? managerSections : []),
            ...supportSection
        ];
    };

    const renderAssociationSection = () => (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Paramètres de l'Association</h2>
                {!isManager && (
                    <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        <ShieldCheckIcon className="w-4 h-4 mr-1" />
                        Consultation seule
                    </div>
                )}
            </div>
            
            <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        placeholder="Nom de l'association"
                        value={associationSettings.name}
                        onChange={(e) => isManager && handleAssociationChange('name', e.target.value)}
                        required
                        disabled={!isManager}
                    />
                    <Input
                        placeholder="SIRET"
                        value={associationSettings.siret}
                        onChange={(e) => isManager && handleAssociationChange('siret', e.target.value)}
                        required
                        disabled={!isManager}
                    />
                </div>

                <div className="col-span-2">
                    <textarea
                        placeholder="Description de l'association"
                        value={associationSettings.description}
                        onChange={(e) => isManager && handleAssociationChange('description', e.target.value)}
                        rows={3}
                        disabled={!isManager}
                        className={`w-full border border-gray-300 rounded px-5 py-3 outline-none transition-all duration-200 resize-none ${
                            isManager 
                                ? 'focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white' 
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                    />
                </div>

                {/* Adresse */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-orange-500" />
                        Adresse
                    </h3>
                    <Input
                        placeholder="Adresse"
                        value={associationSettings.address}
                        onChange={(e) => isManager && handleAssociationChange('address', e.target.value)}
                        required
                        disabled={!isManager}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Ville"
                            value={associationSettings.city}
                            onChange={(e) => isManager && handleAssociationChange('city', e.target.value)}
                            required
                            disabled={!isManager}
                        />
                        <Input
                            placeholder="Code postal"
                            value={associationSettings.postalCode}
                            onChange={(e) => isManager && handleAssociationChange('postalCode', e.target.value)}
                            required
                            disabled={!isManager}
                        />
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <PhoneIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Téléphone"
                            value={associationSettings.phone}
                            onChange={(e) => isManager && handleAssociationChange('phone', e.target.value)}
                            type="tel"
                            disabled={!isManager}
                        />
                        <Input
                            placeholder="Email"
                            value={associationSettings.email}
                            onChange={(e) => isManager && handleAssociationChange('email', e.target.value)}
                            type="email"
                            disabled={!isManager}
                        />
                    </div>
                    <Input
                        placeholder="Site web"
                        value={associationSettings.website}
                        onChange={(e) => isManager && handleAssociationChange('website', e.target.value)}
                        type="url"
                        disabled={!isManager}
                    />
                </div>

                {/* Responsables */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Responsables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Président"
                            value={associationSettings.president}
                            onChange={(e) => isManager && handleAssociationChange('president', e.target.value)}
                            disabled={!isManager}
                        />
                        <Input
                            placeholder="Trésorier"
                            value={associationSettings.treasurer}
                            onChange={(e) => isManager && handleAssociationChange('treasurer', e.target.value)}
                            disabled={!isManager}
                        />
                    </div>
                </div>

                {/* Boutons d'action - seulement pour les managers */}
                {isManager && (
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all">
                            Sauvegarder les modifications
                        </button>
                        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                            Annuler
                        </button>
                    </div>
                )}
                
                {/* Message informatif pour les utilisateurs simples */}
                {!isManager && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-2" />
                                <p className="text-blue-800 dark:text-blue-400 text-sm">
                                    Seuls les managers peuvent modifier les paramètres de l'association. 
                                    Contactez un manager pour effectuer des changements.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );

    const renderActivitiesSection = () => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Hier';
            if (diffDays < 7) return `Il y a ${diffDays} jours`;
            return date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        };

        return (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activités de l'Association</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {associationActivities.length} activités récentes
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {associationActivities.map((activity) => (
                        <div 
                            key={activity.id} 
                            className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
                                    {activity.icon}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {activity.title}
                                    </h4>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${activity.color}`}>
                                        {activity.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {formatDate(activity.date)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistiques rapides */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">Membres</p>
                                <p className="text-lg font-semibold text-green-700 dark:text-green-300">47</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Missions</p>
                                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">23</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CogIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Stock</p>
                                <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">85%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <GlobeAltIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Impact</p>
                                <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">156</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    const renderProfileSection = () => (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profil utilisateur</h2>
            
            <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            isManager 
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                            {isManager ? 'Manager' : 'Membre'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all">
                    Modifier le profil
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    Changer le mot de passe
                </button>
            </div>
        </section>
    );

    const renderSubscriptionSection = () => {
        const currentPlan = getCurrentPlan();
        
        return (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Abonnement</h2>
                    {currentPlan && currentPlan.id !== 'enterprise' && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all"
                        >
                            Mettre à niveau
                        </button>
                    )}
                </div>

                {currentPlan && (
                    <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/10 dark:to-blue-900/10 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Plan {currentPlan.name}
                                </h3>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                                    {currentPlan.price === 0 ? 'Gratuit' : `${currentPlan.price}€/mois`}
                                </p>
                                <div className="space-y-2">
                                    {currentPlan.features.slice(0, 3).map((feature, index) => (
                                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {currentPlan.popular && (
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Populaire
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {currentSubscription && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Détails de l'abonnement</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                                <span className={`ml-2 font-medium ${
                                    currentSubscription.status === 'active' 
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {currentSubscription.status === 'active' ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Renouvellement:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                    {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        );
    };

    const renderPaymentModal = () => (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <CreditCardIcon className="w-6 h-6 mr-2 text-orange-500" />
                                Validation de l'abonnement
                            </h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="p-6">
                        {selectedPlan && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/10 dark:to-blue-900/10 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Plan {selectedPlan.name}</h4>
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {selectedPlan.price}€/mois
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                placeholder="Nom du titulaire"
                                value={paymentForm.cardholderName}
                                onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Numéro de carte"
                                value={paymentForm.cardNumber}
                                onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                required
                            />

                            <div className="grid grid-cols-3 gap-3">
                                <select
                                    value={paymentForm.expiryMonth}
                                    onChange={(e) => handlePaymentFormChange('expiryMonth', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="">MM</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>
                                            {month.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={paymentForm.expiryYear}
                                    onChange={(e) => handlePaymentFormChange('expiryYear', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="">YYYY</option>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                <Input
                                    placeholder="CVC"
                                    value={paymentForm.cvc}
                                    onChange={(e) => handlePaymentFormChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    required
                                />
                            </div>

                            <h4 className="font-medium text-gray-900 dark:text-white mt-6 mb-3">Adresse de facturation</h4>
                            
                            <Input
                                placeholder="Adresse"
                                value={paymentForm.billingAddress}
                                onChange={(e) => handlePaymentFormChange('billingAddress', e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="Ville"
                                    value={paymentForm.billingCity}
                                    onChange={(e) => handlePaymentFormChange('billingCity', e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder="Code postal"
                                    value={paymentForm.billingPostalCode}
                                    onChange={(e) => handlePaymentFormChange('billingPostalCode', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Traitement...' : `Payer ${selectedPlan?.price}€`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderUpgradeModal = () => (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Choisissez votre plan
                            </h3>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {availablePlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative border rounded-xl p-6 cursor-pointer transition-all ${
                                        plan.popular
                                            ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Populaire
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h4>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                                        </div>
                                        {plan.price > 0 && (
                                            <div className="text-gray-500 dark:text-gray-400">/mois</div>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start text-sm">
                                                <CheckIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleUpgradePlan(plan)}
                                        disabled={isLoading || getCurrentPlan()?.id === plan.id}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                                            getCurrentPlan()?.id === plan.id
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : plan.popular
                                                ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:from-orange-600 hover:to-blue-600'
                                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {getCurrentPlan()?.id === plan.id ? 'Plan actuel' : 'Choisir ce plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationsSection = () => (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
            
            <div className="space-y-6">
                {Object.entries({
                    push: { label: 'Notifications push', desc: 'Recevoir des notifications en temps réel' },
                    email: { label: 'Notifications par email', desc: 'Recevoir un résumé par email' },
                    sms: { label: 'Notifications SMS', desc: 'Recevoir des alertes importantes par SMS' },
                    marketing: { label: 'Communications marketing', desc: 'Recevoir nos offres et nouveautés' }
                }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{config.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{config.desc}</p>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[key as keyof typeof notifications]
                                    ? 'bg-gradient-to-r from-orange-500 to-blue-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'association':
                return renderAssociationSection();
            case 'profile':
                return renderProfileSection();
            case 'subscription':
                return isManager ? renderSubscriptionSection() : null;
            case 'notifications':
                return renderNotificationsSection();
            case 'privacy':
                return (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Confidentialité</h2>
                        <p className="text-gray-600 dark:text-gray-400">Paramètres de confidentialité en cours de développement...</p>
                    </section>
                );
            case 'language':
                return (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Langue et région</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Langue de l'interface
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>
                        </div>
                    </section>
                );
            case 'billing':
                return isManager ? (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Facturation</h2>
                        <p className="text-gray-600 dark:text-gray-400">Historique de facturation et méthodes de paiement...</p>
                    </section>
                ) : null;
            case 'team':
                return isManager ? (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gestion de l'équipe</h2>
                        <p className="text-gray-600 dark:text-gray-400">Paramètres de gestion d'équipe réservés aux managers...</p>
                    </section>
                ) : null;
            case 'support':
                return (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Aide & Support</h2>
                        <div className="space-y-4">
                            <button className="flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                Centre d'aide
                            </button>
                            <button className="flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                Politique de confidentialité
                            </button>
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Version de l'application: 2.1.0
                                </p>
                            </div>
                        </div>
                    </section>
                );
            default:
                return renderAssociationSection();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-orange-200/50 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                            <CogIcon className="w-6 h-6 mr-3 text-orange-500" />
                            Paramètres
                        </h1>
                        <button
                            onClick={() => navigate('/maraudApp/dashboard')}
                            className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-24">
                            <div className="space-y-1">
                                {getNavigationSections().map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center w-full px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                                            activeSection === section.id
                                                ? 'bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 text-orange-700 dark:text-orange-400 border-l-4 border-orange-500'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span className="mr-3">{section.icon}</span>
                                        {section.label}
                                    </button>
                                ))}

                                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-3 py-2 text-sm rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        <span className="mr-3">🚪</span>
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-3">
                        {renderSection()}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showUpgradeModal && renderUpgradeModal()}
            {showPaymentModal && renderPaymentModal()}
            
            {/* Toasts */}
            {toasts.map((toastItem) => (
                <Toast
                    key={toastItem.id}
                    message={toastItem.message}
                    type={toastItem.type}
                    duration={toastItem.duration}
                    onClose={() => removeToast(toastItem.id)}
                />
            ))}
        </div>
    );
};

export default Setting;
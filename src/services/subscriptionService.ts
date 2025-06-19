export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxMembers: number;
  maxAssociations: number;
  storageGB: number;
  priority: 'basic' | 'standard' | 'premium';
  popular?: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  userId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Plans disponibles (mockés)
const MOCK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Jusqu\'à 5 membres',
      '1 association',
      '1 GB de stockage',
      'Support par email',
      'Fonctionnalités de base'
    ],
    maxMembers: 5,
    maxAssociations: 1,
    storageGB: 1,
    priority: 'basic'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Jusqu\'à 25 membres',
      '3 associations',
      '10 GB de stockage',
      'Support prioritaire',
      'Rapports avancés',
      'Notifications push'
    ],
    maxMembers: 25,
    maxAssociations: 3,
    storageGB: 10,
    priority: 'standard',
    popular: true
  },
  {
    id: 'professional',
    name: 'Professionnel',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Membres illimités',
      '10 associations',
      '100 GB de stockage',
      'Support 24/7',
      'Analytics avancés',
      'API personnalisée',
      'Intégrations tierces',
      'Sauvegarde automatique'
    ],
    maxMembers: -1, // illimité
    maxAssociations: 10,
    storageGB: 100,
    priority: 'premium'
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 99.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Tout illimité',
      'Support dédié',
      'Formations personnalisées',
      'Déploiement sur site',
      'SLA garanti',
      'Sécurité renforcée',
      'Audit et conformité'
    ],
    maxMembers: -1,
    maxAssociations: -1,
    storageGB: -1, // illimité
    priority: 'premium'
  }
];

// Données mockées pour la démo
let mockSubscription: Subscription | null = {
  id: 'sub_123',
  planId: 'free',
  userId: 'user_123',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
  cancelAtPeriodEnd: false
};

let mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_123',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
];

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

export const subscriptionService = {
  // Récupérer tous les plans disponibles
  getAvailablePlans: async (): Promise<Plan[]> => {
    await simulateDelay();
    return MOCK_PLANS;
  },

  // Récupérer l'abonnement actuel de l'utilisateur
  getCurrentSubscription: async (userId: string): Promise<Subscription | null> => {
    await simulateDelay();
    return mockSubscription;
  },

  // Récupérer un plan par son ID
  getPlanById: async (planId: string): Promise<Plan | null> => {
    await simulateDelay();
    return MOCK_PLANS.find(plan => plan.id === planId) || null;
  },

  // Mettre à niveau vers un nouveau plan
  upgradePlan: async (userId: string, newPlanId: string, paymentMethodId?: string): Promise<Subscription> => {
    await simulateDelay();
    
    // Simuler la mise à niveau
    mockSubscription = {
      id: `sub_${Date.now()}`,
      planId: newPlanId,
      userId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };

    return mockSubscription;
  },

  // Annuler l'abonnement
  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    await simulateDelay();
    
    if (mockSubscription) {
      mockSubscription.cancelAtPeriodEnd = true;
      mockSubscription.status = 'cancelled';
    }

    return mockSubscription!;
  },

  // Réactiver l'abonnement
  reactivateSubscription: async (subscriptionId: string): Promise<Subscription> => {
    await simulateDelay();
    
    if (mockSubscription) {
      mockSubscription.cancelAtPeriodEnd = false;
      mockSubscription.status = 'active';
    }

    return mockSubscription!;
  },

  // Récupérer les méthodes de paiement
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    await simulateDelay();
    return mockPaymentMethods;
  },

  // Ajouter une méthode de paiement
  addPaymentMethod: async (userId: string, paymentData: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    await simulateDelay();
    
    const newPaymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: paymentData.type || 'card',
      last4: paymentData.last4 || '0000',
      brand: paymentData.brand || 'Unknown',
      expiryMonth: paymentData.expiryMonth || 12,
      expiryYear: paymentData.expiryYear || 2025,
      isDefault: paymentData.isDefault || false
    };

    // Si c'est la méthode par défaut, désactiver les autres
    if (newPaymentMethod.isDefault) {
      mockPaymentMethods.forEach(pm => pm.isDefault = false);
    }

    mockPaymentMethods.push(newPaymentMethod);
    return newPaymentMethod;
  },

  // Supprimer une méthode de paiement
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await simulateDelay();
    mockPaymentMethods = mockPaymentMethods.filter(pm => pm.id !== paymentMethodId);
  },

  // Simuler un paiement
  processPayment: async (amount: number, currency: string, paymentMethodId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
    await simulateDelay();
    
    // Simuler un succès dans 90% des cas
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: 'Paiement refusé par votre banque'
      };
    }
  }
}; 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assoService } from '../services/assoService';
import { useAuthStore } from './authStore';

interface Association {
    id: string;
    name: string;
    logo?: string;
}

interface AssoState {
    associations: Association[];
    selectedAssociation: Association | null;
    sidebarCollapsed: boolean;
    lastFetchTime: number | null;  // Pour suivre quand les données ont été mises à jour
    
    // Actions
    setAssociations: (associations: Association[]) => void;
    setSelectedAssociation: (association: Association | null) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    fetchUserAssociations: () => Promise<void>;
    clearAssociations: () => void;
    reloadAllData: () => Promise<void>;  // Nouvelle fonction pour tout recharger
    checkAndReloadIfNeeded: () => Promise<void>;  // Vérifie et recharge si nécessaire
}

// Temps maximum avant de recharger les données (5 minutes)
const MAX_CACHE_TIME = 5 * 60 * 1000;

export const useAssoStore = create<AssoState>()(
    persist(
        (set, get) => ({
            associations: [],
            selectedAssociation: null,
            sidebarCollapsed: false,
            lastFetchTime: null,

            setAssociations: (associations) => set({ 
                associations,
                lastFetchTime: Date.now()
            }),
            
            setSelectedAssociation: (association) => set({ selectedAssociation: association }),
            
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            
            fetchUserAssociations: async () => {
                try {
                    const userAssociations = await assoService.getCurrentUserAssociation();
                    
                    if (!userAssociations || userAssociations.length === 0) {
                        set({ 
                            associations: [], 
                            selectedAssociation: null,
                            lastFetchTime: Date.now()
                        });
                        return;
                    }

                    // Récupérer les informations complètes pour chaque association
                    const associationsWithDetails = await Promise.all(
                        userAssociations.map(async (assoId: string) => {
                            const assoDetails = await assoService.getAssociation(assoId);
                            
                            if (!assoDetails || !assoDetails.id || !assoDetails.name) {
                                return null;
                            }
                            
                            return {
                                id: assoDetails.id,
                                name: assoDetails.name,
                                logo: assoDetails.logo
                            };
                        })
                    );

                    // Filtrer les associations nulles
                    const validAssociations = associationsWithDetails.filter((asso): asso is Association => asso !== null);
                    
                    set({ 
                        associations: validAssociations,
                        lastFetchTime: Date.now()
                    });
                    
                    if (validAssociations.length > 0) {
                        set({ selectedAssociation: validAssociations[0] });
                    } else {
                        set({ selectedAssociation: null });
                    }
                } catch (error) {
                    console.error('Error fetching user associations:', error);
                    set({ 
                        associations: [], 
                        selectedAssociation: null,
                        lastFetchTime: null
                    });
                }
            },

            clearAssociations: () => set({ 
                associations: [], 
                selectedAssociation: null,
                lastFetchTime: null
            }),

            // Nouvelle fonction pour recharger toutes les données
            reloadAllData: async () => {
                try {
                    // Recharger les données utilisateur
                    const authStore = useAuthStore.getState();
                    if (authStore.user) {
                        await authStore.fetchUser();
                    }

                    // Recharger les associations
                    await get().fetchUserAssociations();
                } catch (error) {
                    console.error('Error reloading all data:', error);
                }
            },

            // Vérifie si les données doivent être rechargées
            checkAndReloadIfNeeded: async () => {
                const state = get();
                const now = Date.now();

                // Si pas de données ou données trop anciennes, on recharge
                if (!state.lastFetchTime || (now - state.lastFetchTime > MAX_CACHE_TIME)) {
                    console.log('Data is stale or missing, reloading...');
                    await get().reloadAllData();
                } else if (state.associations.length === 0) {
                    // Si pas d'associations mais on a une dernière mise à jour, on recharge quand même
                    console.log('No associations but we have a lastFetchTime, reloading...');
                    await get().fetchUserAssociations();
                }
            }
        }),
        {
            name: 'asso-storage',
            partialize: (state) => ({
                associations: state.associations,
                selectedAssociation: state.selectedAssociation,
                lastFetchTime: state.lastFetchTime
            })
        }
    )
); 
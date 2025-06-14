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
    isLoading: boolean;  // Nouveau drapeau pour suivre l'état de chargement
    
    // Actions
    setAssociations: (associations: Association[]) => void;
    setSelectedAssociation: (association: Association | null) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    fetchUserAssociations: () => Promise<void>;
    clearAssociations: () => void;
    reloadAllData: () => Promise<void>;  // Nouvelle fonction pour tout recharger
    checkAndReloadIfNeeded: () => Promise<void>;  // Vérifie et recharge si nécessaire
    fetchAssociations: () => Promise<void>;
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
            isLoading: false,  // Initialiser le drapeau de chargement

            setAssociations: (associations) => set({ 
                associations,
                lastFetchTime: Date.now()
            }),
            
            setSelectedAssociation: (association) => set({ selectedAssociation: association }),
            
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            
            fetchUserAssociations: async () => {
                const state = get();
                if (state.isLoading) return;

                set({ isLoading: true });
                try {
                    const userAssociations = await assoService.getCurrentUserAssociation();
                    console.log('User associations:', userAssociations);
                    
                    if (!userAssociations || userAssociations.length === 0) {
                        set({ 
                            associations: [], 
                            selectedAssociation: null,
                            lastFetchTime: Date.now(),
                            isLoading: false
                        });
                        return;
                    }

                    // Récupérer les informations complètes pour chaque association
                    const associationsWithDetails = await Promise.all(
                        userAssociations.map(async (assoId: string) => {
                            try {
                                const assoDetails = await assoService.getAssociation(assoId);
                                console.log('Association details for', assoId, ':', assoDetails);
                                
                                if (!assoDetails || !assoDetails.id || !assoDetails.name) {
                                    console.warn('Invalid association details for', assoId);
                                    return null;
                                }
                                
                                return {
                                    id: assoDetails.id,
                                    name: assoDetails.name,
                                    logo: assoDetails.logo
                                };
                            } catch (error) {
                                console.error('Error fetching details for association', assoId, ':', error);
                                return null;
                            }
                        })
                    );

                    // Filtrer les associations nulles
                    const validAssociations = associationsWithDetails.filter((asso): asso is Association => asso !== null);
                    console.log('Valid associations:', validAssociations);
                    
                    // Mettre à jour le state avec les associations valides
                    set({ 
                        associations: validAssociations,
                        lastFetchTime: Date.now(),
                        isLoading: false
                    });
                    
                    // Sélectionner la première association si aucune n'est sélectionnée
                    if (validAssociations.length > 0 && !state.selectedAssociation) {
                        console.log('Setting selected association to:', validAssociations[0]);
                        set({ selectedAssociation: validAssociations[0] });
                    }
                } catch (error) {
                    console.error('Error fetching user associations:', error);
                    set({ 
                        associations: [], 
                        selectedAssociation: null,
                        lastFetchTime: null,
                        isLoading: false
                    });
                }
            },

            clearAssociations: () => set({ 
                associations: [], 
                selectedAssociation: null,
                lastFetchTime: null,
                isLoading: false
            }),

            // Nouvelle fonction pour recharger toutes les données
            reloadAllData: async () => {
                const state = get();
                if (state.isLoading) return;

                set({ isLoading: true });
                try {
                    const authStore = useAuthStore.getState();
                    if (authStore.user) {
                        await authStore.fetchUser();
                    }
                    await get().fetchUserAssociations();
                } catch (error) {
                    console.error('Error reloading all data:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            // Vérifie si les données doivent être rechargées
            checkAndReloadIfNeeded: async () => {
                const state = get();
                if (state.isLoading) return;

                const now = Date.now();
                // Toujours recharger si pas d'associations ou si les données sont périmées
                const shouldReload = !state.lastFetchTime || 
                                   (now - state.lastFetchTime > MAX_CACHE_TIME) || 
                                   state.associations.length === 0;

                if (shouldReload) {
                    console.log('Reloading associations data...');
                    await get().fetchUserAssociations();
                } else {
                    console.log('Using cached associations data');
                }
            },

            fetchAssociations: async () => {
                const state = get();
                if (state.isLoading) return;

                const now = Date.now();
                const shouldFetch = !state.lastFetchTime || 
                                  (now - state.lastFetchTime > MAX_CACHE_TIME) || 
                                  (state.associations.length === 0 && state.lastFetchTime);

                if (shouldFetch) {
                    set({ isLoading: true });
                    try {
                        const associations = await assoService.getCurrentUserAssociation();
                        set({
                            associations,
                            lastFetchTime: now,
                            isLoading: false
                        });
                    } catch (error) {
                        set({ isLoading: false });
                        throw error;
                    }
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
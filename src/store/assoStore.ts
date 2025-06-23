import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assoService } from '../services/assoService';
import { useAuthStore } from './authStore';

interface Association {
    id: string;
    name: string;
    logo?: string;
    siret: string;
}

interface AssoState {
    associations: Association[];
    selectedAssociation: Association | null;
    sidebarCollapsed: boolean;
    isLoading: boolean;
    
    // Actions
    setAssociations: (associations: Association[]) => void;
    setSelectedAssociation: (association: Association | null) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    fetchUserAssociations: () => Promise<void>;
    clearAssociations: () => void;
}

export const useAssoStore = create<AssoState>()(
    persist(
        (set, get) => ({
            associations: [],
            selectedAssociation: null,
            sidebarCollapsed: false,
            isLoading: false,

            setAssociations: (associations) => set({ associations }),
            
            setSelectedAssociation: (association) => {
                // Vérifier l'état du localStorage AVANT changement
                const storageBefore = localStorage.getItem('asso-storage');
                
                // Mettre à jour l'état
                set({ selectedAssociation: association });
                
                // FORCER la sauvegarde manuelle dans localStorage
                const currentState = get();
                const dataToSave = {
                    state: {
                        associations: currentState.associations,
                        selectedAssociation: association,
                        sidebarCollapsed: currentState.sidebarCollapsed
                    },
                    version: 0
                };
                
                try {
                    localStorage.setItem('asso-storage', JSON.stringify(dataToSave));
                } catch (e) {
                    // Erreur sauvegarde forcée silencieuse
                }
                
                // Vérifier que le changement a bien eu lieu
                const newState = get();
                
                // Vérifier l'état du localStorage APRÈS changement (avec délai)
                setTimeout(() => {
                    const storageAfter = localStorage.getItem('asso-storage');
                    
                    // Parser et vérifier le contenu
                    try {
                        const parsed = JSON.parse(storageAfter || '{}');
                    } catch (e) {
                        // Erreur parsing localStorage silencieuse
                    }
                }, 100);
                
                // Émettre un événement personnalisé pour notifier le changement
                window.dispatchEvent(new CustomEvent('associationChanged', { 
                    detail: { association } 
                }));
            },
            
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            
            fetchUserAssociations: async () => {
                const state = get();
                if (state.isLoading) return;

                set({ isLoading: true });
                try {
                    const user = useAuthStore.getState().user;
                    if (!user || !user.sub) {
                        throw new Error('No user ID found in store');
                    }

                    // Vérifier les membreships de l'utilisateur
                    const memberships = await assoService.checkMembership(user.sub);
                    
                    if (!memberships || memberships.length === 0) {
                        set({ 
                            associations: [], 
                            selectedAssociation: null,
                            isLoading: false
                        });
                        return;
                    }

                    // Récupérer les détails de chaque association
                    const associationsPromises = memberships.map(async (id) => {
                        try {
                            const details = await assoService.getAssociation(id);
                            return details;
                        } catch (error) {
                            return null;
                        }
                    });

                    const associationsResults = await Promise.all(associationsPromises);
                    const validAssociations = associationsResults.filter((asso): asso is Association => 
                        asso !== null && asso.id && asso.name && asso.siret
                    );
                    
                    set({ 
                        associations: validAssociations,
                        isLoading: false
                    });
                    
                    // Sélectionner la première association si aucune n'est sélectionnée
                    if (validAssociations.length > 0 && !state.selectedAssociation) {
                        set({ selectedAssociation: validAssociations[0] });
                    }
                } catch (error) {
                    set({ 
                        associations: [], 
                        selectedAssociation: null,
                        isLoading: false
                    });
                }
            },

            clearAssociations: () => set({ 
                associations: [], 
                selectedAssociation: null,
                isLoading: false
            })
        }),
        {
            name: 'asso-storage',
            partialize: (state) => {
                return {
                    associations: state.associations,
                    selectedAssociation: state.selectedAssociation,
                    sidebarCollapsed: state.sidebarCollapsed
                };
            }
        }
    )
); 
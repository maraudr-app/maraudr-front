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
                console.log('🔄 Store: Changement d\'association demandé');
                console.log('   - Association actuelle:', get().selectedAssociation);
                console.log('   - Nouvelle association:', association);
                
                // Mettre à jour l'état
                set({ selectedAssociation: association });
                
                // Vérifier que le changement a bien eu lieu
                const newState = get();
                console.log('✅ Store: Association mise à jour vers:', newState.selectedAssociation);
                
                // Forcer un re-render en créant un nouvel objet si nécessaire
                if (association) {
                    const updatedAssociation = { ...association };
                    set({ selectedAssociation: updatedAssociation });
                }
                
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

                    console.log('Checking membership for user:', user.sub);
                    // Vérifier les membreships de l'utilisateur
                    const memberships = await assoService.checkMembership(user.sub);
                    console.log('Memberships received:', memberships);
                    
                    if (!memberships || memberships.length === 0) {
                        console.log('No memberships found');
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
                            console.error(`Error fetching association ${id}:`, error);
                            return null;
                        }
                    });

                    const associationsResults = await Promise.all(associationsPromises);
                    const validAssociations = associationsResults.filter((asso): asso is Association => 
                        asso !== null && asso.id && asso.name && asso.siret
                    );
                    
                    console.log('Valid associations:', validAssociations);
                    
                    set({ 
                        associations: validAssociations,
                        isLoading: false
                    });
                    
                    // Sélectionner la première association si aucune n'est sélectionnée
                    if (validAssociations.length > 0 && !state.selectedAssociation) {
                        console.log('Setting first association as selected:', validAssociations[0]);
                        set({ selectedAssociation: validAssociations[0] });
                    }
                } catch (error) {
                    console.error('Error fetching user associations:', error);
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
            partialize: (state) => ({
                associations: state.associations,
                selectedAssociation: state.selectedAssociation
            })
        }
    )
); 
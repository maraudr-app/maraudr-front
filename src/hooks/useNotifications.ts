import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssoStore } from '../store/assoStore';
import { userService } from '../services/userService';
import { assoService } from '../services/assoService';
import { teamService } from '../services/teamService';

export const useNotifications = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const user = useAuthStore(state => state.user);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    const calculateNotifications = async () => {
        // Seulement pour les managers
        if (!user || user.userType !== 'Manager' || !selectedAssociation?.id) {
            setNotificationCount(0);
            return;
        }

        try {
            setLoading(true);
            
            // 1. Récupérer tous les membres de l'équipe du manager
            const teamResponse = await teamService.getTeamMembers(user.sub);

            // L'API retourne directement un tableau, pas un objet avec propriété members
            const teamMembers = Array.isArray(teamResponse) ? teamResponse : (teamResponse.members || []);

            
            // 2. Compter les membres de l'équipe qui ne sont PAS dans l'association
            let pendingCount = 0;
            
            for (const teamMember of teamMembers) {
                try {
                    // Utiliser la même API que NotificationManager
                    const isMember = await assoService.isUserMemberOfAssociation(teamMember.id, selectedAssociation.id);

                    // Si le membre de l'équipe n'est PAS dans l'association, l'ajouter au compteur
                    if (!isMember) {
                        pendingCount++;
                    }
                } catch (error) {
                    // En cas d'erreur, on considère qu'il n'est pas membre (safe fallback)
                    pendingCount++;
                }
            }
            

            setNotificationCount(pendingCount);
            
        } catch (error) {

            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculateNotifications();
        
        // Écouter les événements de mise à jour des notifications
        const handleNotificationUpdate = () => {

            calculateNotifications();
        };

        // Ajouter l'écouteur d'événement
        window.addEventListener('notificationsUpdated', handleNotificationUpdate);

        // Nettoyer l'écouteur lors du démontage
        return () => {
            window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
        };
    }, [user, selectedAssociation]);

    return {
        notificationCount,
        loading,
        refreshNotifications: calculateNotifications
    };
}; 
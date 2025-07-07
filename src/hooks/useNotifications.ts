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
            console.log('🔍 Hook notifications - Requête teamService.getTeamMembers:', `http://localhost:8082/managers/team/${user.sub}`);
            console.log('📋 Hook notifications - Résultat complet de la requête:', teamResponse);
            // L'API retourne directement un tableau, pas un objet avec propriété members
            const teamMembers = Array.isArray(teamResponse) ? teamResponse : (teamResponse.members || []);
            console.log('👥 Hook notifications - Membres de l\'équipe récupérés:', teamMembers);
            
            // 2. Compter les membres de l'équipe qui ne sont PAS dans l'association
            let pendingCount = 0;
            
            for (const teamMember of teamMembers) {
                try {
                    // Utiliser la même API que NotificationManager
                    const isMember = await assoService.isUserMemberOfAssociation(teamMember.id, selectedAssociation.id);
                    console.log(`Hook notifications - Membre équipe ${teamMember.id} (${teamMember.firstname} ${teamMember.lastname}) - Est dans l'association: ${isMember}`);
                    
                    // Si le membre de l'équipe n'est PAS dans l'association, l'ajouter au compteur
                    if (!isMember) {
                        pendingCount++;
                    }
                } catch (error) {
                    console.error(`Hook notifications - Erreur lors de la vérification du membre ${teamMember.id}:`, error);
                    // En cas d'erreur, on considère qu'il n'est pas membre (safe fallback)
                    pendingCount++;
                }
            }
            
            console.log(`Hook notifications - Équipe: ${teamMembers.length}, En attente: ${pendingCount}`);
            setNotificationCount(pendingCount);
            
        } catch (error) {
            console.error('Hook notifications - Erreur lors du calcul des notifications:', error);
            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculateNotifications();
        
        // Écouter les événements de mise à jour des notifications
        const handleNotificationUpdate = () => {
            console.log('Hook notifications - Événement de mise à jour reçu');
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
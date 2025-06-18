import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssoStore } from '../store/assoStore';
import { userService } from '../services/userService';
import { assoService } from '../services/assoService';

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
            const teamMembers = await userService.getTeamUsers(user.sub);
            console.log('Hook notifications - Membres équipe:', teamMembers);
            
            // 2. Vérifier pour chaque membre s'il est déjà dans l'association avec la nouvelle API
            let pendingCount = 0;
            
            for (const member of teamMembers) {
                try {
                    // Utiliser la même API que NotificationManager
                    const isMember = await assoService.isUserMemberOfAssociation(member.id, selectedAssociation.id);
                    console.log(`Hook notifications - Membre ${member.id} (${member.firstname} ${member.lastname}) - Est membre: ${isMember}`);
                    
                    // Si pas membre, incrémenter le compteur
                    if (!isMember) {
                        pendingCount++;
                    }
                } catch (error) {
                    console.error(`Hook notifications - Erreur lors de la vérification du membre ${member.id}:`, error);
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
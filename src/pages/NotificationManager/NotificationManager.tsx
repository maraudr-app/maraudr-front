import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { userService } from '../../services/userService';
import { assoService } from '../../services/assoService';
import { teamService } from '../../services/teamService';
import { useNotifications } from '../../hooks/useNotifications';
import { 
    CheckIcon, 
    XMarkIcon, 
    ChatBubbleLeftRightIcon, 
    ArrowPathIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { User } from '../../types/user/user';
import { Language } from '../../types/enums/Language';
import ConfirmationModal from '../../components/common/modal/ConfirmationModal';
import UserDetailsModal from '../../components/team/UserDetailsModal';

const NotificationManager: React.FC = () => {
    const [pendingMembers, setPendingMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [memberToValidate, setMemberToValidate] = useState<{ id: string; name: string } | null>(null);
    const [selectedFilter, setSelectedFilter] = useState('Demandes d\'adhésion');
    const [selectedAudience, setSelectedAudience] = useState('Tous les membres');
    const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    
    const user = useAuthStore(state => state.user);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    const sidebarCollapsed = useAssoStore(state => state.sidebarCollapsed);
    const { refreshNotifications } = useNotifications();
    
    // Définir la largeur de la sidebar en pixels comme dans Stock
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Charger les membres en attente et les transformer en format message
    const loadPendingMembers = async () => {
        if (!user || user.userType !== 'Manager' || !selectedAssociation?.id) return;

        try {
            setLoading(true);
            
            // 1. Récupérer tous les membres de l'équipe du manager
            const teamResponse = await teamService.getTeamMembers(user.sub);
            console.log('🔍 Requête teamService.getTeamMembers:', `http://localhost:8082/managers/team/${user.sub}`);
            console.log('📋 Résultat complet de la requête:', teamResponse);
            // L'API retourne directement un tableau, pas un objet avec propriété members
            const teamMembers = Array.isArray(teamResponse) ? teamResponse : (teamResponse.members || []);
            console.log('👥 Membres de l\'équipe récupérés:', teamMembers);
            
            // 2. Vérifier pour chaque membre de l'équipe s'il est déjà dans l'association
            const pending: User[] = [];
            
            for (const teamMember of teamMembers) {
                try {
                    // Utiliser la nouvelle API pour vérifier l'adhésion
                    const isMember = await assoService.isUserMemberOfAssociation(teamMember.id, selectedAssociation.id);
                    console.log(`Membre équipe ${teamMember.id} (${teamMember.firstname} ${teamMember.lastname}) - Est dans l'association: ${isMember}`);
                    
                    // Si le membre de l'équipe n'est PAS dans l'association, l'ajouter à la liste d'attente
                    if (!isMember) {
                        // Convertir TeamMember en User pour la compatibilité
                        const userMember: User = {
                            id: teamMember.id,
                            firstname: teamMember.firstname,
                            lastname: teamMember.lastname,
                            email: teamMember.email,
                            phoneNumber: teamMember.phoneNumber,
                            street: teamMember.street,
                            city: teamMember.city,
                            state: teamMember.state,
                            postalCode: teamMember.postalCode,
                            country: teamMember.country,
                            languages: (teamMember.languages || []).filter((lang): lang is Language => Object.values(Language).includes(lang as Language)),
                            isManager: teamMember.isManager,
                            createdAt: teamMember.createdAt,
                            updatedAt: teamMember.updatedAt
                        };
                        pending.push(userMember);
                    }
                } catch (error) {
                    console.error(`Erreur lors de la vérification du membre ${teamMember.id}:`, error);
                    // En cas d'erreur, on considère qu'il n'est pas membre (safe fallback)
                    const userMember: User = {
                        id: teamMember.id,
                        firstname: teamMember.firstname,
                        lastname: teamMember.lastname,
                        email: teamMember.email,
                        phoneNumber: teamMember.phoneNumber,
                        street: teamMember.street,
                        city: teamMember.city,
                        state: teamMember.state,
                        postalCode: teamMember.postalCode,
                        country: teamMember.country,
                        languages: (teamMember.languages || []).filter((lang): lang is Language => Object.values(Language).includes(lang as Language)),
                        isManager: teamMember.isManager,
                        createdAt: teamMember.createdAt,
                        updatedAt: teamMember.updatedAt
                    };
                    pending.push(userMember);
                }
            }
            
            console.log('Membres en attente après vérification (membres équipe pas dans association):', pending);
            
            // Transformer en format message avec des informations réalistes pour l'affichage
            const realMessages = [
                "Bonjour ! J'aimerais rejoindre votre association pour participer aux maraudes. Je suis disponible les weekends.",
                "Salut, je souhaite devenir bénévole dans votre équipe. J'ai de l'expérience avec les sans-abri.",
                "Hello ! Je viens de m'inscrire et j'aimerais contribuer à vos actions solidaires. Quand puis-je commencer ?",
                "Bonsoir, je voudrais faire partie de votre association. J'ai du temps libre et envie d'aider.",
                "Coucou ! Un ami m'a parlé de votre association. Comment puis-je vous rejoindre pour les maraudes ?",
                "Bonjour, je suis intéressé(e) par vos actions. Pouvez-vous m'expliquer comment devenir membre ?",
                "Salut ! Je cherche une association pour faire du bénévolat. Votre mission me correspond parfaitement."
            ];
            
            const roles = [
                "Bénévole - Distribution alimentaire",
                "Volontaire - Aide sociale", 
                "Membre actif - Maraudes",
                "Bénévole - Écoute et soutien",
                "Volontaire - Logistique",
                "Bénévole - Premiers secours",
                "Membre - Actions terrain"
            ];
            
            setPendingMembers(pending);
            
        } catch (error) {
            console.error('Erreur lors du chargement des membres en attente:', error);
            toast.error('Erreur lors du chargement des messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPendingMembers();
    }, [user, selectedAssociation]);

    // Préparer la validation d'un membre
    const handleValidationRequest = (memberId: string, memberName: string) => {
        setMemberToValidate({ id: memberId, name: memberName });
        setShowConfirmModal(true);
    };

    // Valider l'adhésion d'un membre
    const validateMembership = async () => {
        if (!selectedAssociation?.id || !memberToValidate) return;

        try {
            setProcessing(memberToValidate.id);
            
            // Appeler l'API pour ajouter le membre à l'association
            const membershipData = {
                userId: memberToValidate.id,
                associationId: selectedAssociation.id
            };

            await assoService.addMemberToAssociation(membershipData);
            
            // Supprimer le membre de la liste locale immédiatement
            setPendingMembers(prev => prev.filter(member => member.id !== memberToValidate.id));
            
            toast.success(`${memberToValidate.name} a été ajouté(e) à l'association ! 🎉`);
            
            // Fermer le modal
            setShowConfirmModal(false);
            setMemberToValidate(null);
            
            // Recharger immédiatement pour être sûr que la liste est à jour
            console.log('Rechargement des données après validation...');
            await loadPendingMembers();
            await refreshNotifications();
            
            // Déclencher un événement pour notifier les autres composants (comme le header)
            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            console.log('Rechargement terminé et événement déclenché');
            
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            toast.error('Erreur lors de la validation de l\'adhésion');
        } finally {
            setProcessing(null);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Formater la date de création en format heure de message
    const formatMessageTime = (createdAt: string) => {
        const now = new Date();
        const messageDate = new Date(createdAt);
        
        // Calculer la différence en millisecondes
        const diffMs = now.getTime() - messageDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        // Si c'est aujourd'hui, afficher l'heure
        if (diffDays === 0) {
            return messageDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
        // Si c'est hier
        else if (diffDays === 1) {
            return 'Hier';
        }
        // Si c'est dans la semaine
        else if (diffDays < 7) {
            return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' });
        }
        // Si c'est plus ancien
        else {
            return messageDate.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        }
    };

    if (!user || user.userType !== 'Manager') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Accès réservé aux managers.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar fixe style Stock */}
            <nav className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300" style={{ left: sidebarWidth }}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 pl-7">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        <div className="text-gray-900 dark:text-white">
                            Messages ({pendingMembers.length})
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 px-4">
                        {/* Filtres avec couleurs orange/bleu */}
                        <div className="relative">
                            <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-orange-500 text-white text-sm rounded-md hover:from-blue-600 hover:to-orange-600 transition-colors">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                    {selectedFilter}
                                </span>
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="relative">
                            <button className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-sm rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                                <span>{selectedAudience}</span>
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <button
                            onClick={loadPendingMembers}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
            </nav>

            {/* Interface de messagerie */}
            <main className="pt-16 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 min-h-[calc(100vh-120px)]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">Chargement des messages...</p>
                        </div>
                    ) : pendingMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                Aucun message
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Tous les membres de votre équipe sont déjà dans l'association. Les nouveaux messages apparaîtront ici.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {pendingMembers.map((member) => (
                                <div 
                                    key={member.id} 
                                    className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedUserDetails(member);
                                        setShowUserDetailsModal(true);
                                    }}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                            {member.firstname?.charAt(0)}{member.lastname?.charAt(0)}
                                        </div>
                                    </div>
                                    
                                    {/* Contenu du message */}
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                    {member.firstname} {member.lastname}
                                                </h3>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    @{member.email?.split('@')[0]}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                            {/* Message fictif ou info complémentaire si besoin */}
                                        </p>
                                        
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                En attente d'adhésion
                                            </span>
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleValidationRequest(member.id, `${member.firstname} ${member.lastname}`);
                                                }}
                                                disabled={processing === member.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {processing === member.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                ) : (
                                                    <CheckIcon className="h-3 w-3 mr-1" />
                                                )}
                                                Accepter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de confirmation */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setMemberToValidate(null);
                }}
                onConfirm={validateMembership}
                title="Valider l'adhésion"
                message={memberToValidate ? `Êtes-vous sûr de vouloir valider l'adhésion de ${memberToValidate.name} à l'association ?` : ''}
                confirmText="Valider l'adhésion"
                cancelText="Annuler"
                type="success"
                loading={processing === memberToValidate?.id}
            />

            <UserDetailsModal
                member={selectedUserDetails}
                isOpen={showUserDetailsModal}
                onClose={() => setShowUserDetailsModal(false)}
            />
        </div>
    );
};

export default NotificationManager; 
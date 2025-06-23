import React, { useEffect, useState } from 'react';
import {
    UserGroupIcon,
    MapIcon,
    PlusIcon,
    CalendarIcon,
    XMarkIcon,
    ArrowPathIcon,
    ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { teamService, TeamMember } from '../../services/teamService';
import { assoService, AssociationMember } from '../../services/assoService';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { Disponibility } from '../../types/disponibility/disponibility';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { Button } from '../../components/common/button/button';
import TeamToast from '../../components/team/TeamToast';
import AddMemberModal from '../../components/team/AddMemberModal';
import { useNavigate } from 'react-router-dom';
import { OrgChart } from '../../components/team/OrgChart';

const Team: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        message: string;
        isVisible: boolean;
    }>({
        type: 'success',
        message: '',
        isVisible: false
    });
    const [userDisponibilities, setUserDisponibilities] = useState<Disponibility[]>([]);
    const [showDisponibilities, setShowDisponibilities] = useState(false);
    const [loadingDispos, setLoadingDispos] = useState(false);
    const [showOrgChart, setShowOrgChart] = useState(false);

    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { sidebarCollapsed, selectedAssociation } = useAssoStore();
    
    // Définir la largeur de la sidebar
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Vérifier l'authentification au démarrage
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    // Fonction pour convertir AssociationMember en TeamMember
    const convertToTeamMember = (member: AssociationMember): TeamMember => {
        return {
            id: member.id,
            firstname: member.firstname,
            lastname: member.lastname,
            email: member.email,
            phoneNumber: member.phoneNumber || '',
            street: member.street || '',
            city: member.city || '',
            state: member.state || '',
            postalCode: member.postalCode || '',
            country: member.country || '',
            languages: member.languages || [],
            isManager: member.isManager,
            managerId: null,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt
        };
    };

    const fetchTeamMembers = async () => {
        if (!selectedAssociation?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Utiliser l'API d'association pour récupérer les membres
            const associationMembers = await assoService.getAssociationMembers(selectedAssociation.id);
            
            // Convertir les AssociationMember en TeamMember pour la compatibilité
            const convertedMembers = associationMembers.map(convertToTeamMember);
            
            setTeamMembers(convertedMembers);
            
            console.log('Membres récupérés:', convertedMembers);
        } catch (err: any) {
            console.error('Erreur lors de la récupération des membres:', err);
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && selectedAssociation) {
            fetchTeamMembers();
        }
    }, [user, selectedAssociation]);

    // Écouter les changements d'association
    useEffect(() => {
        const handleAssociationChange = (event: CustomEvent) => {
            fetchTeamMembers();
        };

        window.addEventListener('associationChanged', handleAssociationChange as EventListener);
        return () => {
            window.removeEventListener('associationChanged', handleAssociationChange as EventListener);
        };
    }, []);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const handleMemberAdded = () => {
        fetchTeamMembers();
        showToast('success', 'Membre ajouté avec succès à l\'équipe');
    };

    const confirmRemoveMember = async (memberId: string) => {
        if (!user?.sub || !memberId) return;
        
        try {
            setDeleting(true);
            await teamService.removeTeamMember(user.sub, { userId: memberId });
            await fetchTeamMembers();
            showToast('success', 'Membre retiré de l\'équipe avec succès');
        } catch (err: any) {
            setError(err.message);
            showToast('error', err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleViewDisponibilities = async (memberId: string) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member) return;

        try {
            setLoadingDispos(true);
            setSelectedUser({
                id: member.id,
                firstname: member.firstname,
                lastname: member.lastname,
                email: member.email
            } as User);
            
            setUserDisponibilities([]);
            setShowDisponibilities(true);
        } catch (err) {
            // Erreur silencieuse
        } finally {
            setLoadingDispos(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // État de chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de l'équipe...</p>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Erreur lors du chargement des données</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <div className="space-x-4">
                        <Button 
                            onClick={() => fetchTeamMembers()}
                            className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            Réessayer
                        </Button>
                        <Button 
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            Se reconnecter
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Si aucune association sélectionnée
    if (!selectedAssociation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-4">Aucune association sélectionnée</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Veuillez sélectionner une association pour voir l'équipe.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar fixe */}
            <nav className="fixed top-16 right-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-orange-200/50 dark:border-gray-700 transition-all duration-300" style={{ left: sidebarWidth }}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 pl-7">
                        <UserGroupIcon className="w-5 h-5 text-orange-500" />
                        <div className="text-gray-900 dark:text-white font-medium">
                            Gestion de l'équipe ({teamMembers.length})
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            - {selectedAssociation.name}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 px-4">
                        <button
                            onClick={() => setShowOrgChart(!showOrgChart)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                showOrgChart 
                                    ? 'text-white bg-gradient-to-r from-orange-500 to-blue-500'
                                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            <ViewColumnsIcon className="w-4 h-4 mr-2" />
                            {showOrgChart ? 'Vue Liste' : 'Organigramme'}
                        </button>
                        
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Ajouter membre
                        </button>
                        
                        <button
                            onClick={fetchTeamMembers}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
            </nav>
            
            <main className="pt-16">
                {showOrgChart ? (
                    // Vue Organigramme
                    <OrgChart 
                        members={teamMembers} 
                        onViewDisponibilities={handleViewDisponibilities}
                        onRemoveMember={confirmRemoveMember}
                        associationName={selectedAssociation?.name}
                    />
                ) : (
                    // Vue Liste
                    <div className="p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                    Gestion de l'Équipe - {selectedAssociation.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Gérez votre équipe et consultez les disponibilités des membres
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                    Connecté en tant que: {user?.firstName} {user?.lastName} ({user?.userType})
                                </p>
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-200/50 dark:border-gray-700 p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg">
                                            <UserGroupIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Membres</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMembers.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-200/50 dark:border-gray-700 p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg">
                                            <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Managers</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {teamMembers.filter(m => m.isManager).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-200/50 dark:border-gray-700 p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg">
                                            <CalendarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membres Actifs</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {teamMembers.filter(m => !m.isManager).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liste simple des membres */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {member.firstname.charAt(0)}{member.lastname.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {member.firstname} {member.lastname}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {member.isManager ? '👔 Manager' : '👤 Membre'}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <button
                                                onClick={() => handleViewDisponibilities(member.id)}
                                                className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                            >
                                                📅 Voir disponibilités
                                            </button>
                                            {!member.isManager && (
                                                <button
                                                    onClick={() => confirmRemoveMember(member.id)}
                                                    disabled={deleting}
                                                    className="w-full text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                                >
                                                    🗑️ Retirer de l'équipe
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message si aucun membre */}
                            {teamMembers.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                        <UserGroupIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun membre d'équipe</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Commencez par ajouter des membres à votre équipe.
                                    </p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Ajouter le premier membre
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal des disponibilités */}
                {showDisponibilities && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-orange-200/50 dark:border-gray-700">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 flex items-center justify-center mr-4">
                                            <span className="text-white font-bold text-lg">
                                                {selectedUser.firstname.charAt(0)}{selectedUser.lastname.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Disponibilités de {selectedUser.firstname} {selectedUser.lastname}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDisponibilities(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Fonctionnalité en développement</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        La consultation des disponibilités sera bientôt disponible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {isAddModalOpen && (
                <AddMemberModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onMemberAdded={handleMemberAdded}
                />
            )}

            {toast.isVisible && (
                <TeamToast
                    type={toast.type}
                    message={toast.message}
                    onClose={hideToast}
                />
            )}
        </div>
    );
};

export default Team;
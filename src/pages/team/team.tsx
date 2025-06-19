import React, { useEffect, useState } from 'react';
import {
    UserGroupIcon,
    MapIcon,
    PlusIcon,
    TrashIcon,
    CalendarIcon,
    ClockIcon,
    XMarkIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    GlobeAltIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { teamService, TeamMember } from '../../services/teamService';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { Disponibility } from '../../types/disponibility/disponibility';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { Button } from '../../components/common/button/button';
import TeamToast from '../../components/team/TeamToast';
import AddMemberModal from '../../components/team/AddMemberModal';
import ConfirmDeleteModal from '../../components/team/ConfirmDeleteModal';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../components/team/UserCard';

const Team: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamUsers, setTeamUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
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

    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { sidebarCollapsed, selectedAssociation } = useAssoStore();
    
    // Définir la largeur de la sidebar en pixels comme dans Stock
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (!isAuthenticated || !user?.sub) {
            console.log('Utilisateur non authentifié, redirection vers login');
            navigate('/login');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    const fetchTeamMembers = async () => {
        if (!user?.sub) {
            setError('Utilisateur non connecté');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await teamService.getTeamMembers(user.sub);
            console.log('Team response:', response);
            setTeamMembers(response?.members || []);
        } catch (err: any) {
            console.error('Error fetching team:', err);
            setError(err.message);
            setTeamMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, [user?.sub]);

    const handleSelectMember = (id: string) => {
        setSelectedMember(id === selectedMember ? null : id);
    };

    const handleRemoveMember = (member: TeamMember) => {
        setMemberToDelete(member);
        confirmRemoveMember(member);
    };

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

    const confirmRemoveMember = async (member?: TeamMember) => {
        const memberToRemove = member || memberToDelete;
        if (!user?.sub || !memberToRemove) return;
        
        try {
            setDeleting(true);
            await teamService.removeTeamMember(user.sub, { userId: memberToRemove.id });
            await fetchTeamMembers();
            showToast('success', 'Membre retiré de l\'équipe avec succès');
        } catch (err: any) {
            setError(err.message);
            showToast('error', err.message);
        } finally {
            setDeleting(false);
        }
    };

    // Vérification sécurisée pour activeMember
    const activeMember = React.useMemo(() => {
        if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
            return null;
        }
        return teamMembers.find(member => member.id === selectedMember) || null;
    }, [teamMembers, selectedMember]);

    // Vérification sécurisée pour les statistiques
    const stats = React.useMemo(() => {
        if (!teamMembers || !Array.isArray(teamMembers)) {
            return { total: 0, managers: 0, members: 0 };
        }
        return {
            total: teamMembers.length,
            managers: teamMembers.filter(m => m.isManager).length,
            members: teamMembers.filter(m => !m.isManager).length
        };
    }, [teamMembers]);

    useEffect(() => {
        const fetchTeamUsers = async () => {
            if (!isAuthenticated || !user?.sub) {
                setError('Utilisateur non connecté');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('Récupération des utilisateurs pour le manager:', user.sub);
                const users = await userService.getTeamUsers(user.sub);
                console.log('Utilisateurs récupérés:', users);
                setTeamUsers(users);
            } catch (err: any) {
                console.error('Erreur lors du chargement des utilisateurs:', err);
                if (err.response?.status === 401) {
                    setError('Session expirée. Veuillez vous reconnecter.');
                    logout();
                    navigate('/login');
                } else {
                    setError(err.message || 'Erreur lors du chargement des utilisateurs');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTeamUsers();
    }, [user?.sub, isAuthenticated, logout, navigate]);

    const handleViewDisponibilities = async (user: User) => {
        if (!selectedAssociation?.id) {
            console.error('Aucune association sélectionnée');
            return;
        }

        try {
            setLoadingDispos(true);
            setSelectedUser(user);
            
            console.log('Récupération des disponibilités pour l\'utilisateur:', user.id, 'dans l\'association:', selectedAssociation.id);
            
            // Utiliser getAllDisponibilities pour récupérer toutes les disponibilités de l'association
            // puis filtrer par l'ID de l'utilisateur sélectionné
            const allDisponibilities = await userService.getAllDisponibilities(selectedAssociation.id);
            console.log('Toutes les disponibilités récupérées:', allDisponibilities);
            
            const userDispos = allDisponibilities.filter((d: Disponibility) => d.userId === user.id);
            console.log('Disponibilités filtrées pour l\'utilisateur:', userDispos);
            
            setUserDisponibilities(userDispos);
            setShowDisponibilities(true);
        } catch (err: any) {
            console.error('Erreur lors du chargement des disponibilités:', err);
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

    const formatLanguages = (languages: string[]) => {
        return languages.join(', ');
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    // Si pas authentifié, ne rien afficher (redirection en cours)
    if (!isAuthenticated || !user?.sub) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-red-600 dark:text-red-400 text-xl mb-4">{error}</div>
                <div className="space-x-4">
                    <Button 
                        onClick={() => window.location.reload()}
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
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar fixe style Stock */}
            <nav className="fixed top-16 right-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-orange-200/50 dark:border-gray-700 transition-all duration-300" style={{ left: sidebarWidth }}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 pl-7">
                        <UserGroupIcon className="w-5 h-5 text-orange-500" />
                        <div className="text-gray-900 dark:text-white font-medium">
                            Gestion de l'équipe ({teamUsers.length})
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 px-4">
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
            
            <main className="pt-16 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Gestion de l'Équipe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez votre équipe et consultez les disponibilités des membres
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Connecté en tant que: {user.firstName} {user.lastName} ({user.userType})
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
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamUsers.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-200/50 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg">
                                <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membres Actifs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {teamUsers.length}
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
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dernière Connexion</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {teamUsers.length > 0 ? formatDate(teamUsers[0].createdAt) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grille des cartes utilisateurs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {teamUsers.map(user => (
                        <UserCard key={user.id} user={user} handleViewDisponibilities={handleViewDisponibilities} />
                    ))}
                </div>

                {/* Message si aucun utilisateur */}
                {teamUsers.length === 0 && !loading && (
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
                                
                                {userDisponibilities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                            <CalendarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune disponibilité</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {selectedUser.firstname} n'a pas encore enregistré de disponibilités.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {userDisponibilities.map((dispo) => (
                                            <div key={dispo.id} className="border border-orange-200/50 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-r from-orange-50/50 to-blue-50/50 dark:from-orange-900/10 dark:to-blue-900/10 hover:from-orange-100/50 hover:to-blue-100/50 dark:hover:from-orange-900/20 dark:hover:to-blue-900/20 transition-all duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-3">
                                                            <div className="p-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg mr-3">
                                                                <CalendarIcon className="h-4 w-4 text-white" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Disponibilité
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2 ml-7">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="font-medium text-orange-600 dark:text-orange-400">Début:</span> {formatDate(dispo.start)}
                                                            </p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="font-medium text-blue-600 dark:text-blue-400">Fin:</span> {formatDate(dispo.end)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setShowDisponibilities(false)}
                                        className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </main>

            {/* Modals */}
            {isAddModalOpen && user?.sub && (
                <AddMemberModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onMemberAdded={handleMemberAdded}
                    managerId={user.sub}
                />
            )}

            {isDeleteModalOpen && memberToDelete && (
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => confirmRemoveMember()}
                    memberName={`${memberToDelete.firstname} ${memberToDelete.lastname}`}
                    loading={deleting}
                />
            )}

            {toast.isVisible && (
                <TeamToast
                    type={toast.type}
                    message={toast.message}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                />
            )}
        </div>
    );
};

export default Team;
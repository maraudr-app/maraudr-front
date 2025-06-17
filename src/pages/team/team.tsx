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
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { teamService, TeamMember } from '../../services/teamService';
import { userService, User, Disponibility } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
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
        try {
            setLoadingDispos(true);
            setSelectedUser(user);
            
            // Pour l'instant, on utilise un associationId fictif
            // Vous devrez récupérer l'associationId du manager connecté
            const associationId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // À remplacer par l'ID réel
            const disponibilities = await userService.getAllDisponibilities(associationId);
            const userDispos = disponibilities.filter(d => d.userId === user.id);
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-600 text-xl mb-4">{error}</div>
                <div className="space-x-4">
                    <Button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Réessayer
                    </Button>
                    <Button 
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                        Se reconnecter
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestion de l'Équipe
                    </h1>
                    <p className="text-gray-600">
                        Gérez votre équipe et consultez les disponibilités des membres
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Connecté en tant que: {user.firstName} {user.lastName} ({user.userType})
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <UserGroupIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Membres</p>
                                <p className="text-2xl font-bold text-gray-900">{teamUsers.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <MapIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Membres Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {teamUsers.filter(user => user.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <CalendarIcon className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Dernière Connexion</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {teamUsers.length > 0 ? formatDate(teamUsers[0].lastLoggedIn) : 'N/A'}
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
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre d'équipe</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Commencez par ajouter des membres à votre équipe.
                        </p>
                    </div>
                )}

                {/* Modal des disponibilités */}
                {showDisponibilities && selectedUser && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                                            <span className="text-white font-bold">
                                                {selectedUser.firstname.charAt(0)}{selectedUser.lastname.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Disponibilités de {selectedUser.firstname} {selectedUser.lastname}
                                            </h3>
                                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDisponibilities(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                
                                {userDisponibilities.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune disponibilité</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {selectedUser.firstname} n'a pas encore enregistré de disponibilités.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {userDisponibilities.map((dispo) => (
                                            <div key={dispo.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                Disponibilité
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Début:</span> {formatDate(dispo.start)}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Fin:</span> {formatDate(dispo.end)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-6 flex justify-end">
                                    <Button
                                        onClick={() => setShowDisponibilities(false)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200"
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
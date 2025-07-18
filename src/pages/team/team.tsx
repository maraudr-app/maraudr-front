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
import UserCard from '../../components/team/UserCard';
import { Language } from '../../types/enums/Language';
import { useTranslation } from 'react-i18next';

const Team: React.FC = () => {
    const { t } = useTranslation();
    
    // Fonction pour les traductions de l'équipe (même pattern que les autres composants)
    const t_team = (key: string): string => {
        return t(`team.${key}` as any);
    };

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
    const [showOrgChart, setShowOrgChart] = useState(true);

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
            

        } catch (err: any) {

            setError(err.message || t_team('error.loading'));
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
        showToast('success', t_team('toast.memberAddedToTeam'));
    };

    const confirmRemoveMember = async (member: TeamMember | User) => {
        if (!user?.sub || !member.id) return;
        
        try {
            setDeleting(true);
            await teamService.removeTeamMember(user.sub, { userId: member.id });
            await fetchTeamMembers();
            showToast('success', t_team('toast.memberRemovedFromTeam'));
        } catch (err: any) {
            setError(err.message);
            showToast('error', err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleViewDisponibilities = async (memberId: string) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member || !selectedAssociation?.id) return;

        try {
            setLoadingDispos(true);
            setSelectedUser({
                id: member.id,
                firstname: member.firstname,
                lastname: member.lastname,
                email: member.email
            } as User);
            
            // Récupérer toutes les disponibilités de l'association
            const allDisponibilities = await userService.getAllDisponibilities(selectedAssociation.id);
            
            // Filtrer les disponibilités de l'utilisateur sélectionné
            const memberDisponibilities = allDisponibilities.filter((dispo: Disponibility) => dispo.userId === memberId);
            

            
            setUserDisponibilities(memberDisponibilities);
            setShowDisponibilities(true);
        } catch (err: any) {

            showToast('error', t_team('toast.loadDisponibilitiesError'));
            setUserDisponibilities([]);
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
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t_team('loading')}</p>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">{t_team('error.loading')}</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <div className="space-x-4">
                    <Button 
                            onClick={() => fetchTeamMembers()}
                        className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        {t_team('error.retry')}
                    </Button>
                    <Button 
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        {t_team('error.reconnect')}
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
                    <div className="text-gray-500 text-lg mb-4">{t_team('noAssociation')}</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {t_team('noAssociationMessage')}
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
                            {t_team('title')} ({teamMembers.filter(m => !m.isManager).length})
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 px-4">
                        {user?.userType === 'Manager' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            {t_team('actions.addMember')}
                        </button>
                        )}
                        
                        <button
                            onClick={fetchTeamMembers}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t_team('actions.refresh')}
                        </button>
                    </div>
                </div>
            </nav>
            
            <main className="pt-24">
                {/* Statistiques en haut */}
                <div className="px-8 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-200/50 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg">
                                <UserGroupIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t_team('stats.totalMembers')}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMembers.filter(m => !m.isManager).length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-200/50 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg">
                                <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t_team('stats.managers')}</p>
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t_team('stats.activeMembers')}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {teamMembers.filter(m => !m.isManager).length}
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

           

                {/* Organigramme */}
                <OrgChart 
                    members={teamMembers} 
                    onViewDisponibilities={handleViewDisponibilities}
                    onRemoveMember={confirmRemoveMember}
                    associationName={selectedAssociation?.name}
                />

                {/* Modal des disponibilités */}
                {showDisponibilities && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-orange-200/50 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 flex items-center justify-center mr-4">
                                        <span className="text-white font-bold text-lg">
                                            {selectedUser.firstname.charAt(0)}{selectedUser.lastname.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {t_team('modal.disponibilities.title').replace('{name}', `${selectedUser.firstname} ${selectedUser.lastname}`)}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDisponibilities(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {loadingDispos ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t_team('loading')}
                                    </p>
                                </div>
                            ) : userDisponibilities.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {userDisponibilities.map((dispo, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Période {index + 1}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">{t_team('modal.disponibilities.start')}:</span> {new Date(dispo.start).toLocaleString('fr-FR')}
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">{t_team('modal.disponibilities.end')}:</span> {new Date(dispo.end).toLocaleString('fr-FR')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    {t_team('modal.disponibilities.duration')}: {Math.ceil((new Date(dispo.end).getTime() - new Date(dispo.start).getTime()) / (1000 * 60 * 60 * 24))} {t_team('modal.disponibilities.days')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t_team('modal.disponibilities.noDisponibilities')}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {t_team('modal.disponibilities.noDisponibilitiesMessage').replace('{name}', selectedUser?.firstname || '')}
                                    </p>
                                </div>
                            )}
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
                    managerId={user?.sub || ''}
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
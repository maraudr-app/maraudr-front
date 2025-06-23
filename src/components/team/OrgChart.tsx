import React, { useState } from 'react';
import { TeamMember } from '../../services/teamService';
import { useAuthStore } from '../../store/authStore';
import { ChatBubbleLeftEllipsisIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { ChatModal } from './ChatModal';

interface OrgChartProps {
    members: TeamMember[];
    onViewDisponibilities: (memberId: string) => void;
    associationName?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ members, onViewDisponibilities, associationName }) => {
    const { user } = useAuthStore();
    const [chatModal, setChatModal] = useState<{
        isOpen: boolean;
        type: 'private' | 'group';
        recipient?: TeamMember;
    }>({
        isOpen: false,
        type: 'private'
    });
    
    // Créer un objet pour le manager connecté s'il n'est pas dans la liste
    const currentManagerMember: TeamMember | undefined = user ? {
        id: user.sub || '',
        firstname: user.firstName || '',
        lastname: user.lastName || '',
        email: user.email || '',
        phoneNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        languages: [],
        isManager: true,
        managerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } : undefined;

    // Vérifier si le manager connecté est déjà dans la liste des membres
    const isCurrentManagerInList = members.some(m => m.id === user?.sub);
    
    // Séparer managers et membres réguliers
    let managers = members.filter(m => m.isManager);
    const regularMembers = members.filter(m => !m.isManager);
    
    // Si le manager connecté n'est pas dans la liste, l'ajouter
    if (!isCurrentManagerInList && currentManagerMember && user?.userType === 'Manager') {
        managers = [currentManagerMember, ...managers];
    }
    
    // Grouper les membres par date de création
    const membersByDate: { [key: string]: TeamMember[] } = {};
    regularMembers.forEach(member => {
        const date = new Date(member.createdAt).toDateString();
        if (!membersByDate[date]) {
            membersByDate[date] = [];
        }
        membersByDate[date].push(member);
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isCurrentUser = (memberId: string) => {
        return memberId === user?.sub;
    };

    const handleChatWithMember = (member: TeamMember) => {
        setChatModal({
            isOpen: true,
            type: 'private',
            recipient: member
        });
    };

    const handleGroupChat = () => {
        setChatModal({
            isOpen: true,
            type: 'group'
        });
    };

    const closeChatModal = () => {
        setChatModal({
            isOpen: false,
            type: 'private'
        });
    };

    return (
        <div className="space-y-8 p-6">
            {/* Bouton Chat de groupe */}
            <div className="text-center mb-6">
                <button
                    onClick={handleGroupChat}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg transition-all duration-200 font-medium"
                >
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    💬 Chat de groupe équipe
                </button>
            </div>

            {/* Section Direction - Managers */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    🏢 Direction
                </h3>
                <div className="flex justify-center space-x-6 flex-wrap">
                    {managers.map(manager => (
                        <div 
                            key={manager.id} 
                            className={`p-6 rounded-xl shadow-lg min-w-[240px] mb-4 relative ${
                                isCurrentUser(manager.id) 
                                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white ring-4 ring-yellow-300 dark:ring-yellow-500' 
                                    : 'bg-gradient-to-r from-orange-500 to-blue-500 text-white'
                            }`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl font-bold">
                                        {manager.firstname.charAt(0).toUpperCase()}{manager.lastname.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-lg">
                                    {manager.firstname} {manager.lastname}
                                    {isCurrentUser(manager.id) && <span className="ml-2">👑</span>}
                                </h4>
                                <p className="text-white/80 text-sm">
                                    👔 Manager {isCurrentUser(manager.id) && '(Vous)'}
                                </p>
                                <p className="text-white/60 text-xs mt-1">{manager.email}</p>
                                <div className="mt-3 space-y-2">
                                    <button
                                        onClick={() => onViewDisponibilities(manager.id)}
                                        className="block w-full px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs transition-colors"
                                    >
                                        📅 Voir disponibilités
                                    </button>
                                    {!isCurrentUser(manager.id) && (
                                        <button
                                            onClick={() => handleChatWithMember(manager)}
                                            className="block w-full px-3 py-1 bg-green-500/80 hover:bg-green-600/80 rounded-full text-xs transition-colors"
                                        >
                                            💬 Chat privé
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {managers.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                        Aucun manager assigné
                    </div>
                )}
            </div>

            {/* Flèches de connexion améliorées */}
            {managers.length > 0 && Object.keys(membersByDate).length > 0 && (
                <div className="flex justify-center items-center py-4">
                    <div className="flex flex-col items-center">
                        {/* Ligne verticale principale */}
                        <div className="w-1 h-16 bg-gradient-to-b from-orange-400 to-blue-400 rounded-full shadow-sm"></div>
                        
                        {/* Flèche vers le bas */}
                        <div className="relative">
                            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-blue-400"></div>
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
                        </div>
                        
                        {/* Lignes horizontales vers les groupes */}
                        {Object.keys(membersByDate).length > 1 && (
                            <div className="flex items-center mt-2">
                                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-400 rounded-full mx-2 shadow-sm"></div>
                                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section Équipe - Membres groupés par date d'arrivée */}
            <div className="space-y-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-6">
                    👥 Équipe
                </h3>
                
                {Object.keys(membersByDate).length > 0 ? (
                    Object.entries(membersByDate)
                        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                        .map(([date, dateMembers], groupIndex) => (
                        <div key={date} className="relative">
                            {/* Ligne de connexion depuis le groupe précédent */}
                            {groupIndex > 0 && (
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                                    <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-blue-300 dark:from-gray-600 dark:to-blue-500 rounded-full"></div>
                                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-blue-300 dark:border-t-blue-500"></div>
                                </div>
                            )}
                            
                            <div className="text-center">
                                <div className="mb-6">
                                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-orange-200 dark:border-gray-600">
                                        📅 Arrivés le {formatDate(date)} ({dateMembers.length} {dateMembers.length > 1 ? 'membres' : 'membre'})
                                    </span>
                                </div>
                                <div className="flex justify-center space-x-4 flex-wrap">
                                    {dateMembers.map(member => (
                                        <div key={member.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 p-5 rounded-lg shadow-sm min-w-[220px] mb-4 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200">
                                            <div className="text-center">
                                                <div className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="text-white font-bold text-lg">
                                                        {member.firstname.charAt(0).toUpperCase()}{member.lastname.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900 dark:text-white text-base">
                                                    {member.firstname} {member.lastname}
                                                </h4>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">👤 Membre</p>
                                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{member.email}</p>
                                                <div className="mt-3 space-y-2">
                                                    <button
                                                        onClick={() => onViewDisponibilities(member.id)}
                                                        className="block w-full text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                    >
                                                        📅 Voir disponibilités
                                                    </button>
                                                    <button
                                                        onClick={() => handleChatWithMember(member)}
                                                        className="block w-full text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium bg-green-50 dark:bg-green-900/20 py-1 rounded"
                                                    >
                                                        💬 Chat privé
                                                    </button>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        📞 {member.phoneNumber || 'Non renseigné'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        📍 {member.city ? `${member.city}, ${member.country}` : 'Localisation non renseignée'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Affichage spécial quand il n'y a pas de membres dans l'équipe
                    <div className="text-center py-12">
                        <div className="mb-8">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                Votre équipe est prête à grandir !
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base mb-6">
                                En tant que manager, vous pouvez commencer à constituer votre équipe.<br/>
                                Ajoutez des membres pour développer votre organisation.
                            </p>
                        </div>
                        
                        {/* Suggestions d'actions pour le manager */}
                        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-orange-200 dark:border-gray-600 max-w-md mx-auto">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                🚀 Prochaines étapes
                            </h4>
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center">
                                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                                    <span>Utilisez le bouton "Ajouter membre" pour inviter des collaborateurs</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                                    <span>Organisez les rôles et responsabilités de chacun</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                                    <span>Utilisez le chat pour communiquer efficacement</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                💡 Conseil : Une équipe bien organisée et qui communique est la clé du succès !
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de chat */}
            <ChatModal
                isOpen={chatModal.isOpen}
                onClose={closeChatModal}
                chatType={chatModal.type}
                recipient={chatModal.recipient}
                members={members}
                associationName={associationName}
            />
        </div>
    );
}; 
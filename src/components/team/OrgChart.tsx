import React, { useState } from 'react';
import { TeamMember } from '../../services/teamService';
import { useAuthStore } from '../../store/authStore';
import { EllipsisHorizontalIcon, TrashIcon, CalendarIcon, PhoneIcon, MapPinIcon, XMarkIcon, UserIcon, EnvelopeIcon, GlobeAltIcon, LanguageIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../common/modal/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { Language } from '../../types/enums/Language';

interface OrgChartProps {
    members: TeamMember[];
    onViewDisponibilities: (memberId: string) => void;
    onRemoveMember?: (memberId: string) => void;
    associationName?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ members, onViewDisponibilities, onRemoveMember, associationName }) => {
    const { user } = useAuthStore();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [selectedMemberDetails, setSelectedMemberDetails] = useState<TeamMember | null>(null);
    
    // Mapping pour les langues - gère les nombres, strings et énumérations
    const getLanguageLabel = (language: Language | string | number): string => {
        // Si c'est un nombre, on le convertit selon l'index
        if (typeof language === 'number') {
            const languagesByIndex: Record<number, string> = {
                0: 'Anglais',
                1: 'Français', 
                2: 'Espagnol',
                3: 'Allemand',
                4: 'Italien'
            };
            return languagesByIndex[language] || `Langue ${language}`;
        }
        
        // Si c'est une string ou énumération
        const languageMap: Record<string, string> = {
            'French': 'Français',
            'English': 'Anglais',
            'Spanish': 'Espagnol',
            'German': 'Allemand',
            'Italian': 'Italien'
        };
        return languageMap[language as string] || (language as string);
    };
    
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
        managerId: null, // Un manager n'a pas de managerId
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } : undefined;

    // Vérifier si le manager connecté est déjà dans la liste des membres
    const isCurrentManagerInList = members.some(m => m.id === user?.sub);
    
    // Ajouter le manager connecté s'il n'est pas dans la liste
    let allMembers = [...members];
    if (!isCurrentManagerInList && currentManagerMember && user?.userType === 'Manager') {
        allMembers = [currentManagerMember, ...members];
    }

    // Organiser les membres par hiérarchie et date de création
    const organizeMembers = () => {
        // Séparer managers et membres réguliers
        const managers = allMembers.filter(m => m.isManager);
        const regularMembers = allMembers.filter(m => !m.isManager);
        
        // Trier les managers par date de création (le plus ancien en premier)
        const sortedManagers = managers.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Grouper les membres réguliers par date d'intégration
        const membersByDate = regularMembers.reduce((acc, member) => {
            const date = new Date(member.createdAt).toDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(member);
            return acc;
        }, {} as Record<string, TeamMember[]>);
        
        // Trier les dates et créer les lignes avec max 4 utilisateurs par ligne
        const sortedDates = Object.keys(membersByDate).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );
        
        const memberRows: { members: TeamMember[], date: string }[] = [];
        sortedDates.forEach(date => {
            const membersForDate = membersByDate[date];
            // Diviser en groupes de 4 maximum
            for (let i = 0; i < membersForDate.length; i += 4) {
                const chunk = membersForDate.slice(i, i + 4);
                memberRows.push({ members: chunk, date });
            }
        });
        
        return {
            topManager: sortedManagers[0] || null,
            otherManagers: sortedManagers.slice(1),
            memberRows
        };
    };

    const { topManager, otherManagers, memberRows } = organizeMembers();

    const isCurrentUser = (memberId: string) => {
        return memberId === user?.sub;
    };

    // Vérifier si l'utilisateur connecté est manager
    const isCurrentUserManager = () => {
        return user?.userType === 'Manager';
    };

    const toggleMenu = (memberId: string) => {
        setOpenMenuId(openMenuId === memberId ? null : memberId);
    };

    const handleRemoveMember = (member: TeamMember) => {
        setMemberToDelete({ 
            id: member.id, 
            name: `${member.firstname} ${member.lastname}` 
        });
        setShowConfirmModal(true);
        setOpenMenuId(null);
    };

    const confirmRemoveMember = async () => {
        if (!memberToDelete || !onRemoveMember) return;
        
        try {
            await onRemoveMember(memberToDelete.id);
            toast.success(`${memberToDelete.name} a été retiré de l'équipe avec succès`);
        } catch (error) {
            toast.error('Erreur lors de la suppression du membre');
        } finally {
            setShowConfirmModal(false);
            setMemberToDelete(null);
        }
    };

    const handleViewDisponibilities = (member: TeamMember) => {
        onViewDisponibilities(member.id);
        setOpenMenuId(null);
    };

    const handleShowUserDetails = (member: TeamMember) => {
        setSelectedMemberDetails(member);
        setShowUserDetailsModal(true);
        setOpenMenuId(null);
    };

    // Fonction pour générer une URL d'image de profil basée sur le nom
    const getProfileImageUrl = (member: TeamMember, isTopLevel: boolean = false) => {
        // Utiliser l'API randomuser.me avec un seed basé sur le nom pour avoir une image consistante
        const seed = `${member.firstname}${member.lastname}`.toLowerCase().replace(/\s/g, '');
        const hash = Math.abs(hashCode(seed));
        const gender = hash % 2 === 0 ? 'men' : 'women';
        const imageNumber = hash % 100;
        return `https://randomuser.me/api/portraits/${gender}/${imageNumber}.jpg`;
    };

    // Fonction de hachage simple pour générer un nombre consistant
    const hashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en 32bit integer
        }
        return hash;
    };

    // Composant pour une carte de membre rectangulaire avec photo sur la bordure
    const MemberCard: React.FC<{ member: TeamMember; isTopLevel?: boolean }> = ({ member, isTopLevel = false }) => {
        const profileImageUrl = getProfileImageUrl(member, isTopLevel);
        const photoSize = isTopLevel ? 'w-20 h-20' : 'w-16 h-16';
        const isCurrentUserCard = isCurrentUser(member.id);
        
        return (
            <div className="relative">
                {/* Photo de profil positionnée sur la bordure supérieure */}
                <div className={`absolute left-6 z-10 ${isTopLevel ? '-top-10' : '-top-8'}`}>
                    <div className={`${photoSize} rounded-full border-4 ${
                        isCurrentUserCard 
                            ? 'border-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/50' 
                            : 'border-white dark:border-gray-800'
                    } shadow-lg overflow-hidden bg-gray-200 ${
                        isCurrentUserManager() ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                    } transition-transform z-30`}
                    onClick={isCurrentUserManager() ? () => {
                        handleShowUserDetails(member);
                    } : undefined}
                    title={isCurrentUserManager() ? "Voir les détails" : ""}
                    >
                        <img 
                            src={profileImageUrl}
                            alt={`${member.firstname} ${member.lastname}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback en cas d'erreur de chargement de l'image
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        {/* Fallback avec initiales */}
                        <div className={`hidden w-full h-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center`}>
                            <span className={`text-white font-bold ${isTopLevel ? 'text-xl' : 'text-lg'}`}>
                                {member.firstname.charAt(0).toUpperCase()}{member.lastname.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    {/* Rôle sous la photo */}
                    <div className={`absolute left-1/2 transform -translate-x-1/2 ${isTopLevel ? 'top-20' : 'top-16'} z-20 pointer-events-none`}>
                        <span className={`${isTopLevel ? 'text-xs' : 'text-xs'} font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 whitespace-nowrap`}>
                            {member.isManager ? 'Manager' : 'Membre'}
                        </span>
                    </div>
                    
                    {/* Icône calendrier disponibilité - visible seulement pour les managers */}
                    {isCurrentUserManager() && (
                        <div className={`absolute left-1/2 transform -translate-x-1/2 ${isTopLevel ? 'top-28' : 'top-24'} z-40`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDisponibilities(member);
                                }}
                                className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors group bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
                                title="Voir disponibilités"
                            >
                                <CalendarIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </button>
                        </div>
                    )}
                </div>

                <div className={`bg-white dark:bg-gray-800 border-2 ${
                    isCurrentUserCard 
                        ? 'border-orange-500 shadow-lg shadow-orange-100 dark:shadow-orange-900/30' 
                        : 'border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md'
                } transition-all ${
                    isTopLevel ? 'w-80 h-36' : 'w-72 h-32'
                } flex items-start rounded-lg py-6 ${isTopLevel ? 'pl-32 pr-6' : 'pl-28 pr-6'} overflow-hidden`}>
                    


                    {/* Menu trois points - visible seulement pour les managers */}
                    {isCurrentUserManager() && (
                        <div className="absolute top-3 right-3">
                            <button
                                onClick={() => toggleMenu(member.id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            
                            {/* Menu déroulant */}
                            {openMenuId === member.id && (
                                <div className="absolute right-0 top-9 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[170px]">
                                    <button
                                        onClick={() => handleViewDisponibilities(member)}
                                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        Voir disponibilité
                                    </button>
                                    {!member.isManager && !isCurrentUser(member.id) && onRemoveMember && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-2" />
                                                Supprimer l'utilisateur
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Informations */}
                    <div className="flex-1 h-full flex flex-col justify-start pt-2 space-y-1 min-w-0">
                        {/* Nom et prénom en ligne */}
                        <div className="flex items-center min-w-0">
                            <div className={`font-bold text-gray-900 dark:text-white ${isTopLevel ? 'text-base' : 'text-sm'} leading-tight truncate`}>
                                {member.firstname} {member.lastname}
                            </div>
                            {isCurrentUserCard && (
                                <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">Vous</span>
                            )}
                        </div>
                        
                        {/* Téléphone en ligne avec icône */}
                        <div className="flex items-center space-x-1.5 min-w-0">
                            <PhoneIcon className={`${isTopLevel ? 'w-3 h-3' : 'w-3 h-3'} text-gray-500 dark:text-gray-400 flex-shrink-0`} />
                            <span className={`text-gray-900 dark:text-white ${isTopLevel ? 'text-xs' : 'text-xs'} font-medium truncate`}>
                                {member.phoneNumber || 'Non renseigné'}
                            </span>
                        </div>
                        
                        {/* Ville en ligne avec icône */}
                        <div className="flex items-center space-x-1.5 min-w-0">
                            <MapPinIcon className={`${isTopLevel ? 'w-3 h-3' : 'w-3 h-3'} text-gray-500 dark:text-gray-400 flex-shrink-0`} />
                            <span className={`text-gray-900 dark:text-white ${isTopLevel ? 'text-xs' : 'text-xs'} font-medium truncate`}>
                                {member.city || 'Non renseigné'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          

            {/* Organigramme avec lignes de connexion */}
            <div className="max-w-none mx-auto overflow-x-auto">
                <div className="min-w-max flex flex-col items-center">
                    {/* Manager principal en haut */}
                    {topManager && (
                        <div className="flex flex-col items-center mb-8">
                            <div className="mt-10">
                                <MemberCard member={topManager} isTopLevel={true} />
                            </div>
                        </div>
                    )}

                    {/* Autres managers s'il y en a - max 4 par ligne */}
                    {otherManagers.length > 0 && (
                        <div className="flex flex-col items-center mb-8">
                            {/* Diviser les autres managers en lignes de 4 maximum */}
                            {Array.from({ length: Math.ceil(otherManagers.length / 4) }, (_, lineIndex) => {
                                const managersInLine = otherManagers.slice(lineIndex * 4, (lineIndex + 1) * 4);
                                return (
                                    <div key={lineIndex} className="flex flex-col items-center mb-6">
                                        {/* Cartes des managers de cette ligne */}
                                        <div className="flex justify-center items-start gap-6">
                                            {managersInLine.map((manager) => (
                                                <div key={manager.id} className="flex flex-col items-center">
                                                    <MemberCard member={manager} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}


                        </div>
                    )}

                    {/* Membres réguliers groupés par date d'intégration - max 4 par ligne */}
                    {memberRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-col items-center mb-8">
                            {/* Cartes des membres de cette ligne */}
                            <div className="flex justify-center items-start gap-6 mb-4">
                                {row.members.map((member) => (
                                    <div key={member.id} className="flex flex-col items-center">
                                        <MemberCard member={member} />
                                    </div>
                                ))}
                            </div>

                            {/* Date d'intégration pour cette ligne - visible seulement pour les managers */}
                            {isCurrentUserManager() && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Intégration le {new Date(row.date).toLocaleDateString('fr-FR')}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Message si aucun membre */}
                    {!topManager && otherManagers.length === 0 && memberRows.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-4xl">👥</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Aucun membre dans l'organisation
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Commencez par ajouter des membres à votre équipe pour voir l'organigramme.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay pour fermer les menus */}
            {openMenuId && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setOpenMenuId(null)}
                />
            )}

            {/* Modal de confirmation de suppression */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setMemberToDelete(null);
                }}
                onConfirm={confirmRemoveMember}
                title="Retirer le membre"
                message={memberToDelete ? `Êtes-vous sûr de vouloir retirer ${memberToDelete.name} de l'équipe ? Cette action ne peut pas être annulée.` : ''}
                confirmText="Retirer"
                cancelText="Annuler"
                type="danger"
            />

            {/* Modal de détails utilisateur - visible seulement pour les managers */}
            {showUserDetailsModal && selectedMemberDetails && isCurrentUserManager() && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-orange-200/50 dark:border-gray-700 mb-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full border-4 border-orange-500 shadow-lg overflow-hidden bg-gray-200 mr-4">
                                    <img 
                                        src={getProfileImageUrl(selectedMemberDetails)}
                                        alt={`${selectedMemberDetails.firstname} ${selectedMemberDetails.lastname}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                            {selectedMemberDetails.firstname.charAt(0).toUpperCase()}{selectedMemberDetails.lastname.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedMemberDetails.firstname} {selectedMemberDetails.lastname}
                                    </h2>
                                    <div className="flex items-center mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedMemberDetails.isManager 
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        }`}>
                                            {selectedMemberDetails.isManager ? 'Manager' : 'Membre'}
                                        </span>
                                        {isCurrentUser(selectedMemberDetails.id) && (
                                            <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Vous</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUserDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Informations personnelles */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2 text-orange-500" />
                                    Informations personnelles
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedMemberDetails.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <PhoneIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Téléphone</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedMemberDetails.phoneNumber || 'Non renseigné'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Adresse</p>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {selectedMemberDetails.street && <p>{selectedMemberDetails.street}</p>}
                                                <p>
                                                    {[selectedMemberDetails.city, selectedMemberDetails.state, selectedMemberDetails.postalCode].filter(Boolean).join(', ')}
                                                </p>
                                                {selectedMemberDetails.country && <p>{selectedMemberDetails.country}</p>}
                                                {!selectedMemberDetails.street && !selectedMemberDetails.city && !selectedMemberDetails.country && (
                                                    <p>Non renseigné</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations additionnelles */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <GlobeAltIcon className="w-5 h-5 mr-2 text-orange-500" />
                                    Informations additionnelles
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <LanguageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Langues</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedMemberDetails.languages && selectedMemberDetails.languages.length > 0 ? (
                                                    selectedMemberDetails.languages.map((lang, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                                            {getLanguageLabel(lang)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Non renseigné</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Membre depuis</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(selectedMemberDetails.createdAt).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière mise à jour</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(selectedMemberDetails.updatedAt).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        handleViewDisponibilities(selectedMemberDetails);
                                        setShowUserDetailsModal(false);
                                    }}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Voir disponibilités
                                </button>
                                
                                {!selectedMemberDetails.isManager && !isCurrentUser(selectedMemberDetails.id) && onRemoveMember && (
                                    <button
                                        onClick={() => {
                                            handleRemoveMember(selectedMemberDetails);
                                            setShowUserDetailsModal(false);
                                        }}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Retirer de l'équipe
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
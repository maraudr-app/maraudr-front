import React, { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { useTranslation } from 'react-i18next';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMemberAdded: () => void;
    managerId: string;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    onMemberAdded,
    managerId
}) => {
    const { t } = useTranslation();
    
    // Fonction pour les traductions de l'équipe (même pattern que les autres composants)
    const t_team = (key: string): string => {
        return t(`team.${key}` as any);
    };

    const { user } = useAuthStore();
    const { selectedAssociation } = useAssoStore();
    const [activeTab, setActiveTab] = useState<'invite'>('invite');
    
    // États pour l'invitation par email
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    

    
    // États généraux
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setInviteEmail('');
            setInviteMessage('');
            setError(null);
            setSuccess(null);
            setActiveTab('invite');
        }
    }, [isOpen]);

    const handleInviteByEmail = async () => {
        // Validation de l'email
        if (!inviteEmail.trim()) {
            setError(t_team('modal.addMemberModal.invite.emailError'));
            return;
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            setError(t_team('modal.addMemberModal.invite.emailFormatError'));
            return;
        }

        // Vérifier qu'une association est sélectionnée
        if (!selectedAssociation?.id) {
            setError(t_team('modal.addMemberModal.invite.associationError'));
            return;
        }

        try {
            setInviteLoading(true);
            setError(null);
            setSuccess(null);
            
            // Appel API pour envoyer l'invitation
            const message = inviteMessage.trim() || 
                `${t_team('modal.addMemberModal.invite.defaultMessage')} ${selectedAssociation.name}`;
            
            await authService.sendInvitation(
                inviteEmail.trim().toLowerCase(),
                selectedAssociation.id,
                message
            );
            
            setSuccess(t_team('modal.addMemberModal.invite.success'));
            setTimeout(() => {
                onMemberAdded();
                onClose();
            }, 2000);
        } catch (err: any) {

            
            // Gestion d'erreurs détaillée
            if (err.response) {
                const status = err.response.status;
                switch (status) {
                    case 400:
                        setError(t_team('modal.addMemberModal.invite.invalidDataError'));
                        break;
                    case 401:
                        setError(t_team('modal.addMemberModal.invite.unauthorizedError'));
                        break;
                    case 403:
                        setError(t_team('modal.addMemberModal.invite.forbiddenError'));
                        break;
                    case 409:
                        setError(t_team('modal.addMemberModal.invite.userExistsError'));
                        break;
                    case 500:
                        setError(t_team('modal.addMemberModal.invite.serverError'));
                        break;
                    default:
                        setError(err.response.data?.message || t_team('modal.addMemberModal.invite.error'));
                }
            } else if (err.request) {
                setError(t_team('modal.addMemberModal.invite.connectionError'));
            } else {
                setError(err.message || t_team('modal.addMemberModal.invite.error'));
            }
        } finally {
            setInviteLoading(false);
        }
    };



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t_team('modal.addMemberModal.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Onglets */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('invite')}
                        className="flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center space-x-2 text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{t_team('modal.addMemberModal.invite.tabTitle')}</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {/* Messages d'erreur/succès */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-md">
                            {success}
                        </div>
                    )}

                    {/* Contenu de l'onglet Invitation */}
                    {activeTab === 'invite' && (
                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    placeholder={t_team('modal.addMemberModal.invite.emailPlaceholder')}
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full"
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {t_team('modal.addMemberModal.invite.emailDescription')}
                                </p>
                            </div>

                            <div>
                                <textarea
                                    placeholder={t_team('modal.addMemberModal.invite.messagePlaceholder')}
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 resize-none"
                                />
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {t_team('modal.addMemberModal.invite.messageDescription')}
                                </p>
                            </div>

                            <Button
                                onClick={handleInviteByEmail}
                                isLoading={inviteLoading}
                                disabled={!inviteEmail.trim() || inviteLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {t_team('modal.addMemberModal.invite.sendInvitationButton')}
                            </Button>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default AddMemberModal; 
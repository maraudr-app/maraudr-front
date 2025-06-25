import React, { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { useAuthStore } from '../../store/authStore';

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
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'invite' | 'create'>('invite');
    
    // États pour l'invitation par email
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    
    // États pour la création directe
    const [createForm, setCreateForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',

    });
    const [createLoading, setCreateLoading] = useState(false);
    
    // États généraux
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setInviteEmail('');
            setCreateForm({
                firstname: '',
                lastname: '',
                email: '',
                phoneNumber: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            });
            setError(null);
            setSuccess(null);
            setActiveTab('invite');
        }
    }, [isOpen]);

    const handleInviteByEmail = async () => {
        // Validation de l'email
        if (!inviteEmail.trim()) {
            setError('Veuillez saisir une adresse email');
            return;
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            setError('Veuillez saisir une adresse email valide');
            return;
        }

        try {
            setInviteLoading(true);
            setError(null);
            setSuccess(null);
            
            // Appel API pour envoyer l'invitation
            // await invitationService.sendInvitation(inviteEmail, managerId);
            // TODO: Implémenter l'API d'invitation
            
            setSuccess('Invitation envoyée avec succès !');
            setTimeout(() => {
                onMemberAdded();
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Erreur lors de l\'envoi de l\'invitation:', err);
            
            // Gestion d'erreurs détaillée
            if (err.response) {
                const status = err.response.status;
                switch (status) {
                    case 400:
                        setError('Données invalides. Vérifiez l\'adresse email.');
                        break;
                    case 401:
                        setError('Vous n\'êtes pas autorisé à envoyer des invitations.');
                        break;
                    case 403:
                        setError('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
                        break;
                    case 409:
                        setError('Un utilisateur avec cette adresse email existe déjà.');
                        break;
                    case 500:
                        setError('Erreur du serveur. Veuillez réessayer plus tard.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Erreur lors de l\'envoi de l\'invitation');
                }
            } else if (err.request) {
                setError('Problème de connexion. Vérifiez votre connexion internet.');
            } else {
                setError(err.message || 'Erreur lors de l\'envoi de l\'invitation');
            }
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCreateUser = async () => {
        // Validation des champs obligatoires
        if (!createForm.firstname.trim() || !createForm.lastname.trim() || !createForm.email.trim()) {
            setError('Veuillez remplir tous les champs obligatoires (prénom, nom, email)');
            return;
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(createForm.email)) {
            setError('Veuillez saisir une adresse email valide');
            return;
        }

        // Validation des noms (pas uniquement des espaces)
        if (createForm.firstname.trim().length < 2) {
            setError('Le prénom doit contenir au moins 2 caractères');
            return;
        }
        
        if (createForm.lastname.trim().length < 2) {
            setError('Le nom doit contenir au moins 2 caractères');
            return;
        }

        // Vérifier que l'utilisateur connecté est un manager
        if (user?.userType !== 'Manager') {
            setError('Seuls les managers peuvent créer des utilisateurs');
            return;
        }

        try {
            setCreateLoading(true);
            setError(null);
            setSuccess(null);
            
            // Préparer les données pour l'API
            const userData = {
                firstname: createForm.firstname.trim(),
                lastname: createForm.lastname.trim(),
                email: createForm.email.trim().toLowerCase(),
                phoneNumber: createForm.phoneNumber.trim(),
                street: createForm.street.trim(),
                city: createForm.city.trim(),
                state: createForm.state.trim(),
                postalCode: createForm.postalCode.trim(),
                country: createForm.country.trim(),
                password: "", // Le backend va gérer le mot de passe automatiquement
                languages: [], // Tableau vide par défaut
                managerId: user.sub, // Utiliser l'ID du manager connecté
                isManager: false // Toujours false car créé par un manager
            };
            
            // Appel API pour créer l'utilisateur
            await userService.createUser(userData);
            
            setSuccess('Utilisateur créé avec succès !');
            setTimeout(() => {
            onMemberAdded();
            onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Erreur lors de la création de l\'utilisateur:', err);
            
            // Gestion d'erreurs détaillée
            if (err.response) {
                const status = err.response.status;
                switch (status) {
                    case 400:
                        setError('Données invalides. Vérifiez les informations saisies.');
                        break;
                    case 401:
                        setError('Vous n\'êtes pas autorisé à créer des utilisateurs.');
                        break;
                    case 403:
                        setError('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
                        break;
                    case 409:
                        setError('Un utilisateur avec cette adresse email existe déjà.');
                        break;
                    case 422:
                        setError('Données non valides. Vérifiez le format des informations.');
                        break;
                    case 500:
                        setError('Erreur du serveur. Veuillez réessayer plus tard.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Erreur lors de la création de l\'utilisateur');
                }
            } else if (err.request) {
                setError('Problème de connexion. Vérifiez votre connexion internet.');
            } else {
                setError(err.message || 'Erreur lors de la création de l\'utilisateur');
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCreateFormChange = (field: string, value: string) => {
        setCreateForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Ajouter un membre à l'équipe
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
                        className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                            activeTab === 'invite'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Inviter par email</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                            activeTab === 'create'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                        disabled={user?.userType !== 'Manager'}
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Créer utilisateur</span>
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
                                    placeholder="Adresse email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full"
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Un email d'invitation sera envoyé à cette adresse
                                </p>
                            </div>

                            <Button
                                onClick={handleInviteByEmail}
                                isLoading={inviteLoading}
                                disabled={!inviteEmail.trim() || inviteLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Envoyer l'invitation
                            </Button>
                        </div>
                    )}

                    {/* Contenu de l'onglet Création */}
                    {activeTab === 'create' && (
                        <div className="space-y-4">
                            {user?.userType !== 'Manager' ? (
                                <div className="text-center py-8">
                                    <UserPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Seuls les managers peuvent créer des utilisateurs directement
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Ligne 1: Prénom et Nom (2 colonnes larges) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Prénom *"
                                                value={createForm.firstname}
                                                onChange={(e) => handleCreateFormChange('firstname', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Nom *"
                                                value={createForm.lastname}
                                                onChange={(e) => handleCreateFormChange('lastname', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Ligne 2: Email seul (1 colonne, pleine largeur) */}
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder="Adresse email *"
                                            value={createForm.email}
                                            onChange={(e) => handleCreateFormChange('email', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Ligne 3: Téléphone et Rue (2 colonnes) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Input
                                                type="tel"
                                                placeholder="Numéro de téléphone"
                                                value={createForm.phoneNumber}
                                                onChange={(e) => handleCreateFormChange('phoneNumber', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Adresse (rue)"
                                                value={createForm.street}
                                                onChange={(e) => handleCreateFormChange('street', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Ligne 4: Ville, État/Région, Code postal, Pays (4 colonnes) */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Ville"
                                                value={createForm.city}
                                                onChange={(e) => handleCreateFormChange('city', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="État/Région"
                                                value={createForm.state}
                                                onChange={(e) => handleCreateFormChange('state', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Code postal"
                                                value={createForm.postalCode}
                                                onChange={(e) => handleCreateFormChange('postalCode', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="text"
                                                placeholder="Pays"
                                                value={createForm.country}
                                                onChange={(e) => handleCreateFormChange('country', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>





                                    {/* Bouton de création */}
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleCreateUser}
                                            isLoading={createLoading}
                                            disabled={createLoading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                                        >
                                            Créer l'utilisateur
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal; 
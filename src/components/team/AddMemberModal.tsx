import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { teamService } from '../../services/teamService';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        const filtered = users.filter(user => 
            user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId: string) => {
        try {
            setAddingUserId(userId);
            await teamService.addTeamMember(managerId, { userId });
            onMemberAdded();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAddingUserId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
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

                <div className="p-6">
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            rightIcon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                            className="w-full"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Chargement des utilisateurs...</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Aucun utilisateur trouvé
                                </p>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {user.firstname} {user.lastname}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.city}, {user.country}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleAddMember(user.id)}
                                            disabled={addingUserId === user.id}
                                            isLoading={addingUserId === user.id}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600"
                                        >
                                            Ajouter
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal; 
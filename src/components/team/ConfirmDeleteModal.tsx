import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    memberName: string;
    loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    memberName,
    loading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Confirmer la suppression
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
                        <p className="text-gray-900 dark:text-white">
                            Êtes-vous sûr de vouloir retirer <strong>{memberName}</strong> de votre équipe ?
                        </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Cette action ne peut pas être annulée. Le membre ne sera plus visible dans votre équipe.
                    </p>

                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            disabled={loading}
                            isLoading={loading}
                            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                        >
                            Confirmer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal; 
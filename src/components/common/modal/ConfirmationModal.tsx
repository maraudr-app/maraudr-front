import React from 'react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'success' | 'danger';
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning',
    loading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckIcon className="h-6 w-6 text-green-600" />;
            case 'danger':
                return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
            default:
                return <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            default:
                return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-6 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        {getIcon()}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-3">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        disabled={loading}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Message */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${getConfirmButtonClass()}`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Validation...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 
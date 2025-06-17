import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TeamToastProps {
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const TeamToast: React.FC<TeamToastProps> = ({
    type,
    message,
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const bgColor = type === 'success' 
        ? 'bg-green-50 dark:bg-green-900' 
        : 'bg-red-50 dark:bg-red-900';
    
    const textColor = type === 'success' 
        ? 'text-green-800 dark:text-green-200' 
        : 'text-red-800 dark:text-red-200';
    
    const borderColor = type === 'success' 
        ? 'border-green-200 dark:border-green-700' 
        : 'border-red-200 dark:border-red-700';
    
    const icon = type === 'success' 
        ? <CheckCircleIcon className="w-5 h-5 text-green-400" />
        : <XCircleIcon className="w-5 h-5 text-red-400" />;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border ${borderColor} rounded-lg shadow-lg`}>
            <div className="flex items-start p-4">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {message}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className={`inline-flex ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 dark:focus:ring-offset-green-900 focus:ring-green-500 rounded-md`}
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamToast; 
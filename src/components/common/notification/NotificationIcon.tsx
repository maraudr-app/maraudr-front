import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface NotificationIconProps {
    count: number;
    className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ count, className = '' }) => {
    return (
        <Link 
            to="/maraudApp/notification-manager" 
            className={`relative inline-flex items-center ${className}`}
        >
            <EnvelopeIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-orange-400 transition-colors" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
        </Link>
    );
};

export default NotificationIcon; 
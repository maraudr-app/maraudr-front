import React from 'react';
import { ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface MembershipStatusAlertProps {
    isInAssociation: boolean;
    associationName?: string;
}

export const MembershipStatusAlert: React.FC<MembershipStatusAlertProps> = ({ 
    isInAssociation, 
    associationName 
}) => {
    if (isInAssociation) return null;

    return (
        <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-orange-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Adhésion en attente de validation
                    </h3>
                    <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                        <p>
                            Votre adhésion {associationName && `à l'association "${associationName}"`} est en attente de validation 
                            par votre manager. Vous pourrez accéder à toutes les fonctionnalités une fois votre adhésion approuvée.
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 text-orange-500 mr-1" />
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                                En attendant, vous pouvez déjà consulter vos disponibilités et gérer votre profil.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 
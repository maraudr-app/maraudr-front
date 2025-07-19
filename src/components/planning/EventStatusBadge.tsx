import React from 'react';
import { Event } from '../../types/planning/event';
import { useEventBusinessRules } from '../../hooks/useEventBusinessRules';

interface EventStatusBadgeProps {
  event: Event;
  className?: string;
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
  event,
  className = ''
}) => {
  const { getEventDisplayStatus, getEventStatusColor } = useEventBusinessRules();

  const displayStatus = getEventDisplayStatus(event);
  const statusColor = getEventStatusColor(event);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor} ${className}`}>
      {displayStatus}
    </span>
  );
}; 
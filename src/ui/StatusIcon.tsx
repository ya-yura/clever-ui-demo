/**
 * 🎯 STATUS ICON
 * Визуальный индикатор статуса на основе цветовой системы
 */

import React from 'react';
import { statusColors, StatusType } from '../styles/statusColors';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';

interface StatusIconProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const iconMap: Record<StatusType, React.ComponentType<any>> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  pending: ClockIcon,
  inProgress: ArrowPathIcon,
  neutral: InformationCircleIcon,
};

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  size = 'md',
  showPulse = false,
}) => {
  const Icon = iconMap[status];
  const colorClass = statusColors[status].icon;
  const sizeClass = sizeMap[size];
  
  return (
    <div className="relative inline-flex">
      <Icon className={`${sizeClass} ${colorClass}`} />
      {showPulse && status === 'inProgress' && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping" />
      )}
    </div>
  );
};


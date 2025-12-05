// === 📁 src/components/partner/PartnerCard.tsx ===
// Partner card component for selection list

import React from 'react';
import { Employee, PartnerStats } from '@/types/partner';
import { formatRelativeTime } from '@/utils/date';
import { CheckCircle } from 'lucide-react';

interface PartnerCardProps {
  employee: Employee;
  stats?: PartnerStats;
  selected?: boolean;
  onClick?: () => void;
  showStats?: boolean;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  employee,
  stats,
  selected = false,
  onClick,
  showStats = false,
}) => {
  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-indigo-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border-2 rounded-lg p-4 transition-all cursor-pointer ${
        selected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow'
      } ${!employee.isActive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getAvatarColor(
            employee.name
          )}`}
        >
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(employee.name)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {employee.name}
            </h3>
            {employee.badge && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                #{employee.badge}
              </span>
            )}
            {!employee.isActive && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                Неактивен
              </span>
            )}
          </div>

          {/* Role and Department */}
          <div className="text-sm text-gray-600 mb-2">
            {employee.role && <span>{employee.role}</span>}
            {employee.role && employee.department && <span> • </span>}
            {employee.department && <span>{employee.department}</span>}
          </div>

          {/* Stats */}
          {showStats && stats && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-xs text-gray-500">Сессий</div>
                <div className="font-semibold text-gray-900">
                  {stats.sessionsCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Часов</div>
                <div className="font-semibold text-gray-900">
                  {stats.totalHours}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Совмест.</div>
                <div className="font-semibold text-green-600">
                  {stats.compatibility}%
                </div>
              </div>
            </div>
          )}

          {/* Last Active */}
          {employee.lastActiveAt && (
            <div className="text-xs text-gray-500 mt-2">
              🕐 {formatRelativeTime(employee.lastActiveAt)}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="flex-shrink-0">
            <CheckCircle className="text-blue-500" size={24} />
          </div>
        )}
      </div>
    </div>
  );
};


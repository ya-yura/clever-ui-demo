/**
 * 📊 PROGRESS BAR
 * Визуальный индикатор прогресса с мгновенной обратной связью
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getProgressStatus, statusColors } from '../styles/statusColors';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const heightMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  showPercentage = true,
  height = 'md',
  animated = true,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const status = getProgressStatus(current, total);
  const colors = statusColors[status];

  return (
    <div className="w-full space-y-2">
      {/* Метка прогресса */}
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">
            {current} / {total}
          </span>
          
          {showPercentage && (
            <span className={`font-bold ${colors.text}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Полоса прогресса */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightMap[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
          className={`${heightMap[height]} ${colors.vibrant} rounded-full`}
        />
      </div>
    </div>
  );
};

/**
 * 🎯 PROGRESS STATS
 * Карточка с детальной статистикой прогресса
 */
interface ProgressStatsProps {
  completed: number;
  total: number;
  inProgress?: number;
  errors?: number;
  title?: string;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  completed,
  total,
  inProgress = 0,
  errors = 0,
  title = 'Прогресс выполнения',
}) => {
  const pending = total - completed - inProgress;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      
      <ProgressBar current={completed} total={total} />
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        <StatItem
          label="Выполнено"
          value={completed}
          status="success"
        />
        
        {inProgress > 0 && (
          <StatItem
            label="В работе"
            value={inProgress}
            status="inProgress"
          />
        )}
        
        {pending > 0 && (
          <StatItem
            label="Ожидает"
            value={pending}
            status="pending"
          />
        )}
        
        {errors > 0 && (
          <StatItem
            label="Ошибки"
            value={errors}
            status="error"
          />
        )}
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  status: 'success' | 'error' | 'warning' | 'pending' | 'inProgress' | 'neutral';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, status }) => {
  const colors = statusColors[status];
  
  return (
    <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
      <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
};


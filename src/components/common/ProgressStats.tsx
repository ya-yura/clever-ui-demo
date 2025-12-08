// === 📁 src/components/common/ProgressStats.tsx ===
// Progress statistics component

import React from 'react';
import { ProgressBar } from '@/design/components';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export interface ProgressStatsData {
  completed: number;
  total: number;
  inProgress?: number;
  timeElapsed?: number;
  estimatedTimeRemaining?: number;
  averageTimePerItem?: number;
}

interface ProgressStatsProps {
  data: ProgressStatsData;
  showTimeStats?: boolean;
  showPercentage?: boolean;
  compact?: boolean;
  className?: string;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  data,
  showTimeStats = true,
  showPercentage = true,
  compact = false,
  className = '',
}) => {
  const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const remaining = data.total - data.completed;

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`;
    }
    if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    }
    return `${seconds}с`;
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-content-tertiary">Прогресс</span>
          <span className="font-bold text-content-primary">
            {data.completed} / {data.total}
            {showPercentage && ` (${percentage}%)`}
          </span>
        </div>
        <ProgressBar
          value={percentage}
          variant={percentage === 100 ? 'success' : 'primary'}
          size="sm"
          showPercentage={false}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-content-tertiary font-medium">Выполнено</span>
          <span className="text-xl font-bold text-content-primary">
            {percentage}%
          </span>
        </div>
        <ProgressBar
          value={percentage}
          variant={percentage === 100 ? 'success' : 'primary'}
          size="md"
          showPercentage={false}
        />
        <div className="flex items-center justify-between text-xs text-content-tertiary mt-1">
          <span>{data.completed} из {data.total}</span>
          <span>Осталось: {remaining}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Completed */}
        <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
          <CheckCircle2 className="text-success mx-auto mb-1" size={20} />
          <div className="text-2xl font-bold text-success">{data.completed}</div>
          <div className="text-xs text-content-tertiary mt-1">Выполнено</div>
        </div>

        {/* In Progress */}
        {data.inProgress !== undefined && (
          <div className="bg-brand-secondary/10 border border-brand-secondary/30 rounded-lg p-3 text-center">
            <TrendingUp className="text-brand-secondary mx-auto mb-1" size={20} />
            <div className="text-2xl font-bold text-brand-secondary">{data.inProgress}</div>
            <div className="text-xs text-content-tertiary mt-1">В работе</div>
          </div>
        )}

        {/* Remaining */}
        <div className="bg-surface-tertiary/50 border border-surface-tertiary rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-content-primary">{remaining}</div>
          <div className="text-xs text-content-tertiary mt-1">Осталось</div>
        </div>
      </div>

      {/* Time Statistics */}
      {showTimeStats && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {data.timeElapsed !== undefined && (
            <div className="flex items-center gap-2 bg-surface-secondary rounded-lg p-3">
              <Clock className="text-content-tertiary flex-shrink-0" size={16} />
              <div>
                <div className="text-xs text-content-tertiary">Время работы</div>
                <div className="font-semibold text-content-primary">
                  {formatTime(data.timeElapsed)}
                </div>
              </div>
            </div>
          )}

          {data.estimatedTimeRemaining !== undefined && (
            <div className="flex items-center gap-2 bg-surface-secondary rounded-lg p-3">
              <Clock className="text-brand-primary flex-shrink-0" size={16} />
              <div>
                <div className="text-xs text-content-tertiary">Осталось времени</div>
                <div className="font-semibold text-brand-primary">
                  {formatTime(data.estimatedTimeRemaining)}
                </div>
              </div>
            </div>
          )}

          {data.averageTimePerItem !== undefined && (
            <div className="col-span-2 flex items-center gap-2 bg-surface-secondary rounded-lg p-3">
              <TrendingUp className="text-success flex-shrink-0" size={16} />
              <div>
                <div className="text-xs text-content-tertiary">Среднее время на позицию</div>
                <div className="font-semibold text-success">
                  {formatTime(data.averageTimePerItem)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



// === 📁 src/components/placement/PlacementStats.tsx ===
// Statistics component for Placement module

import React from 'react';
import { PlacementLine } from '@/types/placement';

interface Props {
  lines: PlacementLine[];
}

const PlacementStats: React.FC<Props> = ({ lines }) => {
  const totalLines = lines.length;
  const completedLines = lines.filter(l => l.status === 'completed').length;
  const partialLines = lines.filter(l => l.status === 'partial').length;
  const pendingLines = lines.filter(l => l.status === 'pending').length;
  
  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);
  
  const progress = totalLines > 0 ? (completedLines / totalLines) * 100 : 0;

  return (
    <div className="card-compact space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Статистика размещения</h3>
      
      {/* Summary Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalLines}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Всего</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{completedLines}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Готово</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{partialLines}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Частично</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{pendingLines}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Ожидает</div>
        </div>
      </div>

      {/* Quantities */}
      <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Количество</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {totalFact} / {totalPlan}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">Прогресс</span>
          <span className="font-semibold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Summary Message */}
      {completedLines === totalLines && totalLines > 0 && (
        <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <span className="text-sm font-semibold text-green-800 dark:text-green-200">
            ✅ Все товары размещены!
          </span>
        </div>
      )}
    </div>
  );
};

export default PlacementStats;

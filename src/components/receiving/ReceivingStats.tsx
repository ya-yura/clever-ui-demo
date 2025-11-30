// === 📁 src/components/receiving/ReceivingStats.tsx ===
// Statistics panel for receiving module

import React from 'react';
import { ReceivingLine } from '@/types/receiving';
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface Props {
  lines: ReceivingLine[];
}

export const ReceivingStats: React.FC<Props> = ({ lines }) => {
  // Calculate statistics
  const totalLines = lines.length;
  const completedExact = lines.filter(l => l.quantityFact === l.quantityPlan && l.quantityFact > 0).length;
  const withShortage = lines.filter(l => l.quantityFact < l.quantityPlan).length;
  const withOverplan = lines.filter(l => l.quantityFact > l.quantityPlan).length;
  const notStarted = lines.filter(l => l.quantityFact === 0).length;

  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);
  const totalDiff = totalFact - totalPlan;

  const progress = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Main Progress Bar */}
      <div className="bg-surface-secondary border border-borders-default rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-content-secondary">Общий прогресс</span>
          <span className="text-lg font-bold text-content-primary">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-content-tertiary">
          <span>План: {totalPlan}</span>
          <span>Факт: {totalFact}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Completed Exact */}
        <div className="bg-success/10 border border-success/30 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-[10px] text-success uppercase tracking-wide font-semibold">Принято точно</span>
          </div>
          <div className="text-2xl font-bold text-success">{completedExact}</div>
          <div className="text-[10px] text-success/70">из {totalLines} строк</div>
        </div>

        {/* Shortage */}
        <div className="bg-error/10 border border-error/30 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-error" />
            <span className="text-[10px] text-error uppercase tracking-wide font-semibold">Недостача</span>
          </div>
          <div className="text-2xl font-bold text-error">{withShortage}</div>
          <div className="text-[10px] text-error/70">строк</div>
        </div>

        {/* Overplan */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-warning" />
            <span className="text-[10px] text-warning uppercase tracking-wide font-semibold">Излишки</span>
          </div>
          <div className="text-2xl font-bold text-warning">{withOverplan}</div>
          <div className="text-[10px] text-warning/70">{totalDiff > 0 ? `+${totalDiff} шт.` : 'строк'}</div>
        </div>

        {/* Not Started */}
        <div className="bg-surface-tertiary/50 border border-borders-default rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-content-tertiary" />
            <span className="text-[10px] text-content-tertiary uppercase tracking-wide font-semibold">Не начато</span>
          </div>
          <div className="text-2xl font-bold text-content-secondary">{notStarted}</div>
          <div className="text-[10px] text-content-tertiary">строк</div>
        </div>
      </div>

      {/* Summary Message */}
      {totalDiff !== 0 && (
        <div className={`rounded-lg p-2 text-sm ${
          totalDiff > 0 
            ? 'bg-warning/10 border border-warning/30 text-warning'
            : 'bg-error/10 border border-error/30 text-error'
        }`}>
          {totalDiff > 0 ? (
            <span>⚠️ Принято <strong>на {totalDiff} шт. больше</strong> плана</span>
          ) : (
            <span>⚠️ Принято <strong>на {Math.abs(totalDiff)} шт. меньше</strong> плана</span>
          )}
        </div>
      )}

      {totalDiff === 0 && totalFact > 0 && completedExact === totalLines && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-2 text-sm text-success">
          ✅ Все товары приняты <strong>согласно плану</strong>
        </div>
      )}
    </div>
  );
};

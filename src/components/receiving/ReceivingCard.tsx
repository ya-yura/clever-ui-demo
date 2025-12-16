// === 📁 src/components/receiving/ReceivingCard.tsx ===
// Product card for receiving module

import React from 'react';
import { ReceivingLine } from '@/types/receiving';

interface Props {
  line: ReceivingLine;
  onAdjust: (delta: number) => void;
}

const ReceivingCard: React.FC<Props> = ({ line, onAdjust }) => {
  const statusColor =
    line.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-500/50' :
    line.status === 'partial' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-500/50' :
    line.status === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-500/50' :
    'bg-surface-secondary border-border-default';

  const difference = line.quantityFact - line.quantityPlan;
  const showDifference = difference !== 0;

  return (
    <div className={`card border-2 ${statusColor} transition-colors p-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-col space-y-0.5 mb-0.5">
            <h3 className="font-semibold text-content-primary leading-tight">
              {line.productName}
            </h3>
            <p className="text-sm text-content-secondary leading-tight">
              Артикул: {line.productSku}
            </p>
            {line.barcode && (
              <p className="text-xs text-content-tertiary leading-tight">
                ШК: {line.barcode}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 text-center mt-1">
            <div className="atom-chip p-1">
              <div className="text-xs text-content-secondary">План</div>
              <div className="text-base font-bold text-content-primary leading-tight">
                {line.quantityPlan}
              </div>
            </div>
            <div className="atom-chip p-1">
              <div className="text-xs text-content-secondary">Факт</div>
              <div className="text-base font-bold text-brand-primary leading-tight">
                {line.quantityFact}
              </div>
            </div>
            <div className="atom-chip p-1">
              <div className="text-xs text-content-secondary">Остаток</div>
              <div className={`text-base font-bold leading-tight ${
                showDifference 
                  ? difference > 0 
                    ? 'text-warning' 
                    : 'text-error'
                  : 'text-success'
              }`}>
                {Math.abs(line.quantityPlan - line.quantityFact)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 mt-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onAdjust(-1); }}
          className="btn-secondary flex-1 border border-border-default h-12 text-base font-semibold"
          disabled={line.quantityFact === 0}
        >
          −1
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAdjust(1); }}
          className="btn-primary flex-1 h-12 text-base font-semibold"
        >
          +1
        </button>
      </div>

      {showDifference && (
        <div
          className={`mt-1 px-2.5 py-1.5 rounded text-sm font-semibold text-center shadow-sm ${
            difference > 0
              ? 'bg-warning/30 text-warning-dark'
              : 'bg-error/30 text-error-dark'
          }`}
        >
          {difference > 0 ? '⚠️ Излишки' : '⚠️ Недостача'}: {Math.abs(difference)} шт.
        </div>
      )}
    </div>
  );
};

export default ReceivingCard;


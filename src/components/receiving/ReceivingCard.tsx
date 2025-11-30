// === 📁 src/components/receiving/ReceivingCard.tsx ===
// Product card for receiving module

import React, { useState } from 'react';
import { ReceivingLine } from '@/types/receiving';
import { Package, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';

interface Props {
  line: ReceivingLine;
  onAdjust: (delta: number) => void;
  onSetQuantity: (quantity: number) => void;
  isHighlighted?: boolean;
}

const ReceivingCard: React.FC<Props> = ({ line, onAdjust, onSetQuantity, isHighlighted = false }) => {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [editValue, setEditValue] = useState(line.quantityFact.toString());
  const [showDetails, setShowDetails] = useState(false);

  const difference = line.quantityFact - line.quantityPlan;
  const isOverPlan = difference > 0;
  const isUnderPlan = difference < 0;
  const isExact = difference === 0 && line.quantityFact > 0;
  
  // Status colors:
  // - "pending" (not started) = GREEN (needs attention)
  // - "completed" = GRAY (done, low priority)
  // - "partial" (in progress) = BLUE (active work)
  // - "over plan" = WARNING
  const statusColor = 
    line.status === 'pending' ? 'bg-emerald-500/10 border-emerald-500/30' :
    line.status === 'completed' && isOverPlan ? 'bg-warning/10 border-warning/30' :
    line.status === 'completed' ? 'bg-[#363636] border-[#4f4f4f]' :
    line.status === 'partial' ? 'bg-info/10 border-info/30' :
    line.status === 'error' ? 'bg-error/10 border-error/30' :
    'bg-surface-secondary border-borders-default';

  const handleSaveQuantity = () => {
    const newQty = parseInt(editValue, 10);
    if (!isNaN(newQty) && newQty >= 0) {
      onSetQuantity(newQty);
      setIsEditingQty(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(line.quantityFact.toString());
    setIsEditingQty(false);
  };

  return (
    <div className={`rounded-lg border-2 ${statusColor} ${isHighlighted ? 'ring-2 ring-brand-primary shadow-lg' : ''} transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <div className="bg-surface-tertiary/30 px-3 py-2 border-b border-borders-default">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Package className="w-5 h-5 text-content-tertiary shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-content-primary truncate text-sm">
                {line.productName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-content-secondary">
                  {line.productSku}
                </p>
                {line.barcode && (
                  <p className="text-[10px] text-content-tertiary font-mono bg-surface-tertiary px-1.5 py-0.5 rounded">
                    {line.barcode}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Icon */}
          {line.status === 'pending' && (
            <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          {isExact && line.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-[#6a6a6a] shrink-0" />
          )}
          {isOverPlan && (
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          )}
          {line.status === 'partial' && (
            <AlertTriangle className="w-5 h-5 text-info shrink-0" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Quantity Display */}
        <div className="grid grid-cols-3 gap-2">
          {/* Plan */}
          <div className="bg-surface-tertiary/50 rounded-lg p-2 text-center border border-borders-default">
            <div className="text-[10px] text-content-tertiary uppercase tracking-wide mb-0.5">План</div>
            <div className="text-lg font-bold text-content-primary">
              {line.quantityPlan}
            </div>
          </div>
          
          {/* Fact */}
          <div className="bg-surface-tertiary/50 rounded-lg p-2 text-center border border-borders-default">
            <div className="text-[10px] text-content-tertiary uppercase tracking-wide mb-0.5">Факт</div>
            {isEditingQty ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveQuantity}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveQuantity();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="w-full text-lg font-bold text-center bg-transparent border-none focus:outline-none text-brand-primary"
                autoFocus
              />
            ) : (
              <div className="text-lg font-bold text-brand-primary">
                {line.quantityFact}
              </div>
            )}
          </div>
          
          {/* Difference */}
          <div className="bg-surface-tertiary/50 rounded-lg p-2 text-center border border-borders-default">
            <div className="text-[10px] text-content-tertiary uppercase tracking-wide mb-0.5">
              {Math.abs(difference) === 0 ? 'OK' : isOverPlan ? 'Лишнее' : 'Недостача'}
            </div>
            <div className={`text-lg font-bold ${
              difference === 0 ? 'text-success' :
              isOverPlan ? 'text-warning' :
              'text-error'
            }`}>
              {difference === 0 ? '✓' : Math.abs(difference)}
            </div>
          </div>
        </div>

        {/* Quick Actions Row 1: -1, +1, Edit */}
        <div className="flex gap-2">
          <button
            onClick={() => onAdjust(-1)}
            className="flex-1 bg-surface-secondary hover:bg-surface-tertiary text-content-primary border border-borders-default rounded-lg py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={line.quantityFact === 0}
          >
            −1
          </button>
          <button
            onClick={() => onAdjust(1)}
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg py-2 font-semibold transition-colors"
          >
            +1
          </button>
          <button
            onClick={() => {
              setEditValue(line.quantityFact.toString());
              setIsEditingQty(true);
            }}
            className="px-3 bg-surface-secondary hover:bg-surface-tertiary text-content-secondary border border-borders-default rounded-lg transition-colors"
            title="Ввести вручную"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions Row 2: +5, +10 */}
        <div className="flex gap-2">
          <button
            onClick={() => onAdjust(5)}
            className="flex-1 bg-surface-secondary hover:bg-surface-tertiary text-content-primary border border-borders-default rounded-lg py-2 font-semibold transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => onAdjust(10)}
            className="flex-1 bg-surface-secondary hover:bg-surface-tertiary text-content-primary border border-borders-default rounded-lg py-2 font-semibold transition-colors"
          >
            +10
          </button>
          <button
            onClick={() => onSetQuantity(line.quantityPlan)}
            className="flex-1 bg-info/20 hover:bg-info/30 text-info border border-info/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            По плану
          </button>
        </div>

        {/* Status Messages */}
        {line.status === 'pending' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-300">
              <span className="font-semibold">Не начато:</span> нужно принять {line.quantityPlan} шт.
            </div>
          </div>
        )}
        
        {isOverPlan && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <div className="text-xs text-warning">
              <span className="font-semibold">Излишки:</span> {difference} шт. сверх плана
            </div>
          </div>
        )}
        
        {isUnderPlan && line.quantityFact > 0 && (
          <div className="bg-info/10 border border-info/30 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-info shrink-0" />
            <div className="text-xs text-info">
              <span className="font-semibold">В работе:</span> осталось принять {Math.abs(difference)} шт.
            </div>
          </div>
        )}
        
        {isExact && line.status === 'completed' && (
          <div className="bg-[#363636] border border-[#4f4f4f] rounded-lg p-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#6a6a6a] shrink-0" />
            <div className="text-xs text-[#8a8a8a]">
              <span className="font-semibold">Готово:</span> принято {line.quantityPlan} шт.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivingCard;


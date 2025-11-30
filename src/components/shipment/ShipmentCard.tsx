// === 📁 src/components/shipment/ShipmentCard.tsx ===
// Shipment line card component

import React, { useState } from 'react';
import { Minus, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { ShipmentLine } from '@/types/shipment';

interface Props {
  line: ShipmentLine;
  isHighlighted?: boolean;
  onSetQuantity?: (lineId: string, quantity: number) => void;
}

const ShipmentCard: React.FC<Props> = ({ line, isHighlighted, onSetQuantity }) => {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [manualQty, setManualQty] = useState(line.quantityFact.toString());

  const remaining = line.quantityPlan - line.quantityFact;
  const isExact = line.quantityFact === line.quantityPlan;
  const isOverPlan = line.quantityFact > line.quantityPlan;

  const statusColor =
    isExact ? 'border-[#4f4f4f] bg-[#363636]' :
    isOverPlan ? 'border-amber-500/50 bg-amber-500/10' :
    line.quantityFact > 0 ? 'border-blue-500/50 bg-blue-500/10' :
    'border-emerald-500/40 bg-emerald-500/10';

  const statusIcon =
    isExact ? <CheckCircle2 className="w-5 h-5 text-[#6a6a6a]" /> :
    isOverPlan ? <AlertCircle className="w-5 h-5 text-amber-400" /> :
    line.quantityFact > 0 ? <AlertCircle className="w-5 h-5 text-blue-400" /> :
    <AlertCircle className="w-5 h-5 text-emerald-400" />;

  const progress = line.quantityPlan > 0 ? Math.min((line.quantityFact / line.quantityPlan) * 100, 100) : 0;

  const handleManualQtySubmit = () => {
    const qty = parseInt(manualQty);
    if (!isNaN(qty) && qty >= 0 && onSetQuantity) {
      onSetQuantity(line.id, qty);
    }
    setIsEditingQty(false);
  };

  const handleSetToPlan = () => {
    if (onSetQuantity) {
      onSetQuantity(line.id, line.quantityPlan);
    }
  };

  const handleIncrement = (amount: number) => {
    if (onSetQuantity) {
      onSetQuantity(line.id, Math.max(0, line.quantityFact + amount));
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-4 transition-all ${statusColor} ${
        isHighlighted ? 'ring-2 ring-orange-500 shadow-lg scale-[1.02]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl">{statusIcon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {line.productName}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Артикул: {line.productSku}
          </p>
          {line.packageId && (
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              📦 Упаковка: {line.packageId}
            </p>
          )}
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">План</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {line.quantityPlan}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Проверено</div>
          <div className={`text-lg font-bold ${
            isExact ? 'text-green-600' : isOverPlan ? 'text-red-600' : 'text-orange-600'
          }`}>
            {line.quantityFact}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Остаток</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {remaining > 0 ? remaining : 0}
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      {onSetQuantity && line.status !== 'completed' && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            {isEditingQty ? (
              <>
                <input
                  type="number"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualQtySubmit()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold"
                  autoFocus
                />
                <button
                  onClick={handleManualQtySubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setIsEditingQty(false);
                    setManualQty(line.quantityFact.toString());
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleIncrement(-1)}
                  disabled={line.quantityFact === 0}
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setIsEditingQty(true)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-900 dark:text-white hover:border-orange-500 transition-colors"
                >
                  {line.quantityFact}
                </button>
                <button
                  onClick={() => handleIncrement(1)}
                  className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {!isEditingQty && (
            <div className="flex gap-2">
              <button
                onClick={handleSetToPlan}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                По плану ({line.quantityPlan})
              </button>
              <button
                onClick={() => handleIncrement(5)}
                className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                +5
              </button>
              <button
                onClick={() => handleIncrement(10)}
                className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                +10
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isExact ? 'bg-[#4f4f4f]' : isOverPlan ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Messages */}
      {isOverPlan && (
        <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-sm text-amber-300 font-semibold text-center">
          ⚠️ Лишний товар: {line.quantityFact - line.quantityPlan}
        </div>
      )}
      {isHighlighted && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-700">
          <p className="text-sm text-orange-700 dark:text-orange-300 font-semibold text-center animate-pulse">
            ✓ Проверено
          </p>
        </div>
      )}
    </div>
  );
};

export default ShipmentCard;

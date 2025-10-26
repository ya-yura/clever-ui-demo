// === 📁 src/components/picking/PickingCard.tsx ===
// Product card for picking module

import React from 'react';
import { PickingLine } from '@/types/picking';

interface Props {
  line: PickingLine;
  isActive?: boolean;
  routeOrder?: number;
}

const PickingCard: React.FC<Props> = ({ line, isActive, routeOrder }) => {
  const statusColor = 
    line.status === 'completed' ? 'bg-[#2d6b2d] border-[#91ed91]' :
    line.status === 'partial' ? 'bg-[#8b5931] border-[#f3a361]' :
    isActive ? 'bg-[#2d7a6b] border-[#86e0cb]' :
    'bg-[#2a2a2c] border-[#474747]';

  const statusIcon =
    line.status === 'completed' ? '✅' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusColor} transition-all ${
        isActive ? 'ring-2 ring-blue-400 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {routeOrder !== undefined && (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {routeOrder}
              </div>
            )}
            <span className="text-2xl">{statusIcon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-[#e3e3dd]">
                {line.productName}
              </h3>
              <p className="text-sm text-[#a7a7a7]">
                Артикул: {line.productSku}
              </p>
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-[#a7a7a7]">Ячейка:</span>
              <span className="font-bold text-lg text-[#86e0cb] bg-[#2d7a6b] px-3 py-1 rounded">
                📍 {line.cellName}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">План</div>
              <div className="text-lg font-bold text-[#e3e3dd]">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Подобрано</div>
              <div className="text-lg font-bold text-[#91ed91]">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Осталось</div>
              <div className="text-lg font-bold text-[#86e0cb]">
                {remaining}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {line.quantityPlan > 0 && (
        <div className="mt-4">
          <div className="w-full bg-[#474747] rounded-full h-2">
            <div
              className="bg-[#91ed91] h-2 rounded-full transition-all"
              style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isActive && (
        <div className="mt-3 p-2 bg-[#2d7a6b] border border-[#86e0cb] rounded text-center">
          <p className="text-sm font-semibold text-[#86e0cb]">
            👆 Отсканируйте товар из этой ячейки
          </p>
        </div>
      )}
    </div>
  );
};

export default PickingCard;


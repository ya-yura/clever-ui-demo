// === 📁 src/components/placement/PlacementCard.tsx ===
// Product card for placement module

import React from 'react';
import { PlacementLine } from '@/types/placement';

interface Props {
  line: PlacementLine;
  isActive?: boolean;
  onSelect?: () => void;
}

const PlacementCard: React.FC<Props> = ({ line, isActive, onSelect }) => {
  const statusColor = 
    line.status === 'completed' ? 'bg-[#2d6b2d] border-[#91ed91]' :
    line.status === 'partial' ? 'bg-[#8b5931] border-[#f3a361]' :
    isActive ? 'bg-[#2d7a6b] border-[#86e0cb]' :
    'bg-[#2a2a2c] border-[#474747]';

  const statusIcon =
    line.status === 'completed' ? '🟢' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusColor} transition-all cursor-pointer ${
        isActive ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{statusIcon}</span>
            <div>
              <h3 className="font-semibold text-[#e3e3dd]">
                {line.productName}
              </h3>
              <p className="text-sm text-[#a7a7a7]">
                Артикул: {line.productSku}
              </p>
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3 space-y-2">
            {line.suggestedCellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-[#a7a7a7]">Рекомендуемая ячейка:</span>
                <span className="font-semibold text-[#86e0cb] bg-[#2d7a6b] px-2 py-1 rounded">
                  📍 {line.suggestedCellName}
                </span>
              </div>
            )}
            {line.cellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-[#a7a7a7]">Текущая ячейка:</span>
                <span className="font-semibold text-[#91ed91] bg-[#2d6b2d] px-2 py-1 rounded">
                  ✓ {line.cellName}
                </span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Всего</div>
              <div className="text-lg font-bold text-[#e3e3dd]">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Размещено</div>
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
    </div>
  );
};

export default PlacementCard;


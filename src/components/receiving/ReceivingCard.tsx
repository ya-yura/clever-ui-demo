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
    line.status === 'completed' ? 'bg-[#2d6b2d] border-[#91ed91]' :
    line.status === 'partial' ? 'bg-[#8b5931] border-[#f3a361]' :
    line.status === 'error' ? 'bg-[#6b3d3c] border-[#ba8f8e]' :
    'bg-[#2a2a2c] border-[#474747]';

  const statusIcon =
    line.status === 'completed' ? '🟢' :
    line.status === 'partial' ? '🟡' :
    line.status === 'error' ? '🔴' :
    '⚪';

  const difference = line.quantityFact - line.quantityPlan;
  const showDifference = difference !== 0;

  return (
    <div className={`card border-2 ${statusColor} transition-colors`}>
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
              {line.barcode && (
                <p className="text-xs text-[#a7a7a7]">
                  ШК: {line.barcode}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">План</div>
              <div className="text-lg font-bold text-[#e3e3dd]">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Факт</div>
              <div className="text-lg font-bold text-[#86e0cb]">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-[#343436] border border-[#474747] rounded p-2">
              <div className="text-xs text-[#a7a7a7]">Остаток</div>
              <div className={`text-lg font-bold ${
                showDifference 
                  ? difference > 0 
                    ? 'text-[#f0e78d]' 
                    : 'text-[#ba8f8e]'
                  : 'text-[#91ed91]'
              }`}>
                {Math.abs(line.quantityPlan - line.quantityFact)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onAdjust(-1)}
          className="btn-secondary flex-1"
          disabled={line.quantityFact === 0}
        >
          −1
        </button>
        <button
          onClick={() => onAdjust(1)}
          className="btn-primary flex-1"
        >
          +1
        </button>
      </div>

      {showDifference && (
        <div className={`mt-2 p-2 rounded text-sm text-center ${
          difference > 0 
            ? 'bg-[#8b5931] text-[#f0e78d]'
            : 'bg-[#6b3d3c] text-[#ba8f8e]'
        }`}>
          {difference > 0 ? '⚠️ Излишки' : '⚠️ Недостача'}: {Math.abs(difference)} шт.
        </div>
      )}
    </div>
  );
};

export default ReceivingCard;


import React from 'react';
import { MapPin, Package, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface PickingInstructionsProps {
  currentStep: 'scanCell' | 'scanProducts' | 'completed';
  currentCellName?: string;
  productsCount?: number;
  scannedProductsCount?: number;
}

/**
 * Компонент инструкций для подбора заказа
 * Показывает пользователю, что нужно делать на каждом этапе
 */
export const PickingInstructions: React.FC<PickingInstructionsProps> = ({
  currentStep,
  currentCellName,
  productsCount = 0,
  scannedProductsCount = 0,
}) => {
  if (currentStep === 'completed') {
    return null;
  }

  return (
    <div className="bg-info/10 border border-info/30 rounded-lg p-2.5 mb-1.5">
      <div className="flex items-start gap-2">
        <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {currentStep === 'scanCell' ? (
            <>
              <div className="font-bold text-xs text-info-dark mb-1">
                ШАГ 1: Отсканируйте ячейку
              </div>
              <div className="text-[10px] text-content-secondary leading-relaxed space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-info flex-shrink-0" />
                  <span>Найдите ячейку <strong className="text-info-dark">{currentCellName || '—'}</strong> на складе</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-info flex-shrink-0" />
                  <span>Отсканируйте штрих-код ячейки сканером</span>
                </div>
                <div className="text-[9px] text-content-tertiary mt-1 italic">
                  После сканирования ячейки вы увидите список товаров для подбора
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-xs text-info-dark mb-1">
                ШАГ 2: Подберите товары из ячейки
              </div>
              <div className="text-[10px] text-content-secondary leading-relaxed space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-success flex-shrink-0" />
                  <span>Ячейка <strong className="text-info-dark">{currentCellName}</strong> отсканирована</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-info flex-shrink-0" />
                  <span>Отсканируйте штрих-коды товаров из списка ниже</span>
                </div>
                <div className="text-[9px] text-content-tertiary mt-1">
                  Прогресс: <strong className="text-info-dark">{scannedProductsCount} из {productsCount}</strong> товаров подобрано
                </div>
                <div className="text-[9px] text-content-tertiary mt-0.5 italic">
                  Или используйте кнопки +1 / Всё для ручного добавления количества
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};



import React from 'react';
import { MapPin, CheckCircle, ArrowRight, Circle } from 'lucide-react';

interface RouteStep {
  cellId: string;
  cellName: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    picked: number;
  }>;
  status: 'pending' | 'current' | 'completed' | 'skipped';
}

interface RouteVisualizationProps {
  route: RouteStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

/**
 * Визуализация маршрута подбора
 * US III.1: Показ маршрута с индикатором прогресса
 */
export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  currentStepIndex,
  onStepClick,
}) => {
  const progress = route.length > 0 ? ((currentStepIndex + 1) / route.length) * 100 : 0;

  return (
    <div className="bg-surface-secondary rounded-lg p-4 space-y-4">
      {/* Заголовок и прогресс */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Карта маршрута</h3>
          <span className="text-sm font-mono">
            {currentStepIndex + 1} / {route.length}
          </span>
        </div>
        <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Линейная карта маршрута */}
      <div className="relative">
        {/* Линия маршрута */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-surface-tertiary" />
        <div
          className="absolute top-6 left-0 h-1 bg-brand-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        {/* Ячейки на линии */}
        <div className="relative flex justify-between">
          {route.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isCompleted = step.status === 'completed';
            const isSkipped = step.status === 'skipped';
            const isPast = index < currentStepIndex;

            return (
              <div
                key={step.cellId}
                onClick={() => onStepClick?.(index)}
                className="flex flex-col items-center cursor-pointer"
                style={{ width: `${100 / route.length}%` }}
              >
                {/* Точка на линии */}
                <div
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all z-10 ${
                    isCurrent
                      ? 'border-brand-primary bg-brand-primary shadow-lg scale-125'
                      : isCompleted
                      ? 'border-success bg-success'
                      : isSkipped
                      ? 'border-warning bg-warning'
                      : isPast
                      ? 'border-surface-tertiary bg-surface-tertiary'
                      : 'border-surface-tertiary bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} className="text-white" />
                  ) : isSkipped ? (
                    <Circle size={20} className="text-white" />
                  ) : isCurrent ? (
                    <MapPin size={20} className="text-white" />
                  ) : (
                    <span className="text-xs font-bold text-content-tertiary">{index + 1}</span>
                  )}
                </div>

                {/* Название ячейки */}
                <div className="mt-2 text-center max-w-20">
                  <div className={`font-bold text-sm truncate ${
                    isCurrent ? 'text-brand-primary' : isCompleted ? 'text-success' : ''
                  }`}>
                    {step.cellName}
                  </div>
                  <div className="text-xs text-content-tertiary">
                    {step.products.length} шт
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};







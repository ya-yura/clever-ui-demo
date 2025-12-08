// === 📁 src/components/common/ProductCard.tsx ===
// Enhanced product card with swipe actions and visual feedback

import React, { useState, useRef } from 'react';
import { Card, ProgressBar, Badge } from '@/design/components';
import { ChevronRight, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { useSwipe } from '@/hooks/useSwipe';

export interface ProductCardData {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  plannedQuantity: number;
  actualQuantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  unit?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  onClick?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onLongPress?: () => void;
  showImage?: boolean;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onIncrement,
  onDecrement,
  onLongPress,
  showImage = true,
  compact = false,
}) => {
  const [swipeAction, setSwipeAction] = useState<'increment' | 'decrement' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const progress = product.plannedQuantity > 0
    ? Math.round((product.actualQuantity / product.plannedQuantity) * 100)
    : 0;

  const isCompleted = product.actualQuantity >= product.plannedQuantity;
  const isOverQuantity = product.actualQuantity > product.plannedQuantity;

  // Swipe handling
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      setSwipeAction('decrement');
      setTimeout(() => {
        onDecrement?.();
        setSwipeAction(null);
      }, 200);
    },
    onSwipeRight: () => {
      setSwipeAction('increment');
      setTimeout(() => {
        onIncrement?.();
        setSwipeAction(null);
      }, 200);
    },
    threshold: 50,
  });

  // Long press handling
  const handleTouchStart = (e: React.TouchEvent) => {
    onTouchStart(e);
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    onTouchEnd(e);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const getStatusColor = () => {
    if (isOverQuantity) return 'bg-warning/10 border-warning/30';
    if (isCompleted) return 'bg-success/10 border-success/30';
    if (product.actualQuantity > 0) return 'bg-brand-secondary/10 border-brand-secondary/30';
    return 'bg-surface-secondary border-surface-tertiary';
  };

  if (compact) {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden transition-all duration-200 ${
          swipeAction === 'increment' ? 'translate-x-2' : ''
        } ${swipeAction === 'decrement' ? '-translate-x-2' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
      >
        <Card className={`p-3 border ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="text-success" size={24} />
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 ${
                  product.actualQuantity > 0 
                    ? 'border-brand-secondary bg-brand-secondary/20' 
                    : 'border-content-tertiary'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-content-primary truncate">
                {product.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-content-tertiary mt-0.5">
                <span className="font-mono">{product.sku}</span>
                <span>•</span>
                <span className={`font-bold ${
                  isOverQuantity ? 'text-warning' : 
                  isCompleted ? 'text-success' : 'text-content-primary'
                }`}>
                  {product.actualQuantity} / {product.plannedQuantity}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="text-content-tertiary flex-shrink-0" size={20} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden transition-all duration-200 ${
        swipeAction === 'increment' ? 'translate-x-4' : ''
      } ${swipeAction === 'decrement' ? '-translate-x-4' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <Card className={`p-4 border ${getStatusColor()}`}>
        <div className="flex gap-3">
          {/* Image */}
          {showImage && (
            <div className="flex-shrink-0 w-16 h-16 bg-surface-tertiary rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  📦
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-content-primary mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-content-tertiary">
                  {product.sku && (
                    <>
                      <span className="font-mono">{product.sku}</span>
                      <span>•</span>
                    </>
                  )}
                  {product.barcode && (
                    <span className="font-mono">{product.barcode}</span>
                  )}
                </div>
              </div>
              
              {isCompleted && (
                <CheckCircle2 className="text-success flex-shrink-0 ml-2" size={24} />
              )}
            </div>

            {/* Quantity Display - Крупно */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-content-tertiary">
                  План / Факт
                </span>
                <span className={`text-2xl font-bold ${
                  isOverQuantity ? 'text-warning' : 
                  isCompleted ? 'text-success' : 'text-brand-primary'
                }`}>
                  {product.actualQuantity}
                  <span className="text-lg text-content-tertiary"> / {product.plannedQuantity}</span>
                  {product.unit && (
                    <span className="text-sm text-content-tertiary ml-1">{product.unit}</span>
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                value={Math.min(progress, 100)}
                variant={isOverQuantity ? 'warning' : isCompleted ? 'success' : 'primary'}
                size="md"
                showPercentage={false}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onDecrement && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecrement();
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
                  disabled={product.actualQuantity === 0}
                >
                  <Minus size={20} />
                </button>
              )}

              <div className="flex-1 text-center">
                <div className="text-xs text-content-tertiary">
                  {isOverQuantity && '⚠️ Превышение'}
                  {isCompleted && !isOverQuantity && '✓ Выполнено'}
                  {!isCompleted && !isOverQuantity && `Осталось: ${product.plannedQuantity - product.actualQuantity}`}
                </div>
              </div>

              {onIncrement && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrement();
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>

            {/* Swipe Hint */}
            <div className="mt-2 text-xs text-content-tertiary text-center">
              ← Свайп для быстрых действий →
            </div>
          </div>
        </div>
      </Card>

      {/* Swipe Action Indicators */}
      {swipeAction && (
        <div className={`absolute inset-y-0 ${
          swipeAction === 'increment' ? 'left-0' : 'right-0'
        } w-16 flex items-center justify-center bg-${
          swipeAction === 'increment' ? 'success' : 'error'
        }/20 pointer-events-none`}>
          {swipeAction === 'increment' ? (
            <Plus className="text-success" size={32} />
          ) : (
            <Minus className="text-error" size={32} />
          )}
        </div>
      )}
    </div>
  );
};



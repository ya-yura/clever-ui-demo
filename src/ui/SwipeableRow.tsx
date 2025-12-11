/**
 * 👆 SWIPEABLE ROW
 * Свайпы для быстрого изменения количества
 * Снижает когнитивную нагрузку и ускоряет работу
 */

import React, { useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  threshold?: number;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
}) => {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const leftOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, threshold], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Левое действие */}
      {leftAction && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className={`absolute inset-y-0 left-0 flex items-center justify-start px-6 ${leftAction.color}`}
        >
          <div className="flex items-center gap-2 text-white font-medium">
            {leftAction.icon}
            <span>{leftAction.label}</span>
          </div>
        </motion.div>
      )}

      {/* Правое действие */}
      {rightAction && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-6 ${rightAction.color}`}
        >
          <div className="flex items-center gap-2 text-white font-medium">
            <span>{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </motion.div>
      )}

      {/* Контент */}
      <motion.div
        drag="x"
        dragConstraints={{ left: leftAction ? -threshold * 1.5 : 0, right: rightAction ? threshold * 1.5 : 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`relative bg-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * 🔢 QUANTITY SWIPE ROW
 * Специализированная строка для изменения количества свайпами
 */
interface QuantitySwipeRowProps {
  children: React.ReactNode;
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease?: boolean;
  canDecrease?: boolean;
}

export const QuantitySwipeRow: React.FC<QuantitySwipeRowProps> = ({
  children,
  onIncrease,
  onDecrease,
  canIncrease = true,
  canDecrease = true,
}) => {
  return (
    <SwipeableRow
      onSwipeRight={canIncrease ? onIncrease : undefined}
      onSwipeLeft={canDecrease ? onDecrease : undefined}
      leftAction={
        canDecrease
          ? {
              icon: <span className="text-xl">−</span>,
              label: 'Уменьшить',
              color: 'bg-red-500',
            }
          : undefined
      }
      rightAction={
        canIncrease
          ? {
              icon: <span className="text-xl">+</span>,
              label: 'Увеличить',
              color: 'bg-green-500',
            }
          : undefined
      }
    >
      {children}
    </SwipeableRow>
  );
};


// === 📁 src/components/common/SwipeableRow.tsx ===
// Swipeable row component with reveal actions

import React, { useRef, useState } from 'react';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: 'success' | 'error' | 'warning' | 'info';
  onAction: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className = '',
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<'left' | 'right' | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const maxSwipe = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const deltaX = e.touches[0].clientX - touchStart.current.x;
    const newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Check if threshold reached for action
    if (offset > threshold && leftActions.length > 0) {
      triggerAction('left');
    } else if (offset < -threshold && rightActions.length > 0) {
      triggerAction('right');
    } else {
      // Reset to center
      setOffset(0);
    }
    
    touchStart.current = null;
  };

  const triggerAction = (direction: 'left' | 'right') => {
    setActionTriggered(direction);

    // Execute action
    const actions = direction === 'left' ? leftActions : rightActions;
    if (actions.length > 0) {
      actions[0].onAction();
    }

    // Animate completion and reset
    setTimeout(() => {
      setOffset(0);
      setActionTriggered(null);
    }, 300);
  };

  const getActionColor = (color: SwipeAction['color']) => {
    switch (color) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-error text-white';
      case 'warning':
        return 'bg-warning text-white';
      case 'info':
        return 'bg-info text-white';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-stretch">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.onAction()}
              className={`flex items-center justify-center px-6 ${getActionColor(action.color)} transition-all`}
              style={{
                width: offset > 0 ? `${Math.min(100, offset)}px` : '0px',
                opacity: offset > 20 ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                {offset > 60 && (
                  <span className="text-xs font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-stretch">
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.onAction()}
              className={`flex items-center justify-center px-6 ${getActionColor(action.color)} transition-all`}
              style={{
                width: offset < 0 ? `${Math.min(100, Math.abs(offset))}px` : '0px',
                opacity: offset < -20 ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                {offset < -60 && (
                  <span className="text-xs font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        ref={rowRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative transition-transform ${
          isDragging ? 'duration-0' : 'duration-300'
        } ${actionTriggered ? 'opacity-0' : 'opacity-100'}`}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

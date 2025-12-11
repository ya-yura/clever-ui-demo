/**
 * 💬 MICRO HINT
 * Контекстные подсказки для направления пользователя
 * Основано на принципе "Immediate Contextual Guidance" (Джеки Рид)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';
import { StatusIcon } from './StatusIcon';

interface MicroHintProps {
  message: string;
  status?: StatusType;
  showIcon?: boolean;
  duration?: number;
  onDismiss?: () => void;
  persistent?: boolean;
}

export const MicroHint: React.FC<MicroHintProps> = ({
  message,
  status = 'neutral',
  showIcon = true,
  duration = 0,
  onDismiss,
  persistent = false,
}) => {
  const [visible, setVisible] = useState(true);
  const colors = statusColors[status];

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, persistent, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg
            ${colors.bg} ${colors.border} border
            shadow-sm
          `}
        >
          {showIcon && <StatusIcon status={status} size="sm" />}
          <span className={`text-sm font-medium ${colors.text}`}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 📍 MICRO HINT OVERLAY
 * Всегда видимая подсказка, закрепленная в определенной позиции экрана
 */
interface MicroHintOverlayProps extends MicroHintProps {
  position?: 'top' | 'bottom' | 'center';
}

export const MicroHintOverlay: React.FC<MicroHintOverlayProps> = ({
  position = 'top',
  ...props
}) => {
  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4',
    center: 'top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 ${positionClasses[position]} z-50 max-w-md w-full px-4`}>
      <MicroHint {...props} />
    </div>
  );
};

